import { useState, useRef } from 'react';
import { FiUploadCloud, FiMusic } from 'react-icons/fi';
import { FaYoutube, FaSpotify } from 'react-icons/fa';

const tabs = [
  { id: 'upload', label: 'Upload', icon: <FiUploadCloud /> },
  { id: 'youtube', label: 'YouTube', icon: <FaYoutube /> },
  { id: 'spotify', label: 'Spotify', icon: <FaSpotify /> },
];

export default function MusicUploader({ musicType, musicUrl, musicFile, onChange }) {
  const [activeTab, setActiveTab] = useState(musicType || 'upload');
  const fileInputRef = useRef(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onChange({ musicType: tabId, musicUrl: '', musicFile: null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        musicType: 'upload',
        musicFile: file,
        musicUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleUrlChange = (url) => {
    onChange({
      musicType: activeTab,
      musicUrl: url,
      musicFile: null,
    });
  };

  return (
    <div>
      <div className="music-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`music-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
              {tab.icon} {tab.label}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div>
          <div
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '1.5rem' }}
          >
            <div className="upload-zone-icon" style={{ fontSize: '1.6rem' }}>
              <FiMusic />
            </div>
            <div className="upload-zone-text" style={{ fontSize: '0.9rem' }}>
              {musicFile ? musicFile.name : 'Click to upload audio file'}
            </div>
            <div className="upload-zone-hint">
              MP3, WAV, OGG • 🌟 <strong>Best Choice for Guaranteed Autoplay</strong> (starts instantly when envelope opens)
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {musicUrl && activeTab === 'upload' && (
            <div className="audio-preview">
              <audio controls src={musicUrl} style={{ width: '100%', marginTop: '0.75rem' }} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'youtube' && (
        <div>
          <input
            type="url"
            className="form-input"
            placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
            value={musicUrl || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            ℹ️ Plays YouTube background audio automatically once the envelope is opened.
          </p>
        </div>
      )}

      {activeTab === 'spotify' && (
        <div>
          <input
            type="url"
            className="form-input"
            placeholder="Paste Spotify track or playlist URL (e.g., https://open.spotify.com/track/...)"
            value={musicUrl || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            ℹ️ Spotify embed requires the recipient to tap <strong>Play</strong> on the Spotify widget due to Spotify's browser security rules.
          </p>
        </div>
      )}
    </div>
  );
}
