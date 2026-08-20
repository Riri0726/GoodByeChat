import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { FiDownload, FiArrowLeft } from 'react-icons/fi';

export default function CollageView({ images, letterContent, recipientName, onBack }) {
  const collageRef = useRef(null);

  const handleDownload = useCallback(async () => {
    if (!collageRef.current) return;

    try {
      const canvas = await html2canvas(collageRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `goodbyechat-${recipientName?.replace(/\s+/g, '-') || 'collage'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image. Please try again.');
    }
  }, [recipientName]);

  // Extract plain text from HTML content
  const getPlainTextExcerpt = (html, maxLength = 200) => {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    const text = doc.body.textContent || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="collage-container">
      <div className="collage-header">
        <button className="btn btn-ghost" onClick={onBack}>
          <FiArrowLeft /> Back to Letter
        </button>
        <button className="btn btn-primary" onClick={handleDownload}>
          <FiDownload /> Download Image
        </button>
      </div>

      <motion.div
        ref={collageRef}
        className="collage-canvas"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Recipient name */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.5rem',
          color: 'var(--primary-light)',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          {recipientName}
        </h2>

        {/* Photo grid */}
        {images && images.length > 0 && (
          <div className="collage-grid" style={{
            gridTemplateColumns: images.length === 1
              ? '1fr'
              : images.length === 2
                ? 'repeat(2, 1fr)'
                : images.length <= 4
                  ? 'repeat(2, 1fr)'
                  : 'repeat(3, 1fr)',
          }}>
            {images.map((image, index) => (
              <div key={image.id || index} className="collage-item">
                <img
                  src={image.image_url}
                  alt={image.caption || `Photo ${index + 1}`}
                  crossOrigin="anonymous"
                />
              </div>
            ))}
          </div>
        )}

        {/* Letter excerpt */}
        {letterContent && (
          <div className="collage-message" style={{ marginTop: '1rem' }}>
            "{getPlainTextExcerpt(letterContent)}"
          </div>
        )}

        {/* Branding */}
        <p style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          fontFamily: "'Playfair Display', serif",
        }}>
          ✉ GoodByeChat
        </p>
      </motion.div>
    </div>
  );
}
