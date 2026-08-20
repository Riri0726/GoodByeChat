import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnvelopeAnimation({ recipientName, themeColor, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle, cracking, opening, sliding, done

  const getSealLetter = () => {
    if (!recipientName) return 'G';
    // Get the first letter after any "Dear", "To", etc.
    const cleaned = recipientName.replace(/^(dear|to|for|hey|hi|hello)\s+/i, '').trim();
    return cleaned.charAt(0).toUpperCase() || 'G';
  };

  const handleClick = useCallback(() => {
    if (phase !== 'idle') return;
    
    setPhase('cracking');
    
    // Seal crack animation
    setTimeout(() => setPhase('opening'), 600);
    // Flap open
    setTimeout(() => setPhase('sliding'), 1400);
    // Letter slides out, then transition
    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2800);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="envelope-scene"
          onClick={handleClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Ambient glow */}
          <motion.div
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="envelope-wrapper"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="envelope">
              {/* Back flap (triangle behind) */}
              <div className="envelope-inner-flap" />
              
              {/* Letter peeking inside */}
              <div className={`envelope-letter-peek ${phase === 'sliding' ? 'slide-out' : ''}`}>
                <div style={{
                  padding: '8px',
                  fontSize: '0.45rem',
                  color: '#999',
                  lineHeight: 1.4,
                  fontFamily: "'Playfair Display', serif",
                }}>
                  <div style={{ 
                    width: '60%', 
                    height: '4px', 
                    background: '#ddd', 
                    borderRadius: '2px',
                    marginBottom: '4px',
                  }} />
                  <div style={{ 
                    width: '80%', 
                    height: '3px', 
                    background: '#e8e8e8', 
                    borderRadius: '2px',
                    marginBottom: '3px',
                  }} />
                  <div style={{ 
                    width: '70%', 
                    height: '3px', 
                    background: '#e8e8e8', 
                    borderRadius: '2px',
                    marginBottom: '3px',
                  }} />
                  <div style={{ 
                    width: '50%', 
                    height: '3px', 
                    background: '#e8e8e8', 
                    borderRadius: '2px',
                  }} />
                </div>
              </div>

              {/* Envelope body */}
              <div className="envelope-body" />

              {/* Top flap */}
              <div className={`envelope-flap ${phase === 'opening' || phase === 'sliding' ? 'open' : ''}`} />

              {/* Wax seal */}
              <div
                className={`wax-seal ${phase === 'cracking' || phase === 'opening' || phase === 'sliding' ? 'cracked' : ''}`}
              >
                <motion.div
                  className="wax-seal-circle"
                  whileHover={phase === 'idle' ? { scale: 1.12 } : {}}
                  whileTap={phase === 'idle' ? { scale: 0.95 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <span className="wax-seal-letter">{getSealLetter()}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Prompt text */}
          <motion.p
            className="envelope-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {phase === 'idle' ? 'Tap to open' : 'Opening...'}
          </motion.p>

          {/* Recipient name hint */}
          {recipientName && (
            <motion.p
              style={{
                marginTop: '1rem',
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem',
                color: 'var(--primary-light)',
                opacity: 0.7,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              {recipientName}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
