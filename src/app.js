/**
 * Application Orchestrator
 * Seamlessly connects the Cinematic Landing Page and the HUD Workstation.
 */

import { sound } from './sound.js';
import { TerminalEngine } from './terminal.js';
import { HUDController } from './hud.js';

class App {
  constructor() {
    this.currentMode = 'landing'; // 'landing' | 'hud'
    this.currentTheme = 'crimson'; // 'crimson' | 'matrix' | 'amber'
  }

  init() {
    this.hud = new HUDController({
      onBackToLanding: () => this.switchMode('landing'),
      onThemeChange: (theme) => this.setTheme(theme),
      onSoundToggle: (state) => this.toggleSound(state)
    });

    this.terminal = new TerminalEngine({
      onPanelChange: (panelId) => {
        this.switchMode('hud');
        this.hud.setPanel(panelId);
      },
      onThemeChange: (theme) => this.setTheme(theme),
      onSoundToggle: (state) => this.toggleSound(state),
      onPrintResume: () => this.hud.openResumeModal(),
      onReturnToLanding: () => this.switchMode('landing')
    });

    this.hud.mount();

    const termInput = document.getElementById('term-input');
    const termOutput = document.getElementById('term-output');
    const termChips = document.getElementById('term-chips');
    if (termInput && termOutput && termChips) {
      this.terminal.attach(termInput, termOutput, termChips);
    }

    this.bindEvents();
    this.initVideoSync();
    this.initEntranceAnimation();
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === 'hud') {
      document.body.classList.add('mode-hud');
      sound.playBoot();
      // Auto-focus terminal on desktop
      if (window.innerWidth > 768) {
        const input = document.getElementById('term-input');
        if (input) setTimeout(() => input.focus(), 300);
      }
    } else {
      document.body.classList.remove('mode-hud');
      sound.playNav();
    }
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    const themeBtn = document.getElementById('hud-theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = `THEME: ${themeName.toUpperCase()}`;
    }
    sound.playSuccess();
  }

  cycleTheme() {
    const themes = ['crimson', 'matrix', 'amber'];
    const nextIdx = (themes.indexOf(this.currentTheme) + 1) % themes.length;
    this.setTheme(themes[nextIdx]);
  }

  toggleSound(explicitState) {
    const state = explicitState !== undefined ? sound.setEnabled(explicitState) : sound.toggle();
    const soundBtn = document.getElementById('hud-sound-toggle');
    if (soundBtn) {
      soundBtn.textContent = `SOUND: ${state ? 'ON' : 'OFF'}`;
    }
    return state;
  }

  bindEvents() {
    // "Secure system" buttons trigger HUD boot
    document.querySelectorAll('.btn-top, .btn-cta, .btn-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchMode('hud');
      });
    });

    // Landing nav links trigger HUD with specific panels
    document.querySelectorAll('.nav-item, .sublink, .mrow').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          this.switchMode('hud');
          const target = href.replace('#', '');
          if (['home', 'about', 'experience', 'projects', 'skills', 'certs', 'contact'].includes(target)) {
            this.hud.setPanel(target);
          } else if (target === 'resources' || target === 'docs') {
            this.hud.setPanel('projects');
          } else if (target === 'benefits' || target === 'monitoring') {
            this.hud.setPanel('experience');
          } else {
            this.hud.setPanel('about');
          }
        }
      });
    });

    // Return to Landing button from HUD
    document.getElementById('hud-back-btn')?.addEventListener('click', () => {
      this.switchMode('landing');
    });

    // Theme toggle button
    document.getElementById('hud-theme-toggle')?.addEventListener('click', () => {
      this.cycleTheme();
    });

    // Sound toggle button
    document.getElementById('hud-sound-toggle')?.addEventListener('click', () => {
      this.toggleSound();
    });

    // Mobile burger & menu toggle for landing
    const burger = document.querySelector('.burger');
    const menu = document.getElementById('menu');
    const backdrop = document.getElementById('menu-backdrop');
    const menuCloseBtn = document.getElementById('menu-close-btn');

    const openMenu = () => {
      document.body.classList.add('nav-open');
      burger?.setAttribute('aria-expanded', 'true');
      burger?.setAttribute('aria-label', 'Close menu');
      menu?.setAttribute('aria-hidden', 'false');
      backdrop?.setAttribute('aria-hidden', 'false');
      sound.playNav();
    };

    const closeMenu = () => {
      document.body.classList.remove('nav-open');
      burger?.setAttribute('aria-expanded', 'false');
      burger?.setAttribute('aria-label', 'Open menu');
      menu?.setAttribute('aria-hidden', 'true');
      backdrop?.setAttribute('aria-hidden', 'true');
      sound.playKey();
    };

    if (burger && menu) {
      burger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = document.body.classList.contains('nav-open');
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      menuCloseBtn?.addEventListener('click', () => closeMenu());
      backdrop?.addEventListener('click', () => closeMenu());

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
          closeMenu();
          burger.focus();
        }
      });

      // Accordion buttons in landing mobile menu
      document.querySelectorAll('.mrow-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const parent = btn.closest('.has-acc');
          const subnav = parent?.querySelector('.subnav');
          const isExp = btn.getAttribute('aria-expanded') === 'true';
          document.querySelectorAll('.mrow-btn').forEach(b => {
            if (b !== btn) {
              b.setAttribute('aria-expanded', 'false');
              b.closest('.has-acc')?.querySelector('.subnav')?.classList.remove('open');
            }
          });
          if (isExp) {
            btn.setAttribute('aria-expanded', 'false');
            subnav?.classList.remove('open');
          } else {
            btn.setAttribute('aria-expanded', 'true');
            subnav?.classList.add('open');
            sound.playNav();
          }
        });
      });
    }
  }

  initVideoSync() {
    const videos = Array.from(document.querySelectorAll('video'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videos.forEach(v => {
        v.removeAttribute('autoplay');
        v.pause();
      });
      return;
    }

    if (videos.length > 0) {
      const master = videos[0];
      const followers = videos.slice(1);
      master.addEventListener('timeupdate', () => {
        const t = master.currentTime;
        followers.forEach(f => {
          if (Math.abs(f.currentTime - t) > 0.12) {
            f.currentTime = t;
          }
        });
      });
      master.addEventListener('play', () => followers.forEach(f => f.play().catch(() => {})));
      master.addEventListener('pause', () => followers.forEach(f => f.pause()));
    }
  }

  initEntranceAnimation() {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || typeof document.documentElement.animate !== 'function') {
      document.documentElement.classList.remove('intro');
      return;
    }

    let started = false;
    const run = () => {
      if (started) return;
      started = true;

      const probe = document.getElementById('s-probe');
      const s = probe ? (probe.getBoundingClientRect().width / 100) : 1;
      const F = window.innerWidth <= 599 ? 0.86 : 1.0;

      const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
      const QUINT = 'cubic-bezier(0.22, 1, 0.36, 1)';
      const QUART = 'cubic-bezier(0.25, 1, 0.5, 1)';
      const TYPE = 'cubic-bezier(0.22, 0.85, 0.24, 1)';

      const anims = [];
      const anim = (el, kf, opt) => {
        if (!el) return null;
        try {
          const a = el.animate(kf, { fill: 'forwards', ...opt });
          anims.push(a);
          return a;
        } catch (e) {
          return null;
        }
      };

      // 0.00 Logo
      anim(document.querySelector('.logo'), [
        { opacity: 0, transform: 'scale(0.9)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 700 * F, delay: 0, easing: EXPO });

      // 0.12 Nav
      document.querySelectorAll('.nav-item').forEach((item, i) => {
        anim(item, [
          { opacity: 0, transform: `translateY(${7 * s}px)` },
          { opacity: 1, transform: 'translateY(0px)' }
        ], { duration: 620 * F, delay: (120 + i * 55) * F, easing: QUINT });
      });

      // 0.18 Burger
      anim(document.querySelector('.burger'), [
        { opacity: 0 }, { opacity: 1 }
      ], { duration: 550 * F, delay: 180 * F, easing: QUART });

      // 0.28 Top CTA
      anim(document.querySelector('.btn-top'), [
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)' }
      ], { duration: 660 * F, delay: 280 * F, easing: EXPO });

      // 0.34 H1 lines
      document.querySelectorAll('.hero .ln > span').forEach((span, i) => {
        anim(span, [
          { transform: 'translateY(120%)' },
          { transform: 'translateY(0%)' }
        ], { duration: 980 * F, delay: (340 + i * 90) * F, easing: TYPE });
      });

      // 0.74 Sub
      anim(document.querySelector('.hero .sub'), [
        { opacity: 0, transform: `translateY(${14 * s}px)` },
        { opacity: 1, transform: 'translateY(0px)' }
      ], { duration: 720 * F, delay: 740 * F, easing: QUINT });

      // 0.90 Hero CTA
      anim(document.querySelector('.hero .btn-cta'), [
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)' }
      ], { duration: 700 * F, delay: 900 * F, easing: EXPO });

      // 0.98 Rules
      document.querySelectorAll('.vrule').forEach((r, i) => {
        anim(r, [
          { transform: 'scaleY(0)' },
          { transform: 'scaleY(1)' }
        ], { duration: 600 * F, delay: (980 + i * 70) * F, easing: QUART });
      });

      // 1.04 Stat nums
      document.querySelectorAll('.stat-num').forEach((num, i) => {
        anim(num, [
          { opacity: 0, transform: `translateY(${12 * s}px)` },
          { opacity: 1, transform: 'translateY(0px)' }
        ], { duration: 660 * F, delay: (1040 + i * 85) * F, easing: QUINT });
      });

      // 1.10 Stat labs
      let lastA = null;
      document.querySelectorAll('.stat-lab').forEach((lab, i) => {
        lastA = anim(lab, [
          { opacity: 0, transform: `translateY(${10 * s}px)` },
          { opacity: 1, transform: 'translateY(0px)' }
        ], { duration: 620 * F, delay: (1100 + i * 85) * F, easing: QUINT });
      });

      const cleanup = () => {
        document.documentElement.classList.remove('intro');
        anims.forEach(a => { try { a.cancel(); } catch (e) {} });
      };

      if (lastA?.finished) {
        lastA.finished.then(cleanup).catch(cleanup);
      } else {
        setTimeout(cleanup, 2200 * F);
      }
      setTimeout(cleanup, 4000);
    };

    const fontP = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontP, new Promise(res => setTimeout(res, 1000))]).then(() => {
      requestAnimationFrame(run);
    });
    setTimeout(run, 1200);
  }
}

// Boot application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App().init());
} else {
  new App().init();
}
