import { useEffect, useRef } from 'react';

/**
 * Organic Nature / Tactile Background Effects for GoodByeChat
 * - Mint: Floating Lily pads, Water Dew Drops, Soft Pond Ripples & Leaves
 * - Blue: Water Droplets, Gentle Pond Ripples & Soft Cloud Puffs
 * - Purple: Lavender Petals, Fluttering Lilac Butterflies & Soft Stardust
 * - Pink: Sakura / Rose Petals & Floating Blush Hearts
 * - Black: Warm Golden Embers & Floating Vintage Parchment Motes
 */

function createParticle(canvas, themeColor) {
  const width = canvas.width;
  const height = canvas.height;

  switch (themeColor) {
    case 'mint': {
      const types = ['lilypad', 'dewdrop', 'ripple', 'leaf'];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        type,
        x: Math.random() * width,
        y: type === 'ripple' ? Math.random() * height : height + 30,
        size: type === 'lilypad' ? Math.random() * 22 + 16 : type === 'dewdrop' ? Math.random() * 6 + 4 : type === 'leaf' ? Math.random() * 14 + 10 : Math.random() * 20 + 10,
        speedY: type === 'dewdrop' ? -(Math.random() * 0.9 + 0.4) : type === 'lilypad' ? -(Math.random() * 0.35 + 0.15) : type === 'leaf' ? -(Math.random() * 0.5 + 0.2) : 0,
        speedX: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.2,
        opacity: type === 'dewdrop' ? Math.random() * 0.5 + 0.3 : Math.random() * 0.4 + 0.35,
        maxRadius: type === 'ripple' ? Math.random() * 45 + 25 : 0,
        radius: 0,
        rippleProgress: 0,
        rippleSpeed: Math.random() * 0.008 + 0.004,
        color: type === 'lilypad' ? '#5FA77F' : type === 'leaf' ? '#74B592' : '#88CBB0',
        swayOffset: Math.random() * Math.PI * 2,
      };
    }

    case 'blue': {
      const types = ['raindrop', 'ripple', 'cloudpuff', 'waterdrop'];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        type,
        x: Math.random() * width,
        y: type === 'ripple' ? Math.random() * height : height + 30,
        size: type === 'cloudpuff' ? Math.random() * 35 + 20 : type === 'waterdrop' || type === 'raindrop' ? Math.random() * 7 + 4 : Math.random() * 15 + 10,
        speedY: type === 'raindrop' || type === 'waterdrop' ? -(Math.random() * 1.1 + 0.5) : -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.4 + 0.25,
        maxRadius: type === 'ripple' ? Math.random() * 50 + 20 : 0,
        radius: 0,
        rippleProgress: 0,
        rippleSpeed: Math.random() * 0.01 + 0.005,
        color: '#60A5FA',
        swayOffset: Math.random() * Math.PI * 2,
      };
    }

    case 'purple': {
      const types = ['lavender_petal', 'butterfly', 'sparkle', 'blossom'];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        type,
        x: Math.random() * width,
        y: height + 30,
        size: type === 'butterfly' ? Math.random() * 16 + 12 : type === 'lavender_petal' ? Math.random() * 12 + 8 : type === 'blossom' ? Math.random() * 14 + 10 : Math.random() * 5 + 3,
        speedY: -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        wingPhase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3,
        color: type === 'butterfly' ? '#A78BFA' : type === 'lavender_petal' ? '#C4B5FD' : '#8B5CF6',
        swayOffset: Math.random() * Math.PI * 2,
      };
    }

    case 'pink': {
      const types = ['cherry_petal', 'heart', 'petal', 'sparkle'];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        type,
        x: Math.random() * width,
        y: height + 30,
        size: type === 'cherry_petal' || type === 'petal' ? Math.random() * 14 + 8 : type === 'heart' ? Math.random() * 12 + 7 : Math.random() * 5 + 3,
        speedY: -(Math.random() * 0.65 + 0.25),
        speedX: (Math.random() - 0.5) * 0.7,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.3,
        color: type === 'heart' ? '#F472B6' : '#FBCFE8',
        swayOffset: Math.random() * Math.PI * 2,
      };
    }

    case 'black':
    default: {
      const types = ['gold_mote', 'paper_scrap', 'ember'];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        type,
        x: Math.random() * width,
        y: height + 30,
        size: type === 'paper_scrap' ? Math.random() * 12 + 6 : Math.random() * 6 + 3,
        speedY: -(Math.random() * 0.6 + 0.2),
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.5 + 0.25,
        color: type === 'gold_mote' || type === 'ember' ? '#D97706' : '#9CA3AF',
        swayOffset: Math.random() * Math.PI * 2,
      };
    }
  }
}

/* ==================== DRAWING HELPERS ==================== */

// Lily pad: circular disc with a radial slice cut out
function drawLilyPad(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  // draw arc from 0.4 to 5.9 radians (leaves a slice open)
  ctx.arc(0, 0, size, 0.35, Math.PI * 2 - 0.35, false);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Subtle inner vein
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.6, -size * 0.2);
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.5, size * 0.4);
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.6, 0);
  ctx.stroke();
}

