import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EnvelopeAnimation from '../components/letter/EnvelopeAnimation';
import FloatingParticles from '../components/letter/FloatingParticles';
import LetterContent from '../components/letter/LetterContent';
import PolaroidGallery from '../components/letter/PolaroidGallery';
import CollageView from '../components/letter/CollageView';
import MusicPlayer from '../components/letter/MusicPlayer';
import VoicePopup from '../components/letter/VoicePopup';
import QRCodeModal from '../components/common/QRCodeModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

export default function LetterPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [letter, setLetter] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [playMode, setPlayMode] = useState(null); // 'letter' or 'voice'
  const [shouldPlayMusic, setShouldPlayMusic] = useState(false);
  const [showCollage, setShowCollage] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Voice audio ref
  const [voiceAudio] = useState(() => typeof Audio !== 'undefined' ? new Audio() : null);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // Fetch letter data
  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const { data: letterData, error: letterError } = await supabase
          .from('letters')
          .select('*')
          .eq('code', code.toLowerCase())
          .single();

        if (letterError || !letterData) {
          setError('Letter not found');
          setLoading(false);
          return;
        }

        // Resolve music URL from storage if it's an uploaded file
        if (letterData.music_type === 'upload' && letterData.music_url) {
          const { data: urlData } = supabase.storage
            .from('audio')
            .getPublicUrl(letterData.music_url);
          letterData.resolved_music_url = urlData?.publicUrl || '';
        } else {
          letterData.resolved_music_url = letterData.music_url || '';
        }

        // Resolve voice URL from storage
        if (letterData.voice_url) {
          const { data: voiceUrlData } = supabase.storage
            .from('audio')
            .getPublicUrl(letterData.voice_url);
          letterData.resolved_voice_url = voiceUrlData?.publicUrl || '';
        }

        setLetter(letterData);

        // Fetch images
        const { data: imageData } = await supabase
          .from('letter_images')
          .select('*')
          .eq('letter_id', letterData.id)
          .order('display_order', { ascending: true });

        if (imageData) {
          const resolvedImages = imageData.map(img => {
            const { data: imgUrlData } = supabase.storage
              .from('images')
              .getPublicUrl(img.image_url);
            return { ...img, image_url: imgUrlData?.publicUrl || img.image_url };
          });
          setImages(resolvedImages);
        }
      } catch (err) {
        console.error('Error fetching letter:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [code]);

  // Handle envelope open
  const handleEnvelopeComplete = useCallback(() => {
    setEnvelopeOpen(true);
    
    // If letter has a voice recording, show the popup
    if (letter?.voice_url) {
      setTimeout(() => setShowVoicePopup(true), 500);
    } else {
      // No voice, just play music
      setPlayMode('letter');
      setShouldPlayMusic(true);
    }
  }, [letter]);

  // Handle voice popup selection
  const handleVoiceSelect = useCallback((mode) => {
    setShowVoicePopup(false);
    setPlayMode(mode);

    if (mode === 'letter') {
      setShouldPlayMusic(true);
    } else if (mode === 'voice' && letter?.resolved_voice_url && voiceAudio) {
      voiceAudio.src = letter.resolved_voice_url;
      voiceAudio.play().then(() => setVoicePlaying(true)).catch(() => {});
    }
  }, [letter, voiceAudio]);

  // Cleanup voice audio
  useEffect(() => {
    return () => {
      if (voiceAudio) {
        voiceAudio.pause();
        voiceAudio.src = '';
      }
    };
  }, [voiceAudio]);

  // Loading state
  if (loading) {
    return (
      <div className="page-loader" data-theme="blue">
        <div className="spinner" />
      </div>
    );
  }

  // Error state
  if (error || !letter) {
    return (
      <div className="not-found" data-theme="blue">
        <h1>404</h1>
        <p>This letter doesn't exist or the code is incorrect.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Back
        </button>
      </div>
    );
  }

  const themeColor = letter.theme_color || 'blue';

  return (
    <div className="letter-page" data-theme={themeColor}>
      {/* Floating particles (always visible after envelope opens) */}
      {envelopeOpen && <FloatingParticles themeColor={themeColor} />}

      {/* Envelope Animation */}
      {!envelopeOpen && (
        <EnvelopeAnimation
          recipientName={letter.recipient_name}
          themeColor={themeColor}
          onComplete={handleEnvelopeComplete}
        />
      )}

      {/* Voice selection popup */}
      <VoicePopup
        isOpen={showVoicePopup}
        onSelect={handleVoiceSelect}
      />

      {/* Music player (for letter mode) */}
      {playMode === 'letter' && (
        <MusicPlayer
          musicType={letter.music_type}
          musicUrl={letter.resolved_music_url}
          shouldPlay={shouldPlayMusic}
        />
      )}

      {/* Voice mode floating indicator */}
      {playMode === 'voice' && voicePlaying && (
        <button
          className="music-toggle playing"
          onClick={() => {
            if (voiceAudio) {
              if (voiceAudio.paused) {
                voiceAudio.play();
                setVoicePlaying(true);
              } else {
                voiceAudio.pause();
                setVoicePlaying(false);
              }
            }
          }}
          title="Voice message playing"
        >
          <div className="music-bars">
            <div className="music-bar" />
            <div className="music-bar" />
            <div className="music-bar" />
            <div className="music-bar" />
          </div>
        </button>
      )}

      {/* Letter content */}
      <AnimatePresence>
        {envelopeOpen && !showCollage && (
          <motion.div
            className="letter-page-inner page-enter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <LetterContent
              content={letter.content}
              recipientName={letter.recipient_name}
            />

            {/* Polaroid Gallery */}
            {images.length > 0 && (
              <PolaroidGallery images={images} />
            )}

            {/* Bottom Actions: Collage & QR Code */}
            <motion.div
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '2rem 1rem 4rem',
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {images.length > 0 && (
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => setShowCollage(true)}
                >
                  <FiGrid style={{ marginRight: '0.5rem' }} />
                  View as Collage & Download
                </button>
              )}
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setShowQrModal(true)}
              >
                <BsQrCode style={{ marginRight: '0.5rem' }} />
                Get QR Souvenir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collage view */}
      <AnimatePresence>
        {showCollage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CollageView
              images={images}
              letterContent={letter.content}
              recipientName={letter.recipient_name}
              onBack={() => setShowCollage(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      {letter && (
        <QRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          code={letter.code}
          recipientName={letter.recipient_name}
          themeColor={letter.theme_color}
        />
      )}
    </div>
  );
}
