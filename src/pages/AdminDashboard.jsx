import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2,
  FiCopy, FiExternalLink, FiLogOut,
  FiImage, FiMusic, FiMic
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import QRCodeModal from '../components/common/QRCodeModal';

const themeLabels = {
  blue: '🔵 Blue',
  purple: '🟣 Purple',
  pink: '🩷 Pink',
  mint: '🟢 Mint',
  black: '⚫ Black',
};

export default function AdminDashboard() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedQrLetter, setSelectedQrLetter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*, letter_images(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (err) {
      console.error('Error fetching letters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, recipientName) => {
    if (!window.confirm(`Delete letter for "${recipientName}"? This cannot be undone.`)) return;

    try {
      // Delete images from storage first
      const { data: images } = await supabase
        .from('letter_images')
        .select('image_url')
        .eq('letter_id', id);

      if (images?.length) {
        await supabase.storage
          .from('images')
          .remove(images.map(img => img.image_url));
      }

      // Delete letter (cascades to letter_images)
      const { error } = await supabase.from('letters').delete().eq('id', id);
      if (error) throw error;

      setLetters(letters.filter(l => l.id !== id));
      showToast('Letter deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete letter', 'error');
    }
  };

  const copyLink = (code) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!', 'success');
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const filteredLetters = letters.filter(l =>
    l.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.code?.toLowerCase().includes(search.toLowerCase())
  );

  const getContentPreview = (html) => {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body.textContent || 'No content';
  };

  return (
    <div className="admin-page" data-theme="blue">
      <div className="admin-header">
        <h1>✉️ GoodByeChat Admin</h1>
        <div className="admin-header-actions">
          <Link to="/admin/letter/new">
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus /> New Letter
            </motion.button>
          </Link>
          <button className="btn btn-ghost" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </div>

      <div className="admin-container">
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="search-bar">
            <FiSearch className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {filteredLetters.length} letter{filteredLetters.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Letters grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : filteredLetters.length === 0 ? (
          <motion.div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-muted)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</p>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {search ? 'No letters match your search' : 'No letters yet'}
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              {search ? 'Try a different search term' : 'Create your first farewell letter!'}
            </p>
          </motion.div>
        ) : (
          <div className="dashboard-grid">
            <AnimatePresence>
              {filteredLetters.map((letter, index) => (
                <motion.div
                  key={letter.id}
                  className="card letter-card"
                  data-theme={letter.theme_color || 'blue'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="letter-card-theme" />

                  <div className="letter-card-header">
                    <div className="letter-card-recipient">
                      {letter.recipient_name || 'Unnamed'}
                    </div>
                    <span className="letter-card-code">{letter.code}</span>
                  </div>

                  <div className="letter-card-preview">
                    {getContentPreview(letter.content)}
                  </div>

                  <div className="letter-card-meta">
                    <span className="letter-card-meta-item">
                      {themeLabels[letter.theme_color] || '🔵 Blue'}
                    </span>
                    {letter.music_url && (
                      <span className="letter-card-meta-item">
                        <FiMusic size={12} /> Music
                      </span>
                    )}
                    {letter.voice_url && (
                      <span className="letter-card-meta-item">
                        <FiMic size={12} /> Voice
                      </span>
                    )}
                    {letter.letter_images?.[0]?.count > 0 && (
                      <span className="letter-card-meta-item">
                        <FiImage size={12} /> {letter.letter_images[0].count}
                      </span>
                    )}
                  </div>

                  <div className="letter-card-actions">
                    <Link to={`/admin/letter/${letter.id}`} style={{ flex: 1 }}>
                      <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        <FiEdit2 size={14} /> Edit
                      </button>
                    </Link>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => setSelectedQrLetter(letter)}
                      title="Generate & Download QR Code"
                    >
                      <BsQrCode size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => copyLink(letter.code)}
                      title="Copy link"
                    >
                      <FiCopy size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => window.open(`/${letter.code}`, '_blank')}
                      title="Preview"
                    >
                      <FiExternalLink size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleDelete(letter.id, letter.recipient_name)}
                      title="Delete"
                      style={{ color: '#EF4444' }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* QR Code Generator & Download Modal */}
      {selectedQrLetter && (
        <QRCodeModal
          isOpen={Boolean(selectedQrLetter)}
          onClose={() => setSelectedQrLetter(null)}
          code={selectedQrLetter.code}
          recipientName={selectedQrLetter.recipient_name}
          themeColor={selectedQrLetter.theme_color}
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

