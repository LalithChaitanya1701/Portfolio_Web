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

    this.winManager.onWindowFocus = (id) => {
      this.updateDirectoryHighlight(id);
    };

    // Initialize ambient workstation motion background
    this.motionBgCleanup = initWorkstationMotionBg('hud-motion-bg');

    this.initWindows();
    this.renderDirectory();
    this.initThreatMonitor();
    this.setupResumeModal();
    this.setupDirectoryToggle();

    window.addEventListener('resize', () => {
      if (this.winManager) this.winManager.handleResize();
    });
  }

  setupDirectoryToggle() {
    const toggleBtn = document.getElementById('hud-dir-toggle');
    const closeBtn = document.getElementById('hud-dir-close');
    const backdrop = document.getElementById('hud-nav-backdrop');

    const closeDir = () => {
      document.body.classList.remove('dir-open');
      sound.playKey();
    };

    const openDir = () => {
      document.body.classList.add('dir-open');
      sound.playNav();
    };

    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (document.body.classList.contains('dir-open')) {
        closeDir();
      } else {
        openDir();
      }
    });

    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDir();
    });

    backdrop?.addEventListener('click', () => {
      closeDir();
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

    // 1. Overview & Telemetry Window (MERGED)
    const ovBounds = getWinBounds(isSmall ? 620 : 740, isSmall ? 460 : 500, 20, 20);
    this.winManager.registerWindow('overview', {
      title: 'WIN://OVERVIEW_TELEMETRY.SYS',
      contentHtml: this.getOverviewHtml(),
      defaultPos: ovBounds.pos,
      defaultSize: ovBounds.size
    });

    // 2. Terminal Window (UNPINNED OS WINDOW)
    const termBounds = getWinBounds(isSmall ? 580 : 660, isSmall ? 320 : 360, 30, 40);
    this.winManager.registerWindow('terminal', {
      title: 'WIN://VISITOR_TERMINAL.SH',
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

    // 3. 3D Cyber Cube Window (CHROMATIC DISPERSION)
    const cubeBounds = getWinBounds(isSmall ? 620 : 700, isSmall ? 440 : 480, 25, 25);
    this.winManager.registerWindow('cube', {
      title: 'WIN://CYBER_CUBE_3D.GL',
      contentHtml: this.getCubeHtml(),
      defaultPos: cubeBounds.pos,
      defaultSize: cubeBounds.size,
      onFocus: () => {
        if (!this.cubeCleanup) {
          setTimeout(() => {
            const container = document.getElementById('cube-scene-container');
            if (container) {
              this.cubeCleanup = initCyberCube(container);
            }
          }, 50);
        }
      },
      onClose: () => {
        if (this.cubeCleanup) {
          this.cubeCleanup();
          this.cubeCleanup = null;
        }
      }
    });

    // 4. About & 3D Wireframe Avatar
    const aboutBounds = getWinBounds(isSmall ? 600 : 660, isSmall ? 420 : 440, 25, 25);
    this.winManager.registerWindow('about', {
      title: 'WIN://SECURITY_ID.DAT',
      contentHtml: this.getAboutHtml(),
      defaultPos: aboutBounds.pos,
      defaultSize: aboutBounds.size,
      onFocus: () => {
        if (!this.avatarCleanup) {
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

    // 5. Experience Debrief Window
    const expBounds = getWinBounds(isSmall ? 620 : 700, isSmall ? 460 : 490, 30, 30);
    this.winManager.registerWindow('experience', {
      title: 'WIN://EXPERIENCE_DEBRIEF.LOG',
      contentHtml: this.getExperienceHtml(),
      defaultPos: expBounds.pos,
      defaultSize: expBounds.size
    });

    // 6. Projects Window
    const projBounds = getWinBounds(isSmall ? 620 : 700, isSmall ? 460 : 490, 35, 35);
    this.winManager.registerWindow('projects', {
      title: 'WIN://REPOSITORIES.JSON',
      contentHtml: this.getProjectsHtml(),
      defaultPos: projBounds.pos,
      defaultSize: projBounds.size
    });

    // 7. Skills Matrix Window
    const skillsBounds = getWinBounds(isSmall ? 600 : 660, isSmall ? 420 : 450, 40, 40);
    this.winManager.registerWindow('skills', {
      title: 'WIN://SKILLS_TELEMETRY.MAT',
      contentHtml: this.getSkillsHtml(),
      defaultPos: skillsBounds.pos,
      defaultSize: skillsBounds.size
    });

    // 8. Certifications Window
    const certsBounds = getWinBounds(isSmall ? 580 : 640, isSmall ? 380 : 400, 45, 45);
    this.winManager.registerWindow('certs', {
      title: 'WIN://CERTIFICATIONS.SEC',
      contentHtml: this.getCertsHtml(),
      defaultPos: certsBounds.pos,
      defaultSize: certsBounds.size
    });

    // 9. Contact Window
    const contactBounds = getWinBounds(isSmall ? 540 : 580, isSmall ? 360 : 360, 50, 50);
    this.winManager.registerWindow('contact', {
      title: 'WIN://COMM_CHANNELS.IO',
      contentHtml: this.getContactHtml(),
      defaultPos: contactBounds.pos,
      defaultSize: contactBounds.size
    });

    // Close others initially, open Overview
    ['terminal', 'cube', 'about', 'experience', 'projects', 'skills', 'certs', 'contact'].forEach(id => {
      this.winManager.closeWindow(id);
    });

    this.winManager.openWindow('overview');
    this.bindInternalEvents();
  }

  renderDirectory() {
    const navContainer = document.getElementById('hud-nav-list');
    if (!navContainer) return;

    // Zero emojis, strictly clean text
    const sections = [
      { id: 'overview', label: 'OVERVIEW & TELEMETRY' },
      { id: 'terminal', label: 'TERMINAL' },
      { id: 'cube', label: 'CYBER CUBE 3D' },
      { id: 'about', label: 'ABOUT // WHOAMI' },
      { id: 'experience', label: 'EXPERIENCE LOG' },
      { id: 'projects', label: 'PROJECTS' },
      { id: 'skills', label: 'SKILLS MATRIX' },
      { id: 'certs', label: 'CERTS & AWARDS' },
      { id: 'contact', label: 'OPEN CHANNEL' }
    ];

    navContainer.innerHTML = '';
    sections.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'hud-nav-item';
      btn.id = `dir-${item.id}`;
      btn.innerHTML = `
        <span class="dir-label">${item.label}</span>
        <span class="dir-indicator"></span>
      `;
      btn.addEventListener('click', () => {
        this.openOrFocus(item.id);
        // On mobile/tablet, collapse drawer after selection
        if (window.innerWidth <= 1024) {
          document.body.classList.remove('dir-open');
        }
      });
      navContainer.appendChild(btn);
    });

    this.updateDirectoryHighlight('overview');
  }

  updateDirectoryHighlight(activeId) {
    document.querySelectorAll('.hud-nav-item').forEach(btn => {
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
    if (panelLabel) {
      panelLabel.textContent = activeId.toUpperCase();
    }
  }

  openOrFocus(id) {
    if (!this.winManager) return;
    const win = this.winManager.windows.get(id);
    if (!win) return;

    if (!win.isOpen || win.isMinimized) {
      this.winManager.openWindow(id);
    } else {
      this.winManager.focusWindow(id);
    }
    sound.playNav();
  }

  setPanel(panelId) {
    const mapped = panelId === 'home' ? 'overview' : panelId;
    this.openOrFocus(mapped);
  }

  getTerminalHtml() {
    return `
      <div style="display:flex;flex-direction:column;height:100%;min-height:220px">
        <div class="term-output" id="term-output" aria-live="polite" style="flex:1;min-height:140px;overflow-y:auto"></div>
        <div class="term-input-row" style="margin-top:auto">
          <label for="term-input" class="term-prompt">visitor@lcm:~$</label>
          <input id="term-input" class="term-input" type="text" autocomplete="off" spellcheck="false" placeholder="type a command and press Enter">
        </div>
        <div class="term-chips" id="term-chips" style="padding:6px 0 0"></div>
      </div>
    `;
  }

  getCubeHtml() {
    return `
      <div id="cube-scene-container" class="cube-hero" style="position:relative;width:100%;height:100%;min-height:360px;overflow:hidden;background:#000">
        <canvas id="scene" aria-label="Rotatable glass cube. Drag to rotate."></canvas>
        <div class="cube-ui">
          <h1 class="sr-only">Privacy is a MYTH</h1>
          <div class="cube-header">
            <span style="font-family:'Poppins',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.1em;color:#fff">
              CYBER <span style="font-weight:400;color:var(--accent)">WORLD</span>
            </span>
            <div class="cube-arrows">
              <button class="cube-arrow" id="prev" title="Rotate left" aria-label="Previous rotation">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M11 6l-6 6 6 6"/>
                </svg>
              </button>
              <button class="cube-arrow" id="next" title="Rotate right" aria-label="Next rotation">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </button>
            </div>
          </div>

          <nav class="cube-dots" aria-label="Cube viewpoints">
            <button class="dot" aria-label="Viewpoint 1"></button>
            <button class="dot active" aria-label="Viewpoint 2"></button>
            <button class="dot" aria-label="Viewpoint 3"></button>
          </nav>

          <div class="cube-cta-row">
            <button class="cube-cta" id="cube-reset-btn">DRAG TO ROTATE</button>
            <span class="cube-cta-line"></span>
            <span class="cube-count" aria-hidden="true">07</span>
          </div>
          <div class="cube-loader" id="loader">LOADING MODEL...</div>
        </div>
      </div>
    `;
  }

  getOverviewHtml() {
    return `
      <div>
        <div style="font-size:11px;color:var(--accent);letter-spacing:0.18em;margin-bottom:6px">> SYSTEM STATUS: NORMAL // LIVE SOC TELEMETRY</div>
        <h1 style="font-family:'SG',sans-serif;font-weight:700;font-size:28px;color:#fff;margin-bottom:4px;line-height:1.2">
          ${PERSONAL_INFO.name}
        </h1>
        <div style="font-size:14px;color:var(--accent);letter-spacing:0.06em;margin-bottom:14px">
          ${PERSONAL_INFO.title} · ${PERSONAL_INFO.location}
        </div>
        <p style="color:#bdf0ce;line-height:1.65;font-size:13px;margin-bottom:18px">
          ISC²-certified Cybersecurity Analyst &amp; Systems Engineer. Specialist in offensive web application assessment (VAPT),
          cloud infrastructure compliance automation (AWS/Terraform), and high-throughput SIEM threat detection.
        </p>

        <!-- Metric Tiles Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin-bottom:20px">
          ${PERSONAL_INFO.stats.map(s => `
            <div style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.7);padding:12px">
              <div style="font-family:'SG',sans-serif;font-size:24px;font-weight:700;color:var(--accent)">${s.value}</div>
              <div style="font-size:11px;color:#fff;margin-top:2px;font-weight:600">${s.label}</div>
              <div style="font-size:10px;color:#78d496;margin-top:2px">${s.sub}</div>
            </div>
          `).join('')}
        </div>

        <!-- Merged Telemetry & Threat Monitor Report -->
        <div style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.85);padding:16px;margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid rgba(var(--accent-rgb),0.25);padding-bottom:8px">
            <span style="font-size:12px;color:var(--accent);letter-spacing:0.12em;font-weight:700">LIVE THREAT MONITOR &amp; TELEMETRY REPORT</span>
            <span style="font-size:10.5px;color:#72cf90;display:flex;align-items:center;gap:6px">
              <span class="win-led"></span> ACTIVE INGESTION
            </span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;align-items:center">
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

            <div style="font-size:12px;color:#bdf0ce;display:flex;flex-direction:column;gap:6px">
              <div><b style="color:var(--accent)">SECURITY INVARIANTS:</b> VERIFIED</div>
              <div><b style="color:var(--accent)">AUDIT COMPLIANCE:</b> CIS BENCHMARKS · PCI-DSS</div>
              <div><b style="color:var(--accent)">DETECTION LATENCY:</b> &lt; 2.0s REAL-TIME ALERTING</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Row -->
        <div style="border-left:3px solid var(--accent);padding:10px 14px;background:var(--accent-dim);color:#e2f7ea;font-size:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <span>Click window headers to drag, corner/edges to resize, and buttons to maximize.</span>
          <div style="display:flex;gap:8px">
            <button id="quick-resume-btn" class="hud-btn" style="background:var(--accent);color:#000;font-weight:bold;border:none">PRINT RESUME</button>
            <button id="quick-terminal-btn" class="hud-btn">LAUNCH TERMINAL</button>
          </div>
        </div>
      </div>
    `;
  }

  getAboutHtml() {
    return `
      <div>
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          <div style="width:190px;flex:none;border:1px dashed var(--accent-border);background:#020a05;padding:12px;display:flex;flex-direction:column;align-items:center">
            <div class="avatar-canvas-wrap" style="height:160px;width:100%">
              <canvas id="avatar-canvas"></canvas>
            </div>
            <div style="font-size:10.5px;color:var(--accent);letter-spacing:0.1em;margin-top:6px">[ CYBER_ID // HOLOGRAM ]</div>
          </div>

          <div style="flex:1;min-width:260px;display:flex;flex-direction:column;gap:12px">
            <p style="color:#d8fae4;line-height:1.7;font-size:13px;margin:0">
              I am an ISC²-certified Cybersecurity Analyst and Computer Science Engineer (GPA: 8.58) focused on offensive security, 
              cloud compliance automation, and threat detection systems. I bridge the gap between application security and infrastructure, 
              ensuring defenses are validated under realistic threat models.
            </p>

            <div style="border:1px solid var(--accent-border);background:rgba(2,10,5,0.7);padding:14px">
              <div style="color:var(--accent);font-size:11.5px;letter-spacing:0.1em;font-weight:600;margin-bottom:6px">ACADEMIC BACKGROUND</div>
              <div style="color:#fff;font-weight:600;font-size:13.5px">${PERSONAL_INFO.education.institution}</div>
              <div style="color:#a8e5be;font-size:12px;margin-top:2px">${PERSONAL_INFO.education.degree} (${PERSONAL_INFO.education.specialization})</div>
              <div style="color:var(--accent);font-size:11.5px;margin-top:4px">${PERSONAL_INFO.education.gpa} · ${PERSONAL_INFO.education.period}</div>
              <div style="color:#72cf90;font-size:11px;margin-top:6px">Relevant coursework: ${PERSONAL_INFO.education.coursework.join(' · ')}</div>
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
            <button class="switch-btn ${this.experienceMode === 'narrative' ? 'active' : ''}" data-mode="narrative">FIRST-PERSON DEBRIEF</button>
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
              <a href="${p.repo}" target="_blank" rel="noopener noreferrer" class="proj-link">
                VIEW GITHUB REPOSITORY ↗
              </a>
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
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div style="color:#fff;font-weight:700;font-size:15px">${c.title}</div>
              <div style="font-size:10.5px;color:var(--accent);border:1px solid var(--accent-border);padding:2px 8px">${c.badge}</div>
            </div>
            <div style="color:#8be0a5;font-size:12px;margin:3px 0 6px">${c.issuer} · ${c.period}</div>
            <div style="color:#bdf0ce;font-size:12.5px;line-height:1.6">${c.desc}</div>
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
    });
  }

  setupResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="resume-paper">
        <div class="no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid var(--accent-border);padding-bottom:12px">
          <div style="font-size:12px;color:var(--accent);font-weight:bold">SECURITY DOSSIER // CURRICULUM VITAE</div>
          <div style="display:flex;gap:10px">
            <button id="modal-print-btn" class="hud-btn" style="background:var(--accent);color:#000;font-weight:bold;border:none">PRINT / SAVE AS PDF</button>
            <button id="modal-close-btn" class="hud-btn">CLOSE [ESC]</button>
          </div>
        </div>

        <div>
          <h1 style="font-family:'SG',sans-serif;font-size:26px;margin-bottom:4px;color:#fff">${PERSONAL_INFO.name}</h1>
          <div style="font-size:14px;color:var(--accent);margin-bottom:6px">${PERSONAL_INFO.title} · ${PERSONAL_INFO.location}</div>
          <div style="font-size:12px;color:#8be0a5;margin-bottom:18px">${PERSONAL_INFO.email} · ${PERSONAL_INFO.linkedin} · ${PERSONAL_INFO.github}</div>

          <h3 style="font-size:13px;letter-spacing:0.1em;border-bottom:1px solid var(--accent-border);padding-bottom:4px;margin:16px 0 8px;color:var(--accent)">EDUCATION</h3>
          <div style="font-weight:bold;font-size:13px">${PERSONAL_INFO.education.institution}</div>
          <div style="font-size:12.5px">${PERSONAL_INFO.education.degree} (${PERSONAL_INFO.education.specialization}) · ${PERSONAL_INFO.education.period}</div>
          <div style="font-size:12px;color:#8be0a5">${PERSONAL_INFO.education.gpa}</div>

          <h3 style="font-size:13px;letter-spacing:0.1em;border-bottom:1px solid var(--accent-border);padding-bottom:4px;margin:18px 0 8px;color:var(--accent)">WORK EXPERIENCE</h3>
          ${EXPERIENCES.map(job => `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px">
                <span>${job.role} — ${job.company}</span>
                <span style="color:#8be0a5">${job.period}</span>
              </div>
              <ul style="margin-top:4px;padding-left:18px;font-size:12px;color:#d8fae4;line-height:1.55">
                ${job.specs.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
          `).join('')}

          <h3 style="font-size:13px;letter-spacing:0.1em;border-bottom:1px solid var(--accent-border);padding-bottom:4px;margin:18px 0 8px;color:var(--accent)">KEY PROJECTS</h3>
          ${PROJECTS.slice(0, 3).map(p => `
            <div style="margin-bottom:8px">
              <div style="font-weight:bold;font-size:12.5px">${p.name} <span style="font-size:11px;color:#8be0a5">(${p.stack.join(', ')})</span></div>
              <div style="font-size:11.5px;color:#c8ffd9">${p.blurb}</div>
            </div>
          `).join('')}

          <h3 style="font-size:13px;letter-spacing:0.1em;border-bottom:1px solid var(--accent-border);padding-bottom:4px;margin:18px 0 8px;color:var(--accent)">CERTIFICATIONS</h3>
          ${CERTIFICATIONS.map(c => `
            <div style="font-size:12px;margin-bottom:4px">
              <b>${c.title}</b> — ${c.issuer} (${c.period})
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeResumeModal());
    document.getElementById('modal-print-btn')?.addEventListener('click', () => window.print());

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
