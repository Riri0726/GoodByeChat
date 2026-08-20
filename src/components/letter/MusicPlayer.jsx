import { useRef, useState, useCallback, useEffect } from 'react';
import { FiVolume2, FiVolume1, FiVolumeX, FiPlay, FiPause, FiMusic } from 'react-icons/fi';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer({ musicType, musicUrl, shouldPlay }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // 0 to 1
  const [showSpotifyPrompt, setShowSpotifyPrompt] = useState(true);

  // Robust YouTube URL Parser
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    if (!match) return null;
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&loop=1&playlist=${videoId}&origin=${window.location.origin}`;
  };

  // Robust Spotify Embed Parser (Tracks, Playlists, Albums)
  const getSpotifyEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album|episode)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }
    const uriMatch = url.match(/spotify:(track|playlist|album):([a-zA-Z0-9]+)/);
    if (uriMatch) {
      return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}?utm_source=generator&theme=0`;
    }
    return null;
  };

  // Sync volume with uploaded audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playAudio = useCallback(async () => {
    if (musicType === 'upload' && audioRef.current) {
      try {
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio autoplay blocked:', err);
      }
    } else if (musicType === 'youtube') {
      setIsPlaying(true);
    }
  }, [musicType, isMuted, volume]);

  useEffect(() => {
    if (shouldPlay) {
      playAudio();
    }
  }, [shouldPlay, playAudio]);

  const togglePlayPause = (e) => {
    e?.stopPropagation();
    if (musicType === 'upload' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (musicType === 'upload' && audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.volume = volume > 0 ? volume : 0.5;
        if (volume === 0) setVolume(0.5);
        setIsMuted(false);
      } else {
        audioRef.current.muted = true;
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.muted = true;
    } else {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.volume = newVol;
        if (!isPlaying) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    }
  };

  if (!musicUrl) return null;

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <FiVolumeX />;
    if (volume < 0.5) return <FiVolume1 />;
    return <FiVolume2 />;
  };

  const spotifyEmbedUrl = getSpotifyEmbedUrl(musicUrl);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(musicUrl);

  return (
    <>
      {/* 1. UPLOADED AUDIO FILE (Direct HTML5 Audio with 100% Autoplay Support) */}
      {musicType === 'upload' && (
        <>
          <audio
            ref={audioRef}
            src={musicUrl}
            loop
            preload="auto"
          />
          {/* Floating Audio Controller */}
          <motion.div
            className="floating-audio-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              className="audio-btn audio-btn-play"
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '2px' }} />}
            </button>

            {isPlaying && !isMuted && volume > 0 && (
              <div className="audio-mini-bars">
                <div className="audio-mini-bar" />
                <div className="audio-mini-bar" />
                <div className="audio-mini-bar" />
                <div className="audio-mini-bar" />
              </div>
            )}

            <div className="audio-volume-control">
              <button
                className="audio-btn audio-btn-mute"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {getVolumeIcon()}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="audio-volume-slider"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
              <span className="audio-volume-percent">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </motion.div>
        </>
      )}

      {/* 2. YOUTUBE AUDIO PLAYER */}
      {musicType === 'youtube' && youtubeEmbedUrl && shouldPlay && (
        <>
          <iframe
            src={`${youtubeEmbedUrl}${isMuted || volume === 0 ? '&mute=1' : ''}`}
            allow="autoplay; encrypted-media"
            style={{
              position: 'fixed',
              width: 0,
              height: 0,
              border: 'none',
              opacity: 0,
              pointerEvents: 'none',
            }}
            title="Background music"
          />
          {/* Floating YouTube Status Bar */}
          <motion.div
            className="floating-audio-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="audio-btn audio-btn-play" style={{ background: '#FF0000' }}>
              <FaYoutube />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              YouTube Audio
            </span>
            <button
              className="audio-btn audio-btn-mute"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FiVolumeX /> : <FiVolume2 />}
            </button>
          </motion.div>
        </>
      )}

      {/* 3. SPOTIFY EMBED PLAYER (Clean Floating Card with Play Prompt) */}
      {musicType === 'spotify' && spotifyEmbedUrl && shouldPlay && (
        <motion.div
          className="spotify-floating-card"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {showSpotifyPrompt && (
            <div className="spotify-prompt-badge">
              <FaSpotify style={{ color: '#1DB954', fontSize: '1.1rem' }} />
              <span>Tap play on Spotify below 🎵</span>
              <button
                onClick={() => setShowSpotifyPrompt(false)}
                className="spotify-close-prompt"
              >
                ✕
              </button>
            </div>
          )}

          <iframe
            src={spotifyEmbedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
            }}
            title="Spotify track player"
          />
        </motion.div>
      )}
    </>
  );
}
