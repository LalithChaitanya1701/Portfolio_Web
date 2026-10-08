/**
 * HUD Workstation Controller with OS Window Management
 * Integrates draggable, resizable, maximizable window tiles:
 * - Overview & Telemetry (merged)
 * - Terminal (unpinned OS window)
 * - 3D Glass Cyber Cube (Three.js chromatic dispersion)
 * - About, Experience, Projects, Skills, Certifications, Contact
 * - Collapsible mobile/tablet directory drawer (Menu button)
 * - Text-only directory (zero emojis)
 */

import { PERSONAL_INFO, EXPERIENCES, PROJECTS, SKILL_GROUPS, CERTIFICATIONS } from './data.js';
import { sound } from './sound.js';
import { initWireframeAvatar } from './avatar.js';
import { initCyberCube } from './cube.js';
import { WindowManager } from './window-manager.js';
import { initWorkstationMotionBg } from './motion-bg.js';

export class HUDController {
  constructor({ onBackToLanding, onThemeChange, onSoundToggle }) {
    this.onBackToLanding = onBackToLanding;
    this.onThemeChange = onThemeChange;
    this.onSoundToggle = onSoundToggle;

    this.winManager = null;
    this.experienceMode = 'narrative'; // 'narrative' | 'specs'
    this.avatarCleanup = null;
    this.cubeCleanup = null;
    this.motionBgCleanup = null;
  }

  mount() {
    const desktopArea = document.getElementById('hud-desktop-area');
    if (!desktopArea) return;

    this.winManager = new WindowManager(desktopArea, window.innerWidth <= 680);

    // SVG Icons for each distinct workstation window
    this.icons = {
      overview: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5L8 2.5l5.5 4v6.5a1 1 0 01-1 1h-9a1 1 0 01-1-1v-6.5z"/><path d="M6 14V8.5h4V14"/></svg>',
      terminal: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5l4 3-4 3M8.5 12H13"/></svg>',
      about: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 13.5a5.5 5.5 0 0111 0"/></svg>',
      experience: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="11" height="9" rx="1.5"/><path d="M6 4V2.5h4V4M2.5 8h11"/></svg>',
      projects: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 3.5h4l1.5 2H13.5a1 1 0 011 1v6a1 1 0 01-1 1h-11a1 1 0 01-1-1v-8a1 1 0 011-1z"/></svg>',
      skills: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>',
      certs: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="4"/><path d="M5.5 9.5L4 14.5l4-2 4 2-1.5-5"/></svg>',
      contact: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="11" height="9" rx="1.5"/><path d="M2.5 5.5l5.5 4 5.5-4"/></svg>'
    };

    this.winManager.onWindowStateChange = () => {
      this.renderTaskbar();
    };

    // 1. Initialize interactive 3D Cyber Cube on the workstation background by default
    const cubeBg = document.getElementById('hud-cube-bg');
    if (cubeBg) {
      try {
        this.cubeCleanup = initCyberCube(cubeBg);
      } catch (err) {
        console.warn('3D Cyber Cube background init skipped:', err);
      }
    }

    // 2. Initialize ambient workstation motion background (particles & radar)
    this.motionBgCleanup = initWorkstationMotionBg('hud-motion-bg');

    this.initWindows();
    this.renderDirectory();
    this.renderTaskbar();
    this.initThreatMonitor();
    this.setupResumeModal();
    this.setupDirectoryToggle();
    this.setupArrangeButton();

    window.addEventListener('resize', () => {
      if (this.winManager) this.winManager.handleResize();
    });
  }

