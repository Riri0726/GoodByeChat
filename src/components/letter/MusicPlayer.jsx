import { useRef, useState, useCallback, useEffect } from 'react';
import { FiVolume2, FiVolume1, FiVolumeX, FiPlay, FiPause } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicPlayer({ musicType, musicUrl, shouldPlay }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // 0 to 1
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // Extract Spotify track ID
  const getSpotifyId = (url) => {
    if (!url) return null;
    const match = url.match(/spotify\.com\/track\/([\w]+)/);
    return match ? match[1] : null;
  };

  // Sync volume with audio element
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

  return (
    <>
      {/* Hidden audio element for uploaded audio */}
      {musicType === 'upload' && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
        />
      )}

      {/* Hidden YouTube embed */}
      {musicType === 'youtube' && getYouTubeId(musicUrl) && (
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeId(musicUrl)}?autoplay=${isPlaying && shouldPlay ? '1' : '0'}&loop=1&playlist=${getYouTubeId(musicUrl)}${isMuted || volume === 0 ? '&mute=1' : ''}`}
          allow="autoplay"
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

      {/* Spotify embed */}
      {musicType === 'spotify' && getSpotifyId(musicUrl) && (
        <iframe
          src={`https://open.spotify.com/embed/track/${getSpotifyId(musicUrl)}?theme=0`}
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.5rem',
            width: isMuted ? 0 : '280px',
            height: isMuted ? 0 : '80px',
            border: 'none',
            borderRadius: '14px',
            zIndex: 999,
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          title="Background music"
        />
      )}

      {/* Floating Audio Controller */}
      <motion.div
        className="floating-audio-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Play/Pause Button */}
        <button
          className="audio-btn audio-btn-play"
          onClick={togglePlayPause}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '2px' }} />}
        </button>

        {/* Animated Visualizer Bars when Playing */}
        {isPlaying && !isMuted && volume > 0 && (
          <div className="audio-mini-bars">
            <div className="audio-mini-bar" />
            <div className="audio-mini-bar" />
            <div className="audio-mini-bar" />
            <div className="audio-mini-bar" />
          </div>
        )}

        {/* Volume & Mute Section */}
        <div className="audio-volume-control">
          <button
            className="audio-btn audio-btn-mute"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {getVolumeIcon()}
          </button>

          {/* Volume Slider Range (0 to 100%) */}
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
  );
}
