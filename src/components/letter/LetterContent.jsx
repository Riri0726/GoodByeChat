import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function LetterContent({ content, recipientName }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe direct children for scroll animations
    const elements = containerRef.current.querySelectorAll('.fade-in-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  // Split content into paragraphs for individual animation
  const wrapContentForAnimation = (html) => {
    if (!html) return '';
    
    // Parse the HTML and wrap block elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const blocks = doc.body.children;
    
    let wrappedHtml = '';
    for (let i = 0; i < blocks.length; i++) {
      const el = blocks[i];
      el.classList.add('fade-in-up');
      el.style.transitionDelay = `${i * 0.1}s`;
      wrappedHtml += el.outerHTML;
    }
    
    return wrappedHtml;
  };

  return (
    <div className="letter-view">
      <motion.div
        className="letter-recipient"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {recipientName}
      </motion.div>

      <motion.div
        className="letter-body"
        ref={containerRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        dangerouslySetInnerHTML={{ __html: wrapContentForAnimation(content) }}
      />
    </div>
  );
}
