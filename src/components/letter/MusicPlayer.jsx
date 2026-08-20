import { useRef, useState, useCallback, useEffect } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

export default function MusicPlayer({ musicType, musicUrl, shouldPlay }) {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const playAudio = useCallback(async () => {
    if (musicType === 'upload' && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio autoplay blocked:', err);
      }
    }
  }, [musicType]);

  useEffect(() => {
    if (shouldPlay) {
      playAudio();
    }
  }, [shouldPlay, playAudio]);

  const toggleMute = () => {
    if (musicType === 'upload' && audioRef.current) {
      audioRef.current.muted = !isMuted;
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
    setIsMuted(!isMuted);
  };

  if (!musicUrl) return null;

  return (
    <>
      {/* Hidden audio element for uploaded files */}
      {musicType === 'upload' && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
        />
      )}

      {/* Hidden YouTube embed */}
      {musicType === 'youtube' && getYouTubeId(musicUrl) && shouldPlay && (
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeId(musicUrl)}?autoplay=1&loop=1&playlist=${getYouTubeId(musicUrl)}${isMuted ? '&mute=1' : ''}`}
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

      {/* Spotify embed (small player) */}
      {musicType === 'spotify' && getSpotifyId(musicUrl) && shouldPlay && (
        <iframe
          src={`https://open.spotify.com/embed/track/${getSpotifyId(musicUrl)}?theme=0`}
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '1rem',
            width: isMuted ? 0 : '300px',
            height: isMuted ? 0 : '80px',
            border: 'none',
            borderRadius: '12px',
            zIndex: 999,
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          title="Background music"
        />
      )}

      {/* Mute/Unmute toggle */}
      <button
        className={`music-toggle ${isPlaying && !isMuted ? 'playing' : ''}`}
        onClick={toggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FiVolumeX /> : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {isPlaying ? (
              <div className="music-bars">
                <div className="music-bar" />
                <div className="music-bar" />
                <div className="music-bar" />
                <div className="music-bar" />
              </div>
            ) : (
              <FiVolume2 />
            )}
          </div>
        )}
      </button>
    </>
  );
}
