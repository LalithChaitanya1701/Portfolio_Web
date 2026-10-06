/**
 * OS Window Manager
 * Provides desktop multi-window capabilities: drag, drop, 8-directional resize, maximize/restore, minimize, and focus.
 * Pinned Directory sidebar or Drawer controls window visibility.
 * Optimized for touch/tablet devices with viewport clamping, generous hit targets, and full edge grabbing.
 */

import { sound } from './sound.js';

export class WindowManager {
  constructor(containerEl, isMobile) {
    this.container = containerEl;
    this.isMobile = isMobile;
    this.windows = new Map(); // id -> window state
    this.topZ = 100;
    this.activeWindowId = null;

    this.onWindowFocus = null;
    this.onWindowClose = null;
    this.onWindowStateChange = null; // (id, winData) => {}
  }

  registerWindow(id, { title, icon = '', contentHtml, defaultPos, defaultSize, onClose, onFocus }) {
    const winEl = document.createElement('div');
    winEl.className = 'os-window';
    winEl.id = `win-${id}`;
    winEl.setAttribute('role', 'dialog');
    winEl.setAttribute('aria-label', title);

    winEl.innerHTML = `
      <div class="win-titlebar" data-win-id="${id}">
        <div class="win-title-left">
          <span class="win-icon" aria-hidden="true">${icon}</span>
          <span class="win-title-text">${title}</span>
        </div>
        <div class="win-controls">
          <button class="win-btn win-min" title="Minimize to taskbar" aria-label="Minimize ${title}"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2.5 9h7"/></svg></button>
          <button class="win-btn win-max" title="Maximize" aria-label="Maximize ${title}"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.5" y="2.5" width="7" height="7" rx="1"/></svg></button>
          <button class="win-btn win-close" title="Close" aria-label="Close ${title}"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>
        </div>
      </div>
      <div class="win-body" id="body-${id}">
        ${contentHtml}
      </div>
      <!-- 8-Direction Resize handles with generous touch hit zones -->
      <div class="win-resizer win-resizer-r" data-edge="r" title="Drag to resize width"></div>
      <div class="win-resizer win-resizer-l" data-edge="l" title="Drag to resize width"></div>
      <div class="win-resizer win-resizer-b" data-edge="b" title="Drag to resize height"></div>
      <div class="win-resizer win-resizer-t" data-edge="t" title="Drag to resize height"></div>
      <div class="win-resizer win-resizer-br" data-edge="br" title="Drag corner to resize"></div>
      <div class="win-resizer win-resizer-bl" data-edge="bl" title="Drag corner to resize"></div>
      <div class="win-resizer win-resizer-tr" data-edge="tr" title="Drag corner to resize"></div>
      <div class="win-resizer win-resizer-tl" data-edge="tl" title="Drag corner to resize"></div>
    `;

    this.container.appendChild(winEl);

    const winData = {
      id,
      el: winEl,
      title,
      icon,
      pos: { ...defaultPos },
      size: { ...defaultSize },
      prevPos: { ...defaultPos },
      prevSize: { ...defaultSize },
      isMaximized: false,
      isMinimized: false,
      isOpen: true,
      zIndex: ++this.topZ,
      onClose,
      onFocus
    };

    this.windows.set(id, winData);

    this.applyGeometry(winData);
    this.bindWindowEvents(winData);
    this.focusWindow(id);

    return winEl;
  }