// Water drop / Dewdrop
function drawWaterDrop(ctx, size) {
  ctx.fillStyle = 'rgba(120, 190, 170, 0.45)';
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.8, -size * 0.2, size, size * 0.6, 0, size);
  ctx.bezierCurveTo(-size, size * 0.6, -size * 0.8, -size * 0.2, 0, -size);
  ctx.fill();

  // Little white highlight shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(-size * 0.3, size * 0.2, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

// Leaf
function drawLeaf(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.6, -size * 0.3, size * 0.6, size * 0.3, 0, size);
  ctx.bezierCurveTo(-size * 0.6, size * 0.3, -size * 0.6, -size * 0.3, 0, -size);
  ctx.fill();

  // Stem line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(0, size * 0.8);
  ctx.stroke();
}

// Ripple on water surface
function drawRipple(ctx, radius, opacity, color = 'rgba(96, 165, 250, ') {
  ctx.strokeStyle = color + opacity + ')';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
}

// Butterfly with animated wing flaps
function drawButterfly(ctx, size, color, wingScale) {
  ctx.fillStyle = color;
  // Left wing
  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(-size * 0.45, -size * 0.3, size * 0.55, size * 0.4, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.4, size * 0.3, size * 0.4, size * 0.28, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(size * 0.45, -size * 0.3, size * 0.55, size * 0.4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.4, size * 0.3, size * 0.4, size * 0.28, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tiny body
  ctx.fillStyle = '#4B286D';
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.5, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Petal (sakura / lavender / rose)
function drawPetal(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.7, -size * 0.5, size * 0.7, size * 0.5, 0, size);
  ctx.bezierCurveTo(-size * 0.7, size * 0.5, -size * 0.7, -size * 0.5, 0, -size);
  ctx.fill();
}

// Heart
function drawHeart(ctx, size, color) {
  const s = size * 0.6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, s / 4);
  ctx.bezierCurveTo(0, 0, -s, 0, -s, s / 4);
  ctx.bezierCurveTo(-s, s / 2, 0, s * 0.8, 0, s);
  ctx.bezierCurveTo(0, s * 0.8, s, s / 2, s, s / 4);
  ctx.bezierCurveTo(s, 0, 0, 0, 0, s / 4);
  ctx.fill();
}

// Cloud puff
function drawCloudPuff(ctx, size) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
  ctx.arc(-size * 0.4, size * 0.1, size * 0.4, 0, Math.PI * 2);
  ctx.arc(size * 0.4, size * 0.1, size * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

export default function FloatingParticles({ themeColor = 'blue' }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const maxParticles = 32;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles spread across canvas
    particlesRef.current = Array.from({ length: maxParticles }, () => {
      const p = createParticle(canvas, themeColor);
      p.y = Math.random() * canvas.height;
      return p;
    });

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      particlesRef.current.forEach((p) => {
        if (p.type === 'ripple') {
          // Ripples expand and fade on water
          p.rippleProgress += p.rippleSpeed;
          p.radius = p.rippleProgress * p.maxRadius;
          const rippleOpacity = Math.max(0, (1 - p.rippleProgress) * p.opacity);

          ctx.save();
          ctx.translate(p.x, p.y);
          const rippleColor = themeColor === 'mint' ? 'rgba(74, 155, 120, ' : 'rgba(96, 165, 250, ';
          drawRipple(ctx, p.radius, rippleOpacity, rippleColor);
          ctx.restore();

          if (p.rippleProgress >= 1) {
            Object.assign(p, createParticle(canvas, themeColor));
            p.type = 'ripple';
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
          }
          return;
        }

        // Drifting particles
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * 1.5 + p.swayOffset) * 0.4;
        p.rotation += p.rotationSpeed;

        if (p.wingPhase !== undefined) {
          p.wingPhase += 0.15;
        }

        // Reset if drifted off screen
        if (p.y < -40 || p.x < -50 || p.x > canvas.width + 50) {
          Object.assign(p, createParticle(canvas, themeColor));
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        switch (p.type) {
          case 'lilypad':
            drawLilyPad(ctx, p.size, p.color);
            break;
          case 'dewdrop':
          case 'waterdrop':
          case 'raindrop':
            drawWaterDrop(ctx, p.size);
            break;
          case 'leaf':
            drawLeaf(ctx, p.size, p.color);
            break;
          case 'butterfly':
            const wingScale = Math.abs(Math.sin(p.wingPhase)) * 0.7 + 0.3;
            drawButterfly(ctx, p.size, p.color, wingScale);
            break;
          case 'lavender_petal':
          case 'cherry_petal':
          case 'petal':
          case 'blossom':
            drawPetal(ctx, p.size, p.color);
            break;
          case 'heart':
            drawHeart(ctx, p.size, p.color);
            break;
          case 'cloudpuff':
            drawCloudPuff(ctx, p.size);
            break;
          case 'gold_mote':
          case 'ember':
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'paper_scrap':
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
            break;
          case 'sparkle':
          default:
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [themeColor]);

  return (
    <div className="particles-container">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
      />
    </div>
  );
}
