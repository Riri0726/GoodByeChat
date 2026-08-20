import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FiSend } from 'react-icons/fi';

export default function LandingPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }

    setLoading(true);
    setError('');

    // If Supabase isn't configured, navigate directly
    if (!isSupabaseConfigured) {
      navigate(`/${code.trim().toLowerCase()}`);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('letters')
        .select('code')
        .eq('code', code.trim().toLowerCase())
        .single();

      if (fetchError || !data) {
        setError('Letter not found. Please check your code.');
      } else {
        navigate(`/${data.code}`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Animated background orbs */}
      <div className="landing-bg">
        <div className="landing-bg-orb" />
        <div className="landing-bg-orb" />
        <div className="landing-bg-orb" />
      </div>

      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo / Brand */}
        <motion.h1
          className="landing-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          GoodByeChat
        </motion.h1>

        <motion.p
          className="landing-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          A letter written just for you ✉️
        </motion.p>

        {/* Code entry card */}
        <motion.div
          className="landing-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="landing-input-group">
              <input
                type="text"
                className="landing-input"
                placeholder="Enter your code..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                autoFocus
              />
              <motion.button
                type="submit"
                className="landing-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : (
                  <>
                    <FiSend style={{ marginRight: '0.4rem' }} />
                    Open
                  </>
                )}
              </motion.button>
            </div>

            {error && (
              <motion.p
                className="landing-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
          </form>
        </motion.div>

        <motion.p
          className="landing-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Didn't receive a code? Ask the sender for your unique link.
        </motion.p>
      </motion.div>
    </div>
  );
}