  bindWindowEvents(win) {
    const titlebar = win.el.querySelector('.win-titlebar');
    const btnMin = win.el.querySelector('.win-min');
    const btnMax = win.el.querySelector('.win-max');
    const btnClose = win.el.querySelector('.win-close');
    const resizers = win.el.querySelectorAll('.win-resizer');

    // Focus on pointerdown
    win.el.addEventListener('pointerdown', () => {
      this.focusWindow(win.id);
    });

    // Minimize / Toggle body
    btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize(win.id);
    });

    // Maximize / Restore
    btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(win.id);
    });

    // Close
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(win.id);
    });

    // Dragging via Titlebar (Pointer Events)
    let isDragging = false;
    let startX = 0, startY = 0;
    let origX = 0, origY = 0;

    titlebar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.win-btn')) return;
      if (win.isMaximized) return;
      const isPhonePortrait = window.innerWidth <= 540 && window.innerHeight > window.innerWidth;
      if (isPhonePortrait) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origX = win.pos.x;
      origY = win.pos.y;

      titlebar.setPointerCapture(e.pointerId);
      win.el.classList.add('is-dragging');
      this.focusWindow(win.id);
      sound.playKey();
    });

    titlebar.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const containerRect = this.container.getBoundingClientRect();
      const maxX = Math.max(10, containerRect.width - win.size.w - 10);
      const maxY = Math.max(10, containerRect.height - 40);

      win.pos.x = Math.max(10, Math.min(maxX, origX + dx));
      win.pos.y = Math.max(10, Math.min(maxY, origY + dy));

      win.el.style.left = `${win.pos.x}px`;
      win.el.style.top = `${win.pos.y}px`;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try { titlebar.releasePointerCapture(e.pointerId); } catch (err) {}
      win.el.classList.remove('is-dragging');
    };

    titlebar.addEventListener('pointerup', endDrag);
    titlebar.addEventListener('pointercancel', endDrag);

    // Double click titlebar to toggle maximize
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.win-btn')) return;
      this.toggleMaximize(win.id);
    });

    // 8-Direction Resizing via Corners & Edges (Pointer Events)
    resizers.forEach(resizer => {
      let isResizing = false;
      let rStartX = 0, rStartY = 0;
      let rOrigW = 0, rOrigH = 0;
      let rOrigX = 0, rOrigY = 0;
      const edge = resizer.getAttribute('data-edge');

      resizer.addEventListener('pointerdown', (e) => {
        if (win.isMaximized) return;
        const isPhonePortrait = window.innerWidth <= 540 && window.innerHeight > window.innerWidth;
        if (isPhonePortrait) return;
        e.stopPropagation();

        isResizing = true;
        rStartX = e.clientX;
        rStartY = e.clientY;
        rOrigW = win.size.w;
        rOrigH = win.size.h;
        rOrigX = win.pos.x;
        rOrigY = win.pos.y;

        resizer.setPointerCapture(e.pointerId);
        win.el.classList.add('is-resizing');
        this.focusWindow(win.id);
        sound.playKey();
      });

      resizer.addEventListener('pointermove', (e) => {
        if (!isResizing) return;
        const dw = e.clientX - rStartX;
        const dh = e.clientY - rStartY;

        const containerRect = this.container.getBoundingClientRect();
        const minW = 280;
        const minH = 180;
        const maxContainerW = containerRect.width;
        const maxContainerH = containerRect.height;

        // Horizontal resizing
        if (edge.includes('r')) {
          const maxW = maxContainerW - win.pos.x - 12;
          win.size.w = Math.max(minW, Math.min(maxW, rOrigW + dw));
        } else if (edge.includes('l')) {
          const maxDeltaLeft = rOrigX - 12;
          const clampedDw = Math.max(-maxDeltaLeft, Math.min(rOrigW - minW, dw));
          win.size.w = rOrigW - clampedDw;
          win.pos.x = rOrigX + clampedDw;
        }

        // Vertical resizing
        if (edge.includes('b')) {
          const maxH = maxContainerH - win.pos.y - 12;
          win.size.h = Math.max(minH, Math.min(maxH, rOrigH + dh));
        } else if (edge.includes('t')) {
          const maxDeltaTop = rOrigY - 12;
          const clampedDh = Math.max(-maxDeltaTop, Math.min(rOrigH - minH, dh));
          win.size.h = rOrigH - clampedDh;
          win.pos.y = rOrigY + clampedDh;
        }

        win.el.style.left = `${win.pos.x}px`;
        win.el.style.top = `${win.pos.y}px`;
        win.el.style.width = `${win.size.w}px`;
        win.el.style.height = `${win.size.h}px`;
      });

      const endResize = (e) => {
        if (!isResizing) return;
        isResizing = false;
        try { resizer.releasePointerCapture(e.pointerId); } catch (err) {}
        win.el.classList.remove('is-resizing');
      };

      resizer.addEventListener('pointerup', endResize);
      resizer.addEventListener('pointercancel', endResize);
    });
  }

  applyGeometry(win) {
    const isPhonePortrait = window.innerWidth <= 540 && window.innerHeight > window.innerWidth;
    if (isPhonePortrait) {
      // Mobile phone portrait: full width stacked
      win.el.style.left = '0';
      win.el.style.top = '0';
      win.el.style.width = '100%';
      win.el.style.height = 'auto';
      return;
    }

    const containerW = this.container.clientWidth || 800;
    const containerH = this.container.clientHeight || 600;

    if (win.isMaximized) {
      win.el.style.left = '0';
      win.el.style.top = '0';
      win.el.style.width = '100%';
      win.el.style.height = '100%';
      return;
    }

    const minW = 280;
    const minH = 180;
    const maxAllowedW = Math.max(minW, containerW - 24);
    const maxAllowedH = Math.max(minH, containerH - 24);

    win.size.w = Math.min(Math.max(minW, win.size.w), maxAllowedW);
    win.size.h = Math.min(Math.max(minH, win.size.h), maxAllowedH);

    // Keep at least 16px padding inside container
    const maxX = Math.max(16, containerW - win.size.w - 16);
    const maxY = Math.max(16, containerH - win.size.h - 16);

    win.pos.x = Math.max(16, Math.min(maxX, win.pos.x));
    win.pos.y = Math.max(16, Math.min(maxY, win.pos.y));

    win.el.style.left = `${win.pos.x}px`;
    win.el.style.top = `${win.pos.y}px`;
    win.el.style.width = `${win.size.w}px`;
    win.el.style.height = `${win.size.h}px`;
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    // If window was minimized, unminimize it on focus
    if (win.isMinimized) {
      win.isMinimized = false;
      win.el.style.display = 'flex';
      win.el.classList.remove('is-minimized');
    }

    this.activeWindowId = id;
    win.zIndex = ++this.topZ;
    win.el.style.zIndex = win.zIndex;

    this.windows.forEach(w => {
      if (w.id === id) {
        w.el.classList.add('win-focused');
      } else {
        w.el.classList.remove('win-focused');
      }
    });

    if (win.onFocus) win.onFocus();
    if (this.onWindowFocus) this.onWindowFocus(id);
    if (this.onWindowStateChange) this.onWindowStateChange(id, win);
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    sound.playNav();
    win.isMaximized = !win.isMaximized;

    if (win.isMaximized) {
      win.prevPos = { ...win.pos };
      win.prevSize = { ...win.size };
      win.el.classList.add('is-maximized');
      const maxBtn = win.el.querySelector('.win-max');
      if (maxBtn) {
        maxBtn.innerHTML = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 2.5h5.5v5.5M2.5 4h5.5v5.5H2.5z"/></svg>';
        maxBtn.title = 'Restore Window';
      }
    } else {
      win.pos = { ...win.prevPos };
      win.size = { ...win.prevSize };
      win.el.classList.remove('is-maximized');
      const maxBtn = win.el.querySelector('.win-max');
      if (maxBtn) {
        maxBtn.innerHTML = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.5" y="2.5" width="7" height="7" rx="1"/></svg>';
        maxBtn.title = 'Maximize Window';
      }
    }

    this.applyGeometry(win);
    this.focusWindow(id);
  }

  toggleMinimize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    sound.playNav();
    win.isMinimized = !win.isMinimized;

    if (win.isMinimized) {
      // Minimize to taskbar: hide the window from desktop canvas
      win.el.style.display = 'none';
      win.el.classList.remove('win-focused');
      if (this.activeWindowId === id) {
        // Transfer focus to next topmost open window
        const nextWin = Array.from(this.windows.values())
          .filter(w => w.isOpen && !w.isMinimized && w.id !== id)
          .sort((a, b) => b.zIndex - a.zIndex)[0];
        if (nextWin) {
          this.focusWindow(nextWin.id);
        } else {
          this.activeWindowId = null;
        }
      }
    } else {
      // Restore from taskbar
      win.el.style.display = 'flex';
      this.applyGeometry(win);
      this.focusWindow(id);
    }

    if (this.onWindowStateChange) this.onWindowStateChange(id, win);
  }

  openWindow(id, options = {}) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isOpen = true;
    win.el.style.display = 'flex';
    win.isMinimized = false;
    win.el.classList.remove('is-minimized');

    // Trigger pop-in visual entrance animation
    win.el.classList.remove('is-popping');
    void win.el.offsetWidth; // Force CSS reflow
    win.el.classList.add('is-popping');

    // Smart Stage Tile Layout
    const isPhonePortrait = window.innerWidth <= 540 && window.innerHeight > window.innerWidth;
    if (!isPhonePortrait && !win.isMaximized) {
      const containerW = this.container.clientWidth || (window.innerWidth - 220);
      const containerH = this.container.clientHeight || (window.innerHeight - 48);

      if (id === 'terminal') {
        const targetW = Math.min(containerW - 32, Math.max(540, Math.floor(containerW * 0.52)));
        const targetH = Math.min(containerH - 40, Math.max(300, Math.floor(containerH * 0.42)));
        win.size.w = targetW;
        win.size.h = targetH;
        win.pos.x = Math.max(16, containerW - targetW - 24);
        win.pos.y = Math.max(16, containerH - targetH - 24);
      } else {
        const targetW = Math.min(containerW - 32, Math.max(win.size.w, Math.min(740, Math.floor(containerW * 0.65))));
        const targetH = Math.min(containerH - 32, Math.max(win.size.h, Math.min(520, Math.floor(containerH * 0.72))));
        win.size.w = targetW;
        win.size.h = targetH;

        const openCount = Array.from(this.windows.values()).filter(w => w.isOpen && w.id !== id && !w.isMinimized).length;
        const stagger = (openCount % 4) * 22;

        const centerX = Math.max(16, Math.floor((containerW - targetW) / 2) + stagger);
        const centerY = Math.max(16, Math.floor((containerH - targetH) / 2) + stagger);

        win.pos.x = Math.min(Math.max(16, centerX), Math.max(16, containerW - targetW - 16));
        win.pos.y = Math.min(Math.max(16, centerY), Math.max(16, containerH - targetH - 16));
      }
    }

    this.applyGeometry(win);
    this.focusWindow(id);
    sound.playNav();

    if (this.onWindowStateChange) this.onWindowStateChange(id, win);
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    // Audible feedback on closing window
    sound.playClose();
    win.isOpen = false;
    win.isMinimized = false;
    win.isMaximized = false;
    win.el.style.display = 'none';
    win.el.classList.remove('win-focused', 'is-minimized', 'is-maximized');

    if (this.activeWindowId === id) {
      const nextWin = Array.from(this.windows.values())
        .filter(w => w.isOpen && !w.isMinimized && w.id !== id)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      if (nextWin) {
        this.focusWindow(nextWin.id);
      } else {
        this.activeWindowId = null;
      }
    }

    if (win.onClose) win.onClose();
    if (this.onWindowClose) this.onWindowClose(id);
    if (this.onWindowStateChange) this.onWindowStateChange(id, win);
  }

  updateContent(id, html) {
    const body = document.getElementById(`body-${id}`);
    if (body) {
      body.innerHTML = html;
    }
  }

  handleResize() {
    this.windows.forEach(win => {
      this.applyGeometry(win);
    });
  }

  // Open all registered windows sequentially with a smooth staggered interval
  openAllWindows(delay = 140) {
    sound.playBoot();
    const ids = Array.from(this.windows.keys());
    ids.forEach((id, idx) => {
      setTimeout(() => {
        this.openWindow(id);
      }, idx * delay);
    });
  }

  // Close all open windows sequentially with a smooth staggered interval
  closeAllWindows(delay = 90) {
    sound.playNav();
    const openWins = Array.from(this.windows.values()).filter(w => w.isOpen);
    openWins.forEach((win, idx) => {
      setTimeout(() => {
        this.closeWindow(win.id);
      }, idx * delay);
    });
  }

  // Arrange open windows according to Portfolio/site docking layout
  arrangeWindows() {
    sound.playBoot();
    const isPhonePortrait = window.innerWidth <= 540 && window.innerHeight > window.innerWidth;
    if (isPhonePortrait) return;

    // 1. Get all currently open & non-minimized windows
    const openWins = Array.from(this.windows.values()).filter(w => w.isOpen && !w.isMinimized);
    if (!openWins.length) return;

    // 2. Un-maximize any maximized window
    openWins.forEach(win => {
      if (win.isMaximized) {
        win.isMaximized = false;
        win.el.classList.remove('is-maximized');
        const maxBtn = win.el.querySelector('.win-max');
        if (maxBtn) {
          maxBtn.innerHTML = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.5" y="2.5" width="7" height="7" rx="1"/></svg>';
          maxBtn.title = 'Maximize Window';
        }
      }
    });

    const GAP = 12;
    const containerW = this.container.clientWidth || window.innerWidth;
    const containerH = this.container.clientHeight || (window.innerHeight - 100);
    const W = containerW - GAP * 2;
    const H = containerH - GAP * 2;

    const termWin = openWins.find(w => w.id === 'terminal');
    const rest = openWins.filter(w => w.id !== 'terminal');

    const place = (win, x, y, w, h) => {
      win.pos.x = GAP + x;
      win.pos.y = GAP + y;
      win.size.w = w;
      win.size.h = h;
      win.el.style.left = `${win.pos.x}px`;
      win.el.style.top = `${win.pos.y}px`;
      win.el.style.width = `${win.size.w}px`;
      win.el.style.height = `${win.size.h}px`;
    };

    if (!rest.length) {
      if (termWin) place(termWin, 0, 0, W, H);
      return;
    }

    const topH = termWin ? Math.round((H - GAP) * 0.62) : H;
    const m = rest.length;
    const cols = m <= 2 ? m : m <= 4 ? 2 : 3;
    const rows = Math.ceil(m / cols);
    const rh = Math.floor((topH - GAP * (rows - 1)) / rows);

    let i = 0;
    for (let r = 0; r < rows; r++) {
      const cnt = r < rows - 1 ? cols : m - cols * (rows - 1);
      const cw = Math.floor((W - GAP * (cnt - 1)) / cnt);
      for (let c = 0; c < cnt; c++) {
        if (i < rest.length) {
          place(rest[i++], Math.round(c * (cw + GAP)), Math.round(r * (rh + GAP)), cw, rh);
        }
      }
    }

    if (termWin) {
      place(termWin, 0, topH + GAP, W, H - topH - GAP);
    }
  }
}
