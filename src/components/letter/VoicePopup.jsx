import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiMic } from 'react-icons/fi';

export default function VoicePopup({ isOpen, onSelect }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="voice-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="voice-popup"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="voice-popup-title">How would you like to experience this?</h2>
            <p className="voice-popup-subtitle">
              This letter comes with a special voice message 🎙️
            </p>

            <div className="voice-popup-options">
              <motion.button
                className="voice-popup-option"
                onClick={() => onSelect('letter')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="voice-popup-option-icon">
                  <FiBookOpen />
                </div>
                <div className="voice-popup-option-text">
                  <h3>📖 Read the Letter</h3>
                  <p>Read at your own pace with background music</p>
                </div>
              </motion.button>

              <motion.button
                className="voice-popup-option"
                onClick={() => onSelect('voice')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="voice-popup-option-icon">
                  <FiMic />
                </div>
                <div className="voice-popup-option-text">
                  <h3>🎙️ Listen to the Voice</h3>
                  <p>Hear the message spoken from the heart</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
