import { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiDownload, FiCopy, FiCheck, FiExternalLink,
  FiGlobe, FiPrinter, FiImage
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

const THEME_COLORS = {
  blue: { primary: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', text: '#1E3A8A' },
  purple: { primary: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)', text: '#4C1D95' },
  pink: { primary: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)', text: '#831843' },
  mint: { primary: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', text: '#064E3B' },
  black: { primary: '#1E293B', gradient: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', text: '#0F172A' },
};

export default function QRCodeModal({
  isOpen,
  onClose,
  code = '',
  recipientName = '',
  themeColor = 'blue'
}) {
  const [domainMode, setDomainMode] = useState('production'); // 'production' | 'current'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'qr'
  const cardRef = useRef(null);
  const qrCanvasRef = useRef(null);

  const theme = THEME_COLORS[themeColor] || THEME_COLORS.blue;
  const productionBase = 'https://good-bye-chat.vercel.app';
  const currentBase = typeof window !== 'undefined' ? window.location.origin : productionBase;
  const baseUrl = domainMode === 'production' ? productionBase : currentBase;
  const fullUrl = `${baseUrl}/${code}`;

  useEffect(() => {
    if (!isOpen) {
      setCopiedLink(false);
      setCopiedImage(false);
      setDownloading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const sanitizeFilename = (name) => {
    return (name || 'farewell').replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  };

  // Download high-resolution plain QR PNG
  const handleDownloadQR = () => {
    setDownloading(true);
    try {
      // Create high-res offscreen canvas
      const canvas = document.createElement('canvas');
      const size = 1024;
      const padding = 80;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Get current QR canvas from ref
      const currentCanvas = qrCanvasRef.current?.querySelector('canvas');
      if (currentCanvas) {
        ctx.drawImage(currentCanvas, padding, padding, size - padding * 2, size - padding * 2);
      }

      // Download
      const link = document.createElement('a');
      link.download = `qr-${sanitizeFilename(recipientName)}-${code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading QR:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Render & Download high-resolution Farewell Badge / Card PNG
  const handleDownloadBadge = async () => {
    setDownloading(true);
    try {
      const width = 1200;
      const height = 1600;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Background gradient / texture
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Outer decorative border
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Inner subtle border
      ctx.strokeStyle = theme.primary + '33';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, width - 90, height - 90);

      // 3. Header Accent Banner
      const bannerHeight = 280;
      const bannerGrad = ctx.createLinearGradient(0, 0, width, bannerHeight);
      bannerGrad.addColorStop(0, theme.primary);
      bannerGrad.addColorStop(1, themeColor === 'black' ? '#475569' : '#93C5FD');
      ctx.fillStyle = bannerGrad;
      ctx.fillRect(45, 45, width - 90, bannerHeight);

      // 4. Header Text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✉️ GOODBYE CHAT', width / 2, 125);

      ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('A Special Farewell Letter For You', width / 2, 175);

      ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#FFFFFF';
      const displayName = recipientName ? `To: ${recipientName}` : 'To: Our Dear Friend';
      ctx.fillText(displayName, width / 2, 255);

      // 5. QR Code Card Container
      const qrBoxSize = 680;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = 390;

      // Card shadow & container
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
      ctx.fill();
      ctx.shadowColor = 'transparent'; // reset shadow

      // Container border
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 6. Draw QR Code into container
      const currentCanvas = qrCanvasRef.current?.querySelector('canvas');
      if (currentCanvas) {
        const qrPadding = 50;
        ctx.drawImage(
          currentCanvas,
          qrBoxX + qrPadding,
          qrBoxY + qrPadding,
          qrBoxSize - qrPadding * 2,
          qrBoxSize - qrPadding * 2
        );
      }

      // 7. Instructions & Code Badge
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Scan with your phone camera', width / 2, 1140);

      ctx.fillStyle = '#64748B';
      ctx.font = '30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('to open your letter, music & memory polaroids', width / 2, 1195);

      // Code Pill
      const pillWidth = 420;
      const pillHeight = 70;
      const pillX = (width - pillWidth) / 2;
      const pillY = 1250;

      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 35);
      ctx.fill();

      ctx.fillStyle = theme.primary;
      ctx.font = 'bold 30px monospace';
      ctx.fillText(`CODE: ${code.toUpperCase()}`, width / 2, pillY + 46);

      // URL text
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px monospace';
      ctx.fillText(fullUrl, width / 2, 1370);

      // 8. Footer note
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Treasured memories that will stay with you forever ✨', width / 2, 1500);

      // Download
      const link = document.createElement('a');
      link.download = `farewell-card-${sanitizeFilename(recipientName)}-${code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Copy QR Image to clipboard
  const handleCopyImage = async () => {
    try {
      const currentCanvas = qrCanvasRef.current?.querySelector('canvas');
      if (!currentCanvas) return;

      currentCanvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        } catch (err) {
          console.error('Clipboard write failed:', err);
        }
      });
    } catch (err) {
      console.error('Copy image failed:', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentCanvas = qrCanvasRef.current?.querySelector('canvas');
    const qrDataUrl = currentCanvas ? currentCanvas.toDataURL('image/png') : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Farewell Letter QR - ${recipientName || code}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #fff;
            }
            .card {
              width: 380px;
              padding: 32px;
              text-align: center;
              border: 2px dashed #cbd5e1;
              border-radius: 24px;
            }
            .title { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
            .subtitle { font-size: 14px; color: #64748b; margin-bottom: 20px; }
            .qr-img { width: 240px; height: 240px; margin: 0 auto 16px; display: block; border-radius: 12px; }
            .code-badge { display: inline-block; padding: 6px 16px; background: #f1f5f9; border-radius: 20px; font-family: monospace; font-weight: bold; font-size: 16px; color: #3b82f6; margin-bottom: 12px; }
            .url { font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 8px; }
            @media print {
              body { min-height: auto; }
              .card { border: 1px solid #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div style="font-size: 32px; margin-bottom: 8px;">✉️</div>
            <div class="title">${recipientName ? `To: ${recipientName}` : 'A Farewell Letter'}</div>
            <div class="subtitle">Scan with your phone camera to read</div>
            <img class="qr-img" src="${qrDataUrl}" alt="QR Code" />
            <div><span class="code-badge">CODE: ${code.toUpperCase()}</span></div>
            <div class="url">${fullUrl}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="qr-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="qr-modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          data-theme={themeColor}
        >
          {/* Header */}
          <div className="qr-modal-header">
            <div className="qr-modal-title-wrap">
              <div className="qr-modal-icon-badge">
                <BsQrCode size={20} />
              </div>
              <div>
                <h3 className="qr-modal-title">Farewell Letter QR Code</h3>
                <p className="qr-modal-subtitle">
                  {recipientName ? `Generated for ${recipientName}` : `Letter Code: ${code}`}
                </p>
              </div>
            </div>
            <button className="qr-modal-close" onClick={onClose} aria-label="Close">
              <FiX size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="qr-modal-body">
            {/* Domain Switcher */}
            <div className="qr-domain-switcher">
              <span className="qr-domain-label">
                <FiGlobe size={13} /> Link Destination:
              </span>
              <div className="qr-domain-toggle">
                <button
                  type="button"
                  className={`qr-domain-btn ${domainMode === 'production' ? 'active' : ''}`}
                  onClick={() => setDomainMode('production')}
                  title="good-bye-chat.vercel.app"
                >
                  Production (Vercel)
                </button>
                <button
                  type="button"
                  className={`qr-domain-btn ${domainMode === 'current' ? 'active' : ''}`}
                  onClick={() => setDomainMode('current')}
                  title={currentBase}
                >
                  Current Domain
                </button>
              </div>
            </div>

            {/* Target URL banner */}
            <div className="qr-url-box">
              <span className="qr-url-text">{fullUrl}</span>
              <div className="qr-url-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={handleCopyLink}
                  title="Copy full link"
                >
                  {copiedLink ? <FiCheck color="#10B981" size={15} /> : <FiCopy size={15} />}
                </button>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm btn-icon"
                  title="Open link in new tab"
                >
                  <FiExternalLink size={15} />
                </a>
              </div>
            </div>

            {/* Visual View Switcher (Gift Card vs QR only) */}
            <div className="qr-view-tabs">
              <button
                type="button"
                className={`qr-view-tab ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
              >
                🎴 Keepsake Card Preview
              </button>
              <button
                type="button"
                className={`qr-view-tab ${viewMode === 'qr' ? 'active' : ''}`}
                onClick={() => setViewMode('qr')}
              >
                ⬛ Clean QR Only
              </button>
            </div>

            {/* Preview Area */}
            <div className="qr-preview-container">
              {viewMode === 'card' ? (
                /* Keepsake Card Preview */
                <div className="qr-card-preview" ref={cardRef}>
                  <div
                    className="qr-card-header-band"
                    style={{ background: theme.gradient }}
                  >
                    <span className="qr-card-band-tag">✉️ Farewell Letter</span>
                    <h4 className="qr-card-recipient-name">
                      {recipientName || 'Dear Friend'}
                    </h4>
                  </div>
                  <div className="qr-card-inner">
                    <div className="qr-canvas-wrapper" ref={qrCanvasRef}>
                      <QRCodeCanvas
                        value={fullUrl}
                        size={220}
                        level="H"
                        includeMargin={false}
                        fgColor="#0F172A"
                        bgColor="#FFFFFF"
                      />
                    </div>
                    <div className="qr-card-scan-text">
                      Scan with your camera to open
                    </div>
                    <div className="qr-card-code-pill">
                      CODE: <strong>{code.toUpperCase()}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* Clean QR only Preview */
                <div className="qr-clean-preview">
                  <div className="qr-canvas-wrapper" ref={qrCanvasRef}>
                    <QRCodeCanvas
                      value={fullUrl}
                      size={240}
                      level="H"
                      includeMargin={true}
                      fgColor="#0F172A"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <div className="qr-clean-meta">
                    <span className="qr-card-code-pill">
                      CODE: <strong>{code.toUpperCase()}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Download Buttons */}
            <div className="qr-modal-actions-grid">
              <button
                type="button"
                className="btn btn-primary qr-action-btn"
                onClick={handleDownloadBadge}
                disabled={downloading}
              >
                <FiDownload size={16} />
                <span>Download Gift Card (.PNG)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary qr-action-btn"
                onClick={handleDownloadQR}
                disabled={downloading}
              >
                <FiImage size={16} />
                <span>Download QR Code (.PNG)</span>
              </button>
            </div>

            <div className="qr-modal-subactions">
              <button
                type="button"
                className="btn btn-ghost btn-sm qr-subaction-btn"
                onClick={handleCopyImage}
              >
                {copiedImage ? <FiCheck color="#10B981" /> : <FiCopy />}
                <span>{copiedImage ? 'Image Copied!' : 'Copy QR to Clipboard'}</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm qr-subaction-btn"
                onClick={handlePrint}
              >
                <FiPrinter />
                <span>Print Handout</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
