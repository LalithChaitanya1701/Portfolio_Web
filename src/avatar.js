/**
 * Procedural Cybernetic Wireframe Avatar
 * Generates an interactive 3D rotating cyber security ID hologram on HTML5 Canvas
 */

export function initWireframeAvatar(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let animId = null;
  let angleX = 0.2;
  let angleY = 0;
  let scanY = 0;

  // Generate 3D faceted geometry (faceted cyber-shield / sphere node grid)
  const points = [];
  const rings = 8;
  const segments = 14;
  const radius = 64;

  for (let r = 0; r <= rings; r++) {
    const phi = (r / rings) * Math.PI;
    const y = Math.cos(phi) * radius;
    const rRing = Math.sin(phi) * radius;
    for (let s = 0; s < segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      const x = Math.cos(theta) * rRing;
      const z = Math.sin(theta) * rRing;
      points.push({ x, y, z, ring: r, seg: s });
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  function getAccentColor() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') || 'amber';
    if (theme === 'amber') return '#ffb000';
    if (theme === 'blue') return '#38a0ff';
    if (theme === 'black') return '#f0f6fc';
    return '#ffb000';
  }

  function render() {
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    ctx.clearRect(0, 0, w, h);

    angleY += 0.015;
    scanY = (scanY + 0.8) % h;

    const cx = w / 2;
    const cy = h / 2;
    const fov = 200;
    const accent = getAccentColor();

    // Rotate and project points
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    const projected = points.map(p => {
      // Rotate Y
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      // Rotate X
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      const scale = fov / (fov + z2 + 100);
      const projX = cx + x1 * scale;
      const projY = cy + y2 * scale;
      return { projX, projY, z: z2, orig: p };
    });

    // Draw mesh lines
    ctx.strokeStyle = accent;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.35;

    for (let r = 0; r <= rings; r++) {
      ctx.beginPath();
      for (let s = 0; s < segments; s++) {
        const idx = r * segments + s;
        const pt = projected[idx];
        if (s === 0) ctx.moveTo(pt.projX, pt.projY);
        else ctx.lineTo(pt.projX, pt.projY);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Longitudinal connecting ribs
    for (let s = 0; s < segments; s++) {
      ctx.beginPath();
      for (let r = 0; r <= rings; r++) {
        const idx = r * segments + s;
        const pt = projected[idx];
        if (r === 0) ctx.moveTo(pt.projX, pt.projY);
        else ctx.lineTo(pt.projX, pt.projY);
      }
      ctx.stroke();
    }

    // Draw glowing vertices
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = accent;
    projected.forEach(pt => {
      if (pt.z < 20) {
        ctx.beginPath();
        ctx.arc(pt.projX, pt.projY, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Horizontal scanning laser line
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, scanY);
    ctx.lineTo(w - 10, scanY);
    ctx.stroke();

    // Subtle outer HUD reticle brackets
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(8, 20); ctx.lineTo(8, 8); ctx.lineTo(20, 8);
    ctx.stroke();
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(w - 20, 8); ctx.lineTo(w - 8, 8); ctx.lineTo(w - 8, 20);
    ctx.stroke();
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(8, h - 20); ctx.lineTo(8, h - 8); ctx.lineTo(20, h - 8);
    ctx.stroke();
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(w - 20, h - 8); ctx.lineTo(w - 8, h - 8); ctx.lineTo(w - 8, h - 20);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    animId = requestAnimationFrame(render);
  }

  animId = requestAnimationFrame(render);

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
