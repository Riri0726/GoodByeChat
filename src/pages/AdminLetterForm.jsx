import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RichTextEditor from '../components/admin/RichTextEditor';
import ThemeColorPicker from '../components/admin/ThemeColorPicker';
import ImageUploader from '../components/admin/ImageUploader';
import MusicUploader from '../components/admin/MusicUploader';
import VoiceUploader from '../components/admin/VoiceUploader';
import QRCodeModal from '../components/common/QRCodeModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSave, FiEye, FiRefreshCw } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

function generateCode() {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AdminLetterForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [code, setCode] = useState(generateCode());
  const [content, setContent] = useState('');
  const [themeColor, setThemeColor] = useState('blue');
  const [musicType, setMusicType] = useState('upload');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [voiceFile, setVoiceFile] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState('');
  const [existingVoiceUrl, setExistingVoiceUrl] = useState('');
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Load existing letter for edit mode
  useEffect(() => {
    if (!isEdit) return;

    const fetchLetter = async () => {
      try {
        const { data: letter, error } = await supabase
          .from('letters')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !letter) {
          navigate('/admin/dashboard');
          return;
        }

        setRecipientName(letter.recipient_name || '');
        setCode(letter.code || '');
        setContent(letter.content || '');
        setThemeColor(letter.theme_color || 'blue');
        setMusicType(letter.music_type || 'upload');
        setMusicUrl(letter.music_url || '');
        setExistingVoiceUrl(letter.voice_url || '');

        if (letter.voice_url) {
          const { data: voiceUrlData } = supabase.storage
            .from('audio')
            .getPublicUrl(letter.voice_url);
          setVoiceUrl(voiceUrlData?.publicUrl || '');
        }

        // Fetch images
        const { data: imageData } = await supabase
          .from('letter_images')
          .select('*')
          .eq('letter_id', id)
          .order('display_order', { ascending: true });

        if (imageData) {
          const resolved = imageData.map(img => {
            const { data: imgUrl } = supabase.storage
              .from('images')
              .getPublicUrl(img.image_url);
            return {
              ...img,
              preview: imgUrl?.publicUrl || '',
              existing: true,
            };
          });
          setImages(resolved);
          setExistingImages(imageData);
        }
      } catch (err) {
        console.error('Error loading letter:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [id, isEdit, navigate]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!recipientName.trim()) {
      showToast('Please enter a recipient name', 'error');
      return;
    }
    if (!code.trim()) {
      showToast('Please enter a unique code', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('Please write some content', 'error');
      return;
    }

    setSaving(true);

    try {
      let finalMusicUrl = musicUrl;
      let finalVoiceUrl = existingVoiceUrl;

      // Upload music file if new
      if (musicType === 'upload' && musicFile) {
        const fileName = `${code}-music-${Date.now()}.${musicFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('audio')
          .upload(fileName, musicFile);

        if (uploadError) throw uploadError;
        finalMusicUrl = fileName;
      }

      // Upload voice file if new
      if (voiceFile) {
        const fileName = `${code}-voice-${Date.now()}.${voiceFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('audio')
          .upload(fileName, voiceFile);

        if (uploadError) throw uploadError;
        finalVoiceUrl = fileName;
      }

      // Save letter
      const letterData = {
        recipient_name: recipientName,
        code: code.toLowerCase(),
        content,
        theme_color: themeColor,
        music_type: musicType,
        music_url: finalMusicUrl || null,
        voice_url: finalVoiceUrl || null,
        updated_at: new Date().toISOString(),
      };

      let letterId = id;

      if (isEdit) {
        const { error } = await supabase
          .from('letters')
          .update(letterData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('letters')
          .insert([{ ...letterData, created_at: new Date().toISOString() }])
          .select('id')
          .single();
        if (error) throw error;
        letterId = data.id;
      }

      // Handle images
      // Delete removed existing images
      if (isEdit) {
        const currentImageIds = images.filter(i => i.existing).map(i => i.id);
        const removedImages = existingImages.filter(ei => !currentImageIds.includes(ei.id));

        for (const img of removedImages) {
          await supabase.storage.from('images').remove([img.image_url]);
          await supabase.from('letter_images').delete().eq('id', img.id);
        }
      }

      // Upload new images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.existing) {
          // Update display order
          await supabase
            .from('letter_images')
            .update({ display_order: i })
            .eq('id', img.id);
        } else if (img.file) {
          const fileName = `${code}-img-${Date.now()}-${i}.${img.file.name.split('.').pop()}`;
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, img.file);

          if (uploadError) throw uploadError;

          await supabase.from('letter_images').insert([{
            letter_id: letterId,
            image_url: fileName,
            display_order: i,
            caption: img.caption || null,
          }]);
        }
      }

      showToast(isEdit ? 'Letter updated!' : 'Letter created!', 'success');
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (err) {
      console.error('Save error:', err);
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader" data-theme="blue">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page" data-theme={themeColor}>
      <div className="admin-header">
        <h1>{isEdit ? '✏️ Edit Letter' : '✉️ New Letter'}</h1>
        <div className="admin-header-actions">
          {code && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowQrModal(true)}
              title="Generate & Download QR Code"
            >
              <BsQrCode /> QR Code
            </button>
          )}
          {isEdit && (
            <button
              className="btn btn-ghost"
              onClick={() => window.open(`/${code}`, '_blank')}
            >
              <FiEye /> Preview
            </button>
          )}
          <motion.button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Saving...
              </>
            ) : (
              <>
                <FiSave /> Save Letter
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="admin-container" style={{ maxWidth: '800px' }}>
        <Link
          to="/admin/dashboard"
          className="btn btn-ghost"
          style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Recipient Name */}
        <div className="form-group">
          <label className="form-label">To (Recipient)</label>
          <input
            type="text"
            className="form-input"
            placeholder='e.g., "My best friend, Maria" or "Dear Kuya Josh"'
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>

        {/* Unique Code */}
        <div className="form-group">
          <label className="form-label">Unique Code</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., abc123"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, '').toLowerCase())}
              style={{ flex: 1 }}
            />
            {code && (
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setShowQrModal(true)}
                title="View & Download QR Code"
              >
                <BsQrCode />
              </button>
            )}
            {!isEdit && (
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setCode(generateCode())}
                title="Generate new code"
              >
                <FiRefreshCw />
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Recipients access their letter at: {window.location.origin}/{code}
          </p>
        </div>

        {/* Theme Color */}
        <div className="form-group">
          <label className="form-label">Theme Color</label>
          <ThemeColorPicker value={themeColor} onChange={setThemeColor} />
        </div>

        {/* Letter Content */}
        <div className="form-group">
          <label className="form-label">Letter Content</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Write your message below, or click the upload icon (↑) to import a .txt or .docx file.
          </p>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Music */}
        <div className="form-group">
          <label className="form-label">Background Music</label>
          <MusicUploader
            musicType={musicType}
            musicUrl={musicUrl}
            musicFile={musicFile}
            onChange={({ musicType: mt, musicUrl: mu, musicFile: mf }) => {
              setMusicType(mt);
              setMusicUrl(mu);
              if (mf) setMusicFile(mf);
            }}
          />
        </div>

        {/* Voice Recording */}
        <div className="form-group">
          <label className="form-label">Voice Recording (Optional)</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Upload a spoken version of your letter. Recipients will get to choose between reading with music or listening to your voice.
          </p>
          <VoiceUploader
            voiceFile={voiceFile}
            voiceUrl={voiceUrl}
            onChange={({ voiceFile: vf, voiceUrl: vu }) => {
              setVoiceFile(vf);
              setVoiceUrl(vu);
              if (!vf) setExistingVoiceUrl('');
            }}
          />
        </div>

        {/* Images */}
        <div className="form-group">
          <label className="form-label">Photos</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Upload photos to display as Polaroid-style cards. Drag to reorder. Leave empty if no photos.
          </p>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {/* Save button (bottom) */}
        <div style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
          <motion.button
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%' }}
          >
            {saving ? 'Saving...' : (isEdit ? 'Update Letter' : 'Create Letter')}
          </motion.button>
        </div>
      </div>

      {/* QR Code Modal */}
      {code && (
        <QRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          code={code}
          recipientName={recipientName}
          themeColor={themeColor}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
