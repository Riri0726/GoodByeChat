import { useRef } from 'react';
import { FiMic } from 'react-icons/fi';

export default function VoiceUploader({ voiceFile, voiceUrl, onChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        voiceFile: file,
        voiceUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleRemove = () => {
    onChange({ voiceFile: null, voiceUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '1.25rem', flex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <FiMic style={{ fontSize: '1.3rem', color: 'var(--primary)' }} />
            <div>
              <div className="upload-zone-text" style={{ fontSize: '0.85rem' }}>
                {voiceFile ? voiceFile.name : 'Upload your voice recording'}
              </div>
              <div className="upload-zone-hint">MP3, WAV, OGG • Optional for special persons</div>
            </div>
          </div>
        </div>
        {voiceUrl && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleRemove}
          >
            Remove
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {voiceUrl && (
        <div className="audio-preview">
          <audio controls src={voiceUrl} style={{ width: '100%', marginTop: '0.75rem' }} />
        </div>
      )}
    </div>
  );
}
