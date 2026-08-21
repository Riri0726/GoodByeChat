import { useRef, useState, useCallback, useEffect } from 'react';
import { FiVolume2, FiVolume1, FiVolumeX, FiPlay, FiPause, FiMusic, FiMinimize2 } from 'react-icons/fi';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer({ musicType, musicUrl, shouldPlay }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // 0 to 1
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
    } else if (musicType === 'spotify') {
      // Show tooltip indicating music is ready
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 6000);
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

  const getFabIcon = () => {
    if (musicType === 'spotify') return <FaSpotify style={{ color: '#1DB954', fontSize: '1.35rem' }} />;
    if (musicType === 'youtube') return <FaYoutube style={{ color: '#FF0000', fontSize: '1.35rem' }} />;
    return <FiMusic style={{ fontSize: '1.25rem' }} />;
  };

  return (
    <>
      {/* Hidden audio element for Upload mode */}
      {musicType === 'upload' && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
        />
      )}

      {/* Hidden iframe for YouTube mode */}
      {musicType === 'youtube' && youtubeEmbedUrl && shouldPlay && (
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
      )}

      {/* Floating Action Button (FAB) Container */}
      <div className="music-fab-container">
        {/* Tooltip prompt */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              className="music-fab-tooltip"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
            >
              <span>Tap to play music 🎵</span>
              <button
                type="button"
                className="music-fab-tooltip-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The FAB button */}
        <motion.button
          type="button"
          className={`music-fab-btn ${isPlaying ? 'is-active' : ''}`}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title={isOpen ? 'Close Music Controls' : 'Open Music Player'}
          aria-label="Toggle Music Player"
        >
          <div className="music-fab-icon-wrap">
            {getFabIcon()}
          </div>

          {/* Dancing sound bars when active */}
          {(isPlaying || (musicType === 'spotify' && shouldPlay)) && (
            <div className="music-fab-equalizer">
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </div>
          )}
        </motion.button>

        {/* Expanded Floating Player Drawer/Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="music-player-panel"
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="music-panel-header">
                <div className="music-panel-title">
                  {musicType === 'spotify' && <FaSpotify color="#1DB954" size={18} />}
                  {musicType === 'youtube' && <FaYoutube color="#FF0000" size={18} />}
                  {musicType === 'upload' && <FiMusic color="var(--primary)" size={18} />}
                  <span>Background Music</span>
                </div>
                <button
                  type="button"
                  className="music-panel-close"
                  onClick={() => setIsOpen(false)}
                  title="Minimize Player"
                >
                  <FiMinimize2 size={16} />
                </button>
              </div>

              {/* Panel Content per musicType */}
              <div className="music-panel-body">
                {/* 1. SPOTIFY EMBED */}
                {musicType === 'spotify' && spotifyEmbedUrl && (
                  <div className="spotify-player-wrap">
                    <p className="music-panel-hint">
                      Tap play on Spotify below to listen while reading 🎧
                    </p>
                    <iframe
                      src={spotifyEmbedUrl}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      style={{
                        borderRadius: '12px',
                        border: 'none',
                        display: 'block',
                      }}
                      title="Spotify track player"
                    />
                  </div>
                )}

                {/* 2. UPLOADED AUDIO */}
                {musicType === 'upload' && (
                  <div className="upload-audio-controls">
                    <div className="upload-audio-main">
                      <button
                        type="button"
                        className="music-panel-play-btn"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} style={{ marginLeft: 2 }} />}
                      </button>
                      <div className="upload-audio-info">
                        <span className="upload-audio-title">Farewell Song</span>
                        <span className="upload-audio-status">
                          {isPlaying ? 'Now Playing 🎵' : 'Paused'}
                        </span>
                      </div>
                    </div>

                    <div className="music-panel-volume-row">
                      <button
                        type="button"
                        className="music-panel-mute-btn"
                        onClick={toggleMute}
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
                      />
                      <span className="music-volume-label">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. YOUTUBE AUDIO */}
                {musicType === 'youtube' && (
                  <div className="upload-audio-controls">
                    <div className="upload-audio-main">
                      <div className="music-panel-yt-badge">
                        <FaYoutube size={22} color="#FF0000" />
                      </div>
                      <div className="upload-audio-info">
                        <span className="upload-audio-title">YouTube Audio</span>
                        <span className="upload-audio-status">
                          {isMuted ? 'Muted' : 'Playing in background 🎵'}
                        </span>
                      </div>
                    </div>

                    <div className="music-panel-volume-row">
                      <button
                        type="button"
                        className="music-panel-mute-btn"
                        onClick={toggleMute}
                      >
                        {isMuted ? <FiVolumeX /> : <FiVolume2 />}
                      </button>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {isMuted ? 'Muted' : 'Audio On'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
