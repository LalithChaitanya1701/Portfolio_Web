/**
 * Hybrid Terminal Command Engine
 * Synchronizes typed CLI commands with HUD panels, history, and autocomplete.
 */

import { sound } from './sound.js';

export class TerminalEngine {
  constructor({ onPanelChange, onThemeChange, onSoundToggle, onPrintResume, onReturnToLanding }) {
    this.onPanelChange = onPanelChange;
    this.onThemeChange = onThemeChange;
    this.onSoundToggle = onSoundToggle;
    this.onPrintResume = onPrintResume;
    this.onReturnToLanding = onReturnToLanding;

    this.history = [];
    this.historyIndex = -1;
    this.log = [
      { type: 'out', text: 'LCM-OS SEC_KERNEL v2.4 initialized.' },
      { type: 'out', text: "Type 'help' for command matrix or click available chips below." }
    ];

    this.commands = [
      'help', 'home', 'whoami', 'about', 'experience', 'projects',
      'skills', 'certs', 'education', 'contact', 'resume', 'landing',
      'theme', 'sound', 'clear', 'ls', 'sudo'
    ];
  }

  attach(inputEl, outputEl, chipsEl) {
    this.input = inputEl;
    this.output = outputEl;
    this.chips = chipsEl;

    this.renderLog();
    this.renderChips();

    this.input.addEventListener('keydown', (e) => this.handleKey(e));
  }

  handleKey(e) {
    sound.playKey();

    if (e.key === 'Enter') {
      const val = this.input.value.trim();
      this.input.value = '';
      if (val) {
        this.history.push(val);
        this.historyIndex = this.history.length;
        this.execute(val);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex] || '';
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = this.input.value.trim().toLowerCase();
      if (val) {
        const match = this.commands.find(c => c.startsWith(val));
        if (match) {
          this.input.value = match;
        }
      }
    }
  }

  execute(raw) {
    const tokens = raw.trim().split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const arg = tokens[1]?.toLowerCase();

    this.log.push({ type: 'in', text: `visitor@lcm:~$ ${raw}` });

    switch (cmd) {
      case 'help':
        this.log.push({
          type: 'out',
          text: 'Available commands: whoami · experience · projects · skills · certs · education · contact · resume · theme [crimson|matrix|amber] · sound [on|off] · landing · clear'
        });
        sound.playNav();
        break;

      case 'home':
      case 'overview':
        this.onPanelChange('overview');
        this.log.push({ type: 'out', text: 'Navigated to Overview & Telemetry stage.' });
        sound.playNav();
        break;

      case 'whoami':
      case 'about':
        this.onPanelChange('about');
        this.log.push({
          type: 'out',
          text: 'Lalith Chaitanya Mulapala — Cybersecurity Analyst & Systems Engineer (GPA: 8.58).'
        });
        sound.playNav();
        break;

      case 'experience':
        this.onPanelChange('experience');
        this.log.push({
          type: 'out',
          text: 'Debrief loaded: Supraja Tech (VAPT, 14 vulns) & SecurWires (SOC automation).'
        });
        sound.playNav();
        break;

      case 'projects':
        this.onPanelChange('projects');
        this.log.push({
          type: 'out',
          text: 'Security Repos: AWS Compliance, SIEM Detection, Brut3Zero, CHFI Lab, YaRi Platform.'
        });
        sound.playNav();
        break;

      case 'skills':
        this.onPanelChange('skills');
        this.log.push({
          type: 'out',
          text: 'Telemetry: Python, Burp Suite, SIEM, Nmap, Nessus, AWS, Terraform, Docker.'
        });
        sound.playNav();
        break;

      case 'certs':
      case 'certifications':
        this.onPanelChange('certs');
        this.log.push({
          type: 'out',
          text: 'Verified credentials: ISC² CC · Best CR Award (2x) · HackArena Tech Lead.'
        });
        sound.playNav();
        break;

      case 'education':
        this.onPanelChange('about');
        this.log.push({
          type: 'out',
          text: 'GNITC Hyderabad · B.Tech CSE (Cybersecurity Major: 8.58, AI/ML Minor: 8.22).'
        });
        sound.playNav();
        break;

      case 'contact':
        this.onPanelChange('contact');
        this.log.push({
          type: 'out',
          text: 'Comm channels open: email, LinkedIn, and GitHub links ready.'
        });
        sound.playNav();
        break;

      case 'resume':
        this.onPrintResume();
        this.log.push({
          type: 'out',
          text: 'Opening printable formatted resume dossier...'
        });
        sound.playSuccess();
        break;

      case 'theme':
        if (arg === 'matrix' || arg === 'crimson' || arg === 'amber') {
          this.onThemeChange(arg);
          this.log.push({ type: 'out', text: `Theme color updated to: ${arg.toUpperCase()}` });
        } else {
          this.log.push({ type: 'err', text: 'Usage: theme [crimson | matrix | amber]' });
        }
        break;

      case 'sound':
        if (arg === 'on') {
          this.onSoundToggle(true);
          this.log.push({ type: 'out', text: 'Audio synthesis: ENABLED' });
        } else if (arg === 'off') {
          this.onSoundToggle(false);
          this.log.push({ type: 'out', text: 'Audio synthesis: MUTED' });
        } else {
          const state = this.onSoundToggle();
          this.log.push({ type: 'out', text: `Audio synthesis toggled: ${state ? 'ENABLED' : 'MUTED'}` });
        }
        break;

      case 'landing':
        this.log.push({ type: 'out', text: 'Returning to primary stage...' });
        this.onReturnToLanding();
        sound.playNav();
        break;

      case 'clear':
        this.log = [];
        break;

      case 'ls':
        this.log.push({
          type: 'out',
          text: 'about/  experience/  projects/  skills/  certs/  education/  resume.pdf'
        });
        break;

      case 'sudo':
        this.log.push({
          type: 'err',
          text: 'visitor is not in sudoers file. This security incident will be logged to SIEM.'
        });
        sound.playAlert();
        break;

      default:
        this.log.push({
          type: 'err',
          text: `Command not recognized: '${cmd}'. Type 'help' to inspect command list.`
        });
        sound.playAlert();
        break;
    }

    this.renderLog();
  }

  renderLog() {
    if (!this.output) return;
    this.output.innerHTML = '';
    // Keep max 40 rows
    const visibleLogs = this.log.slice(-40);
    visibleLogs.forEach(entry => {
      const div = document.createElement('div');
      div.className = `term-line term-${entry.type}`;
      div.textContent = entry.text;
      this.output.appendChild(div);
    });
    this.output.scrollTop = this.output.scrollHeight;
  }

  renderChips() {
    if (!this.chips) return;
    this.chips.innerHTML = '';
    const quickCmds = ['help', 'whoami', 'experience', 'projects', 'skills', 'certs', 'contact', 'resume', 'theme matrix', 'clear'];
    quickCmds.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'chip-btn';
      btn.textContent = c;
      btn.addEventListener('click', () => {
        this.execute(c);
        if (this.input) this.input.focus();
      });
      this.chips.appendChild(btn);
    });
  }
}
