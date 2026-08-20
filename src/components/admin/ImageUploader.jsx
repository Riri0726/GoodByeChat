import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX } from 'react-icons/fi';

export default function ImageUploader({ images, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    onChange([...images, ...newImages]);
  }, [images, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  });

  const removeImage = (index) => {
    const updated = [...images];
    if (updated[index].preview) {
      URL.revokeObjectURL(updated[index].preview);
    }
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    
    const updated = [...images];
    const draggedItem = updated[dragIndex];
    updated.splice(dragIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDragIndex(index);
    onChange(updated);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const updateCaption = (index, caption) => {
    const updated = [...images];
    updated[index] = { ...updated[index], caption };
    onChange(updated);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="upload-zone-icon">
          <FiUploadCloud />
        </div>
        <div className="upload-zone-text">
          {isDragActive
            ? 'Drop images here...'
            : 'Drag & drop images, or click to browse'}
        </div>
        <div className="upload-zone-hint">
          JPG, PNG, WEBP • Drag to reorder after upload
        </div>
      </div>

      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((img, index) => (
            <div
              key={img.id || index}
              className="image-preview-item"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: dragIndex === index ? 0.5 : 1,
                border: dragIndex === index ? '2px dashed var(--primary)' : undefined,
              }}
            >
              <img src={img.preview || img.image_url} alt={img.caption || `Photo ${index + 1}`} />
              <button
                type="button"
                className="image-preview-remove"
                onClick={() => removeImage(index)}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
