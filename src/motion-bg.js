/**
 * Workstation Motion Background
 * Renders an ambient cybernetic particle matrix and scanning radar lines behind OS windows
 */

export function initWorkstationMotionBg(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let animId = null;
  let width = 0, height = 0;
  let particles = [];
  const particleCount = 45;
  let radarAngle = 0;

  function getThemeRGB() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') || 'crimson';
    if (theme === 'matrix') return { r: 0, g: 255, b: 102 };
    if (theme === 'amber') return { r: 255, g: 176, b: 0 };
    return { r: 200, g: 27, b: 28 };
  }

  function resize() {
    width = (canvas.parentElement && canvas.parentElement.clientWidth > 0) ? canvas.parentElement.clientWidth : window.innerWidth;
    height = (canvas.parentElement && canvas.parentElement.clientHeight > 0) ? canvas.parentElement.clientHeight : window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize particles
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  }

  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const { r, g, b } = getThemeRGB();

    // 1. Radar sweep line from top-right corner
    radarAngle += 0.008;
    const radarLength = Math.max(width, height) * 0.75;
    const rx = width - 40;
    const ry = 40;

    const grad = ctx.createLinearGradient(
      rx, ry,
      rx + Math.cos(radarAngle) * radarLength,
      ry + Math.sin(radarAngle) * radarLength
    );
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + Math.cos(radarAngle) * radarLength, ry + Math.sin(radarAngle) * radarLength);
    ctx.stroke();

    // 2. Draw & connect ambient particles
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particle connecting hairlines
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.globalAlpha = (1 - dist / 110) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0;
    animId = requestAnimationFrame(draw);
  }

  animId = requestAnimationFrame(draw);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}