  setupArrangeButton() {
    const arrangeBtn = document.getElementById('hud-arrange-btn');
    arrangeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.winManager) {
        this.winManager.arrangeWindows();
      }
    });
  }

  setupDirectoryToggle() {
    const toggleBtn = document.getElementById('hud-dir-toggle');
    const menu = document.getElementById('hud-start-menu');

    const closeDir = () => {
      menu?.classList.remove('open');
      toggleBtn?.setAttribute('aria-expanded', 'false');
    };

    const openDir = () => {
      menu?.classList.add('open');
      toggleBtn?.setAttribute('aria-expanded', 'true');
      sound.playNav();
    };

    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu?.classList.contains('open')) {
        closeDir();
      } else {
        openDir();
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tb-start-wrap')) {
        closeDir();
      }
    });
  }

  initWindows() {
    const desktopArea = document.getElementById('hud-desktop-area');
    const isSmall = window.innerWidth <= 1024 || window.innerHeight <= 650;
    const isMobile = window.innerWidth <= 540 && window.innerHeight > window.innerWidth;

    const cW = (desktopArea && desktopArea.clientWidth > 100) ? desktopArea.clientWidth : (window.innerWidth - (isSmall ? 0 : 220));
    const cH = (desktopArea && desktopArea.clientHeight > 100) ? desktopArea.clientHeight : (window.innerHeight - 48);

    // Responsive window bounds calculation - ensures generous clearance from all edges and corners
    const getWinBounds = (targetW, targetH, offsetX = 20, offsetY = 20) => {
      const w = isMobile ? Math.min(cW - 16, 360) : Math.min(cW - 40, targetW);
      const h = isMobile ? Math.min(cH - 20, 520) : Math.min(cH - 40, targetH);
      const x = isMobile ? 8 : Math.max(16, Math.min(cW - w - 20, offsetX));
      const y = isMobile ? 8 : Math.max(16, Math.min(cH - h - 20, offsetY));
      return { pos: { x, y }, size: { w, h } };
    };

    // 1. About // Whoami Window (Unified Profile, Photo & System Dossier)
    const aboutBounds = getWinBounds(isSmall ? 620 : 800, isSmall ? 480 : 530, 20, 20);
    this.winManager.registerWindow('about', {
      title: 'WIN://ABOUT_WHOAMI.SYS',
      icon: this.icons.about,
      contentHtml: this.getAboutHtml(),
      defaultPos: aboutBounds.pos,
      defaultSize: aboutBounds.size,
      onFocus: () => {
        const wrap = document.getElementById('avatar-canvas-wrap');
        if (wrap && wrap.style.display === 'block' && !this.avatarCleanup) {
          setTimeout(() => {
            this.avatarCleanup = initWireframeAvatar('avatar-canvas');
          }, 40);
        }
      },
      onClose: () => {
        if (this.avatarCleanup) {
          this.avatarCleanup();
          this.avatarCleanup = null;
        }
      }
    });

    // 2. Terminal Window (UNPINNED OS WINDOW)
    const termBounds = getWinBounds(isSmall ? 580 : 660, isSmall ? 320 : 360, 30, 40);
    this.winManager.registerWindow('terminal', {
      title: 'WIN://VISITOR_TERMINAL.SH',
      icon: this.icons.terminal,
      contentHtml: this.getTerminalHtml(),
      defaultPos: termBounds.pos,
      defaultSize: termBounds.size,
      onFocus: () => {
        setTimeout(() => {
          const input = document.getElementById('term-input');
          if (input && window.innerWidth > 680) input.focus();
        }, 50);
      }
    });

    // 3. Experience Debrief Window
    const expBounds = getWinBounds(isSmall ? 620 : 700, isSmall ? 460 : 490, 30, 30);
    this.winManager.registerWindow('experience', {
      title: 'WIN://EXPERIENCE_DEBRIEF.LOG',
      icon: this.icons.experience,
      contentHtml: this.getExperienceHtml(),
      defaultPos: expBounds.pos,
      defaultSize: expBounds.size
    });

    // 4. Projects Window
    const projBounds = getWinBounds(isSmall ? 620 : 700, isSmall ? 460 : 490, 35, 35);
    this.winManager.registerWindow('projects', {
      title: 'WIN://REPOSITORIES.JSON',
      icon: this.icons.projects,
      contentHtml: this.getProjectsHtml(),
      defaultPos: projBounds.pos,
      defaultSize: projBounds.size
    });

    // 5. Skills Matrix Window
    const skillsBounds = getWinBounds(isSmall ? 600 : 660, isSmall ? 420 : 450, 40, 40);
    this.winManager.registerWindow('skills', {
      title: 'WIN://SKILLS_TELEMETRY.MAT',
      icon: this.icons.skills,
      contentHtml: this.getSkillsHtml(),
      defaultPos: skillsBounds.pos,
      defaultSize: skillsBounds.size
    });

    // 6. Certifications Window
    const certsBounds = getWinBounds(isSmall ? 580 : 640, isSmall ? 380 : 400, 45, 45);
    this.winManager.registerWindow('certs', {
      title: 'WIN://CERTIFICATIONS.SEC',
      icon: this.icons.certs,
      contentHtml: this.getCertsHtml(),
      defaultPos: certsBounds.pos,
      defaultSize: certsBounds.size
    });

    // 7. Contact Window
    const contactBounds = getWinBounds(isSmall ? 540 : 580, isSmall ? 360 : 360, 50, 50);
    this.winManager.registerWindow('contact', {
      title: 'WIN://COMM_CHANNELS.IO',
      icon: this.icons.contact,
      contentHtml: this.getContactHtml(),
      defaultPos: contactBounds.pos,
      defaultSize: contactBounds.size
    });

    // Close others initially, open About // Whoami
    ['terminal', 'experience', 'projects', 'skills', 'certs', 'contact'].forEach(id => {
      this.winManager.closeWindow(id);
    });

    this.winManager.openWindow('about');
    this.bindInternalEvents();
  }

  renderDirectory() {
    const navContainer = document.getElementById('hud-nav-list');
    if (!navContainer) return;

    const sections = [
      { id: 'about', label: 'ABOUT // WHOAMI' },
      { id: 'terminal', label: 'TERMINAL' },
      { id: 'experience', label: 'EXPERIENCE LOG' },
      { id: 'projects', label: 'PROJECTS' },
      { id: 'skills', label: 'SKILLS MATRIX' },
      { id: 'certs', label: 'CERTS & AWARDS' },
      { id: 'contact', label: 'OPEN CHANNEL' }
    ];

    navContainer.innerHTML = '';
    sections.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'tb-menu-item';
      btn.id = `dir-${item.id}`;
      const ico = this.icons[item.id] || '';
      btn.innerHTML = `
        <span class="tb-ico">${ico}</span>
        <span class="tb-label">${item.label}</span>
        <span class="tb-state"></span>
      `;
      btn.addEventListener('click', () => {
        this.openOrFocus(item.id);
        document.getElementById('hud-start-menu')?.classList.remove('open');
        document.getElementById('hud-dir-toggle')?.setAttribute('aria-expanded', 'false');
      });
      navContainer.appendChild(btn);
    });

    this.updateDirectoryHighlight('about');
  }

  renderTaskbar() {
    const container = document.getElementById('hud-taskbar-items');
    const sep = document.getElementById('tb-sep');
    if (!container || !this.winManager) return;

    container.innerHTML = '';

    const labelMap = {
      about: 'ABOUT // WHOAMI',
      terminal: 'TERMINAL',
      experience: 'EXPERIENCE',
      projects: 'PROJECTS',
      skills: 'SKILLS',
      certs: 'CERTS',
      contact: 'CONTACT'
    };

    let count = 0;
    this.winManager.windows.forEach((win, id) => {
      if (!win.isOpen) return;
      count++;

      const btn = document.createElement('button');
      btn.className = 'tb-item';
      if (this.winManager.activeWindowId === id && !win.isMinimized) {
        btn.classList.add('is-active');
      }
      if (win.isMinimized) {
        btn.classList.add('is-minimized');
      }

      const iconSvg = win.icon || this.icons[id] || '';
      const label = labelMap[id] || id.toUpperCase();

      btn.innerHTML = `
        <span class="tb-ico">${iconSvg}</span>
        <span class="tb-label">${label}</span>
      `;

      btn.title = win.isMinimized ? `Restore ${label}` : `Focus/Minimize ${label}`;

      btn.addEventListener('click', () => {
        if (win.isMinimized) {
          this.winManager.toggleMinimize(id);
        } else if (this.winManager.activeWindowId === id) {
          // If already focused and clicked on taskbar, minimize it (Windows OS behavior)
          this.winManager.toggleMinimize(id);
        } else {
          this.winManager.focusWindow(id);
        }
      });

      container.appendChild(btn);
    });

    if (sep) {
      sep.classList.toggle('is-hidden', count === 0);
    }

    this.updateDirectoryHighlight(this.winManager.activeWindowId || 'about');
  }

  updateDirectoryHighlight(activeId) {
    document.querySelectorAll('.tb-menu-item').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`dir-${activeId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update open indicators
    if (this.winManager) {
      this.winManager.windows.forEach((win, id) => {
        const itemBtn = document.getElementById(`dir-${id}`);
        if (itemBtn) {
          itemBtn.classList.toggle('is-open', win.isOpen);
        }
      });
    }

    const panelLabel = document.getElementById('hud-current-panel');
    if (panelLabel && activeId) {
      panelLabel.textContent = activeId.toUpperCase();
    }
  }

  openOrFocus(id) {
    if (!this.winManager) return;
    const win = this.winManager.windows.get(id);
    if (!win) return;

    if (!win.isOpen) {
      this.winManager.openWindow(id);
    } else if (win.isMinimized) {
      this.winManager.toggleMinimize(id);
    } else {
      this.winManager.focusWindow(id);
    }
    sound.playNav();
  }

  setPanel(panelId) {
    const mapped = (panelId === 'home' || panelId === 'overview' || panelId === 'whoami') ? 'about' : panelId;
    this.openOrFocus(mapped);
  }

  getTerminalHtml() {
    return `
      <div style="display:flex;flex-direction:column;height:100%;min-height:220px">
        <div class="term-output" id="term-output" aria-live="polite" style="flex:1;min-height:140px;overflow-y:auto"></div>
        <div class="term-input-row" style="margin-top:auto">
          <label for="term-input" class="term-prompt">visitor@lcm:~$</label>
          <input id="term-input" class="term-input" type="text" autocomplete="off" spellcheck="false" placeholder="type /help to get all commands">
        </div>
      </div>
    `;
  }

  getAboutHtml() {
    return `
      <div class="about-layout">
        <div class="about-left-col">
          <div style="font-size:11px;color:var(--accent);letter-spacing:0.18em;margin-bottom:8px">> SYSTEM STATUS: NORMAL // WHOAMI DOSSIER</div>

          <!-- Operator ID & Bio with Photo Card -->
          <div style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.75);padding:16px;margin-bottom:14px;border-radius:6px">
            <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">
              <!-- Photo / Cyber ID Media Badge -->
              <div class="profile-photo-card" style="width:160px;flex:none;border:1px solid var(--accent-border);background:rgba(2,10,5,0.9);padding:8px;border-radius:6px;display:flex;flex-direction:column;align-items:center;position:relative">
                <div class="profile-photo-frame" style="position:relative;width:100%;height:190px;overflow:hidden;border-radius:4px;border:1px solid rgba(var(--accent-rgb),0.5);background:#020a05">
                  <picture id="profile-pic-el">
                    <source srcset="./my_img_opt.webp" type="image/webp">
                    <source srcset="./my_img_opt.jpg" type="image/jpeg">
                    <img src="./my_img_opt.jpg" alt="${PERSONAL_INFO.name}" style="width:100%;height:100%;object-fit:cover;object-position:center 15%;display:block">
                  </picture>
                  <div class="photo-scanline" style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 65%,rgba(2,10,5,0.5)),repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(var(--accent-rgb),0.04) 3px)"></div>
                  <div class="avatar-canvas-wrap" id="avatar-canvas-wrap" style="position:absolute;inset:0;display:none;background:#020a05">
                    <canvas id="avatar-canvas" style="width:100%;height:100%"></canvas>
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-top:8px">
                  <span style="font-size:10px;color:var(--accent);letter-spacing:0.1em;font-weight:700">ID: LCM-SEC</span>
                  <span style="font-size:9.5px;color:#78d496;display:flex;align-items:center;gap:4px">
                    <span class="win-led" style="width:5px;height:5px"></span> ACTIVE
                  </span>
                </div>
                <!-- Visual Mode Toggle (Photo vs 3D Hologram) -->
                <button id="toggle-avatar-mode" class="hud-btn" style="width:100%;margin-top:6px;font-size:9.5px;padding:3px 6px;letter-spacing:0.06em" title="Toggle between Photo and 3D Wireframe Hologram">
                  SWITCH: 3D HOLOGRAM
                </button>
              </div>

              <!-- Header Info & Summary -->
              <div style="flex:1;min-width:240px">
                <h1 style="font-family:'SG',sans-serif;font-weight:700;font-size:26px;color:#fff;margin:0 0 4px;line-height:1.2">
                  ${PERSONAL_INFO.name}
                </h1>
                <div style="font-size:13.5px;color:var(--accent);letter-spacing:0.06em;margin-bottom:12px;font-weight:600">
                  ${PERSONAL_INFO.title} · ${PERSONAL_INFO.location}
                </div>
                <p style="color:#d8fae4;line-height:1.65;font-size:13px;margin:0 0 12px">
                  ISC²-certified Cybersecurity Analyst &amp; Systems Engineer. Specialist in offensive web application assessment (VAPT),
                  cloud infrastructure compliance automation (AWS/Terraform), and high-throughput SIEM threat detection. Bridging application
                  security with infrastructure to ensure defenses withstand realistic threat models.
                </p>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <span style="font-size:11px;border:1px solid var(--accent-border);padding:2px 8px;color:var(--accent);background:rgba(var(--accent-rgb),0.08)">ISC² CC CERTIFIED</span>
                  <span style="font-size:11px;border:1px solid var(--accent-border);padding:2px 8px;color:#78d496;background:rgba(2,10,5,0.6)">SOC LEVEL 1/2</span>
                  <span style="font-size:11px;border:1px solid var(--accent-border);padding:2px 8px;color:#a8e5be;background:rgba(2,10,5,0.6)">VAPT SPECIALIST</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Academic Background Card -->
          <div style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.7);padding:14px;margin-bottom:14px;border-radius:6px">
            <div style="color:var(--accent);font-size:11.5px;letter-spacing:0.12em;font-weight:700;margin-bottom:6px">ACADEMIC BACKGROUND &amp; EDUCATION</div>
            <div style="color:#fff;font-weight:700;font-size:14px">${PERSONAL_INFO.education.institution}</div>
            <div style="color:#a8e5be;font-size:12.5px;margin-top:2px">${PERSONAL_INFO.education.degree} (${PERSONAL_INFO.education.specialization})</div>
            <div style="color:var(--accent);font-size:12px;margin-top:4px;font-weight:600">${PERSONAL_INFO.education.gpa} · ${PERSONAL_INFO.education.period}</div>
            <div style="color:#72cf90;font-size:11.5px;margin-top:6px;line-height:1.5">Relevant coursework: ${PERSONAL_INFO.education.coursework.join(' · ')}</div>
          </div>

          <!-- Metric Tiles Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin-bottom:14px">
            ${PERSONAL_INFO.stats.map(s => `
              <div style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.7);padding:12px;border-radius:6px">
                <div style="font-family:'SG',sans-serif;font-size:24px;font-weight:700;color:var(--accent)">${s.value}</div>
                <div style="font-size:11px;color:#fff;margin-top:2px;font-weight:600">${s.label}</div>
                <div style="font-size:10px;color:#78d496;margin-top:2px">${s.sub}</div>
              </div>
            `).join('')}
          </div>

          <!-- Quick Actions Row -->
          <div style="border-left:3px solid var(--accent);padding:10px 14px;background:var(--accent-dim);color:#e2f7ea;font-size:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-radius:0 6px 6px 0">
            <span>Workstation controls: drag headers, resize edges, or navigate modules via Directory.</span>
            <div style="display:flex;gap:8px">
              <button id="quick-resume-btn" class="hud-btn" style="background:var(--accent);color:#000;font-weight:bold;border:none">PRINT RESUME</button>
              <button id="quick-terminal-btn" class="hud-btn">LAUNCH TERMINAL</button>
            </div>
          </div>
        </div>

        <!-- Telemetry & Threat Monitor Report Column -->
        <div class="about-right-col">
          <div class="telemetry-card" style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.85);padding:16px;border-radius:6px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid rgba(var(--accent-rgb),0.25);padding-bottom:8px">
              <span style="font-size:12px;color:var(--accent);letter-spacing:0.12em;font-weight:700">LIVE THREAT MONITOR &amp; TELEMETRY REPORT</span>
              <span style="font-size:10.5px;color:#72cf90;display:flex;align-items:center;gap:6px">
                <span class="win-led"></span> ACTIVE INGESTION
              </span>
            </div>

            <div style="display:flex;flex-direction:column;gap:14px">
              <div>
                <div id="threat-bars" style="display:flex;align-items:flex-end;gap:5px;height:54px">
                  <div class="threat-bar" style="flex:1;height:45%;background:var(--accent);opacity:0.7;transition:height 0.8s ease"></div>
                  <div class="threat-bar" style="flex:1;height:75%;background:var(--accent);opacity:0.9;transition:height 0.8s ease"></div>
                  <div class="threat-bar" style="flex:1;height:35%;background:var(--accent);opacity:0.6;transition:height 0.8s ease"></div>
                  <div class="threat-bar" style="flex:1;height:88%;background:var(--accent);opacity:1.0;transition:height 0.8s ease"></div>
                  <div class="threat-bar" style="flex:1;height:60%;background:var(--accent);opacity:0.75;transition:height 0.8s ease"></div>
                  <div class="threat-bar" style="flex:1;height:40%;background:var(--accent);opacity:0.65;transition:height 0.8s ease"></div>
                  <div class="threat-bar" style="flex:1;height:95%;background:var(--accent);opacity:0.95;transition:height 0.8s ease"></div>
                </div>
                <div style="color:#72cf90;font-size:10.5px;margin-top:6px;display:flex;justify-content:space-between">
                  <span>INGESTION: 18.2 MB/s</span>
                  <span>LATENCY: 1.4ms</span>
                </div>
              </div>

              <div style="font-size:12px;color:#bdf0ce;display:flex;flex-direction:column;gap:6px;border-top:1px solid rgba(var(--accent-rgb),0.15);padding-top:10px">
                <div><b style="color:var(--accent)">SECURITY INVARIANTS:</b> VERIFIED</div>
                <div><b style="color:var(--accent)">AUDIT COMPLIANCE:</b> CIS BENCHMARKS · PCI-DSS</div>
                <div><b style="color:var(--accent)">DETECTION LATENCY:</b> &lt; 2.0s REAL-TIME ALERTING</div>
                <div><b style="color:var(--accent)">IDENTITY PROTOCOL:</b> 2FA / ZERO TRUST VALIDATED</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getExperienceHtml() {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(var(--accent-rgb),0.25);padding-bottom:10px">
          <span style="font-size:12px;color:var(--accent);letter-spacing:0.12em;font-weight:700">MISSION LOG // INTERVIEWS &amp; AUDITS</span>
          <div class="view-switch">
            <button class="switch-btn ${this.experienceMode === 'narrative' ? 'active' : ''}" data-mode="narrative">MY PERSONAL DEBRIEF</button>
            <button class="switch-btn ${this.experienceMode === 'specs' ? 'active' : ''}" data-mode="specs">TECHNICAL SPECS</button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px">
          ${EXPERIENCES.map(job => `
            <div style="border:1px solid rgba(var(--accent-rgb),0.3);background:rgba(2,10,5,0.6);padding:16px 18px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
                <div>
                  <div style="color:#fff;font-weight:700;font-size:15px">${job.role}</div>
                  <div style="color:var(--accent);font-size:12.5px;margin-top:2px">${job.company} · ${job.location}</div>
                </div>
                <div style="font-size:11.5px;color:#8be0a5;background:rgba(var(--accent-rgb),0.12);padding:2px 8px;border:1px solid var(--accent-border)">${job.period}</div>
              </div>

              ${this.experienceMode === 'narrative' ? `
                <div class="story-bubble">
                  ${job.narrative}
                </div>
              ` : `
                <ul class="spec-list">
                  ${job.specs.map(s => `<li class="spec-item">${s}</li>`).join('')}
                </ul>
              `}

              <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
                ${job.tools.map(t => `<span style="font-size:10.5px;border:1px solid rgba(var(--accent-rgb),0.3);padding:2px 6px;color:#8be0a5;background:#020a05">${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getProjectsHtml() {
    return `
      <div>
        <div class="proj-grid">
          ${PROJECTS.map(p => `
            <div class="proj-card">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                <span class="proj-name">${p.name}</span>
                <span style="font-size:10px;color:var(--accent);border:1px solid var(--accent-border);padding:2px 6px;text-transform:uppercase">${p.category}</span>
              </div>
              <div class="proj-role">${p.role}</div>
              <div class="proj-stack">${p.stack.join(' · ')}</div>
              <div class="proj-blurb">${p.blurb}</div>
              <ul style="list-style:none;padding:0;margin:4px 0 8px;display:flex;flex-direction:column;gap:4px">
                ${p.highlights.map(h => `<li style="font-size:11.5px;color:#8fe4b0;display:flex;gap:6px"><span>▹</span><span>${h}</span></li>`).join('')}
              </ul>
              ${p.repo ? `
                <a href="${p.repo}" target="_blank" rel="noopener noreferrer" class="proj-link">
                  VIEW GITHUB REPOSITORY ↗
                </a>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getSkillsHtml() {
    return `
      <div>
        <div class="skill-grid">
          ${SKILL_GROUPS.map(g => `
            <div style="border:1px solid rgba(var(--accent-rgb),0.3);background:rgba(2,10,5,0.6);padding:16px">
              <div style="color:var(--accent);font-size:11.5px;letter-spacing:0.12em;font-weight:700;margin-bottom:12px">${g.title}</div>
              <div style="display:flex;flex-direction:column;gap:10px">
                ${g.skills.map(s => `
                  <div>
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:#d8fae4">
                      <span>${s.name} <span style="font-size:10px;color:#72cf90">(${s.tag})</span></span>
                      <span style="color:var(--accent)">${s.level}%</span>
                    </div>
                    <div class="skill-bar-wrap">
                      <div class="skill-bar-fill" style="width:${s.level}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getCertsHtml() {
    return `
      <div style="display:flex;flex-direction:column;gap:14px">
        ${CERTIFICATIONS.map(c => `
          <div style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.7);padding:16px 18px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
              <div style="display:flex;gap:16px;align-items:flex-start;flex:1;min-width:240px">
                ${c.image ? `
                  <div style="width:78px;height:78px;flex-shrink:0;background:rgba(0,0,0,0.5);border:1px solid var(--accent-border);padding:4px;display:flex;align-items:center;justify-content:center">
                    <img src="${c.image}" alt="${c.title}" style="max-width:100%;max-height:100%;object-fit:contain" />
                  </div>
                ` : ''}
                <div>
                  <div style="color:#fff;font-weight:700;font-size:15px">${c.title}</div>
                  <div style="color:#8be0a5;font-size:12px;margin:3px 0 6px">${c.issuer} · ${c.period}</div>
                  <div style="color:#bdf0ce;font-size:12.5px;line-height:1.6">${c.desc}</div>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
                <div style="font-size:10.5px;color:var(--accent);border:1px solid var(--accent-border);padding:2px 8px">${c.badge}</div>
                ${c.verifyUrl ? `
                  <a href="${c.verifyUrl}" target="_blank" rel="noopener noreferrer" class="hud-btn" style="text-decoration:none;font-size:10.5px;padding:4px 10px;background:var(--accent);color:#000;font-weight:700;border:none">
                    VERIFY CREDLY ↗
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getContactHtml() {
    return `
      <div>
        <div style="display:flex;flex-direction:column;gap:12px;color:#d8fae4;font-size:13px">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="color:var(--accent);width:70px;font-weight:600">EMAIL</span>
            <a href="mailto:${PERSONAL_INFO.email}" style="color:#fff;text-decoration:none">${PERSONAL_INFO.email}</a>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <span style="color:var(--accent);width:70px;font-weight:600">LINKEDIN</span>
            <a href="${PERSONAL_INFO.linkedin}" target="_blank" rel="noopener noreferrer" style="color:#8be0a5;text-decoration:none">${PERSONAL_INFO.linkedin} ↗</a>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <span style="color:var(--accent);width:70px;font-weight:600">GITHUB</span>
            <a href="${PERSONAL_INFO.github}" target="_blank" rel="noopener noreferrer" style="color:#8be0a5;text-decoration:none">${PERSONAL_INFO.github} ↗</a>
          </div>
        </div>

        <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
          <button id="open-resume-btn" class="hud-btn" style="background:var(--accent);color:#000;font-weight:bold;padding:8px 16px;border:none">
            OPEN PRINTABLE RESUME DOSSIER
          </button>
          <a href="mailto:${PERSONAL_INFO.email}?subject=Security%20Opportunity" class="hud-btn" style="text-decoration:none;padding:8px 16px">
            SEND DIRECT EMAIL
          </a>
        </div>
      </div>
    `;
  }

  bindInternalEvents() {
    document.addEventListener('click', (e) => {
      const switchBtn = e.target.closest('.switch-btn');
      if (switchBtn) {
        this.experienceMode = switchBtn.getAttribute('data-mode');
        this.winManager.updateContent('experience', this.getExperienceHtml());
        sound.playNav();
      }

      if (e.target.id === 'quick-resume-btn' || e.target.id === 'open-resume-btn') {
        this.openResumeModal();
      }

      if (e.target.id === 'quick-terminal-btn') {
        this.openOrFocus('terminal');
      }

      if (e.target.id === 'toggle-avatar-mode') {
        const pic = document.getElementById('profile-pic-el');
        const wrap = document.getElementById('avatar-canvas-wrap');
        const btn = document.getElementById('toggle-avatar-mode');
        if (pic && wrap && btn) {
          const isPhotoVisible = pic.style.display !== 'none';
          if (isPhotoVisible) {
            pic.style.display = 'none';
            wrap.style.display = 'block';
            btn.textContent = 'SWITCH: PHOTO ID';
            if (!this.avatarCleanup) {
              this.avatarCleanup = initWireframeAvatar('avatar-canvas');
            }
            window.dispatchEvent(new Event('resize'));
          } else {
            pic.style.display = 'block';
            wrap.style.display = 'none';
            btn.textContent = 'SWITCH: 3D HOLOGRAM';
          }
        }
      }
    });
  }

  setupResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="resume-paper" style="max-width:960px;width:95%;height:92vh;max-height:92vh;display:flex;flex-direction:column;padding:16px 20px;background:#061009;border:1px solid var(--accent-border);box-shadow:0 10px 40px rgba(0,0,0,0.9)">
        <div class="no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid var(--accent-border);padding-bottom:12px;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-size:13px;color:var(--accent);font-weight:bold;letter-spacing:0.08em">LALITH CHAITANYA MULAPALA // RESUME</div>
            <div style="font-size:11px;color:#8be0a5">Cybersecurity Analyst &amp; Systems Engineer</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <a href="./assets/Lalith_Resume.pdf" download="Lalith_Resume.pdf" class="hud-btn" style="background:var(--accent);color:#000;font-weight:bold;border:none;text-decoration:none;display:inline-flex;align-items:center;gap:6px">
              DOWNLOAD / SAVE AS PDF ↓
            </a>
            <a href="./assets/Lalith_Resume.pdf" target="_blank" rel="noopener noreferrer" class="hud-btn" style="text-decoration:none">
              OPEN PDF IN NEW TAB ↗
            </a>
            <button id="modal-print-btn" class="hud-btn">PRINT</button>
            <button id="modal-close-btn" class="hud-btn">CLOSE [ESC]</button>
          </div>
        </div>

        <div style="flex:1;min-height:0;background:#0d1117;border:1px solid rgba(var(--accent-rgb),0.3);display:flex;flex-direction:column;overflow:hidden">
          <object data="./assets/Lalith_Resume.pdf" type="application/pdf" width="100%" height="100%" style="width:100%;height:100%;flex:1">
            <iframe id="resume-frame" src="./assets/Lalith_Resume.pdf" style="width:100%;height:100%;border:none">
              <div style="padding:24px;color:#fff;text-align:center">
                <p>Unable to preview PDF directly in this browser frame.</p>
                <a href="./assets/Lalith_Resume.pdf" target="_blank" class="hud-btn" style="display:inline-block;margin-top:12px;background:var(--accent);color:#000;text-decoration:none;font-weight:bold">
                  Open Lalith_Resume.pdf
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    `;

    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeResumeModal());
    document.getElementById('modal-print-btn')?.addEventListener('click', () => {
      window.open('./assets/Lalith_Resume.pdf', '_blank');
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeResumeModal();
      }
    });
  }

  openResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (modal) {
      modal.classList.add('active');
      sound.playSuccess();
    }
  }

  closeResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (modal) {
      modal.classList.remove('active');
      sound.playClose();
    }
  }

  initThreatMonitor() {
    setInterval(() => {
      const bars = document.querySelectorAll('.threat-bar');
      bars.forEach(b => {
        const h = Math.floor(20 + Math.random() * 75);
        b.style.height = `${h}%`;
      });
    }, 1800);
  }
}
