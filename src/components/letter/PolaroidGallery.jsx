import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function PolaroidGallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const observerRef = useRef(null);
  const galleryRef = useRef(null);

  // Generate random rotations for each polaroid
  const rotations = useRef(
    images.map(() => (Math.random() - 0.5) * 12) // -6 to 6 degrees
  ).current;

  useEffect(() => {
    if (!galleryRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const polaroids = galleryRef.current.querySelectorAll('.fade-in-up');
    polaroids.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="polaroid-gallery" ref={galleryRef}>
        <motion.h2
          className="polaroid-gallery-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our Memories Together ✨
        </motion.h2>

        <div className="polaroid-grid">
          {images.map((image, index) => (
            <motion.div
              key={image.id || index}
              className="polaroid fade-in-up"
              style={{
                '--rotation': `${rotations[index]}deg`,
                transform: `rotate(${rotations[index]}deg)`,
                transitionDelay: `${index * 0.15}s`,
              }}
              initial={{ opacity: 0, y: 40, rotate: rotations[index] }}
              whileInView={{ opacity: 1, y: 0, rotate: rotations[index] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                rotate: 0, 
                scale: 1.05,
                boxShadow: '0 15px 50px rgba(0,0,0,0.35)',
                zIndex: 10,
              }}
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={image.image_url}
                alt={image.caption || `Memory ${index + 1}`}
                loading="lazy"
              />
              {image.caption && (
                <div className="polaroid-caption">{image.caption}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <motion.div
          className="lightbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxIndex(null)}
        >
          <motion.img
            className="lightbox-image"
            src={images[lightboxIndex].image_url}
            alt={images[lightboxIndex].caption || ''}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
                }}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % images.length);
                }}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                ›
              </button>
            </>
          )}
        </motion.div>
      )}
    </>
  );
}
