/**
 * Lalith Chaitanya Mulapala - Portfolio & Experience Data
 * Includes Personal Narrative Debriefs & Technical Specifications
 */

export const PERSONAL_INFO = {
  name: "Lalith Chaitanya Mulapala",
  title: "Cybersecurity Analyst & Systems Engineer",
  location: "Hyderabad, Telangana, India",
  email: "lalithchaitanya.mulapala@gmail.com",
  linkedin: "https://www.linkedin.com/in/lalith-chaitanya-mulapala-615435301/",
  github: "https://github.com/LalithChaitanya1701",
  stats: [
    { value: "8.58", label: "CUMULATIVE GPA (MAJOR)", sub: "Minor: 8.22 / 10.0 · B.Tech CSE" },
    { value: "14", label: "VULNS DOCUMENTED", sub: "3 Critical SQLi, 4 High IDOR" },
    { value: "50+", label: "SIEM DETECTION RULES", sub: "<2s Alert Ingestion Pipeline" },
    { value: "18", label: "AWS CONTROLS AUTOMATED", sub: "60% Faster Audit Evaluations" }
  ],
  education: {
    institution: "Guru Nanak Institutions Technical Campus (GNITC)",
    location: "Hyderabad, India",
    degree: "B.Tech Computer Science and Engineering",
    specialization: "Cybersecurity Major · AI/ML Minor",
    period: "Nov 2022 – Apr 2026",
    gpa: "Cumulative GPA: Major: 8.58 / 10.0, Minor: 8.22 / 10.0 (Study Type: Full-time)",
    coursework: [
      "Network Security", "Cryptography", "Digital Forensics",
      "Cloud Architecture", "Operating Systems"
    ]
  }
};

export const EXPERIENCES = [
  {
    id: "supraja",
    role: "Cyber Security Analyst Intern",
    company: "Supraja Technologies",
    location: "Vijayawada, India",
    period: "May 2025 – Jan 2026",
    narrative: `When I stepped into Supraja Technologies, I was tasked with stress-testing 8 live production endpoints that our enterprise clients relied on daily. Instead of just firing automated scans and calling it a day, I manually inspected parameter structures and chained together Burp Suite Pro, OWASP ZAP, and custom Nmap NSE scripts.

That hands-on approach uncovered 14 distinct vulnerabilities that automated scanners overlooked—including 3 critical SQL Injections and 4 high-severity Insecure Direct Object References (IDORs) that could have exposed sensitive user data. I didn't stop at finding flaws: I sat down directly with the development team, mapped out prioritized remediation roadmaps, and helped verify fixes, resolving 85% of all documented vulnerabilities in under 30 days. To keep executive leadership in the loop, I authored 6 comprehensive risk assessment reports and built a lightweight tracking dashboard measuring Mean Time to Remediate (MTTR).`,
    specs: [
      "Executed comprehensive web application penetration testing across 8 production endpoints using Burp Suite Pro, OWASP ZAP, and Nmap.",
      "Identified, validated, and documented 14 vulnerabilities (3 Critical SQL Injection, 4 High-severity IDOR); drove remediation resolving 85% within 30 days.",
      "Produced 6 formal technical risk assessment reports with executive dashboards tracking remediation velocity, MTTR, and control effectiveness.",
      "Collaborated with dev teams to implement input sanitization, parameterized queries, and robust access-control matrices."
    ],
    tools: ["Burp Suite Pro", "OWASP ZAP", "Nmap", "SQLMap", "Python", "Linux"]
  },
  {
    id: "securwires",
    role: "Cyber Security & AI/ML Operations Intern (SAB 1.0 Cohort)",
    company: "SecurWires Technologies & Services LLP (STSL)",
    location: "Mumbai, India (Remote)",
    period: "Jan 2026 – Mar 2026",
    narrative: `At SecurWires, I worked at the intersection of security operations and automation. We were auditing 25+ internal subnets with hundreds of active nodes. The immediate bottleneck was noise: automated scanners like Nessus were dumping raw alerts that drowned our team in false positives.

I took the initiative to validate over 40 high-priority scanner findings manually, distinguishing actual exploit pathways from scanner artifacts. Then, to eliminate repetitive manual log triage, I wrote Python-based log-parsing and correlation scripts. These piped authentication anomalies and endpoint spikes directly into our triage pipeline, slashing manual analysis time by 35%. I also co-authored Standard Operating Procedures (SOPs) for incident escalation and forensic data acquisition that the team adopted into regular workflow.`,
    specs: [
      "Conducted network vulnerability assessments across 25+ internal subnets using Nessus and Nmap; triaged 40+ raw scanner findings to eliminate false positives.",
      "Developed Python log-parsing scripts to automate alert ingestion into SIEM triage pipelines, reducing manual log analysis time by 35%.",
      "Co-authored institutional SOPs for rapid incident escalation, evidence preservation, and forensic chain-of-custody data handling.",
      "Assisted in simulating privilege escalation scenarios to test detection threshold sensitivity."
    ],
    tools: ["Nessus", "Python", "Nmap", "SIEM Architecture", "Wireshark", "Bash"]
  }
];

export const PROJECTS = [
  {
    id: "aws-compliance",
    name: "Security Automation and Compliance Testing Across AWS",
    category: "Cloud Security",
    role: "Cloud Security Architect & Engineer",
    stack: ["Terraform", "AWS Security Hub", "AWS Config", "Python", "CloudTrail", "SNS"],
    blurb: "Automated IaC continuous compliance for 18 security controls against CIS AWS Foundations Benchmark and PCI-DSS, cutting audit evaluation cycle time by 60%.",
    repo: "https://github.com/LalithChaitanya1701",
    highlights: [
      "Architected an automated Infrastructure-as-Code (IaC) continuous compliance framework using Terraform and custom Python (Boto3) AWS Lambda functions.",
      "Automated real-time evaluation and remediation for 18 security controls against CIS AWS Foundations Benchmark and PCI-DSS, decreasing compliance audit evaluation time by 60%.",
      "Integrated automated incident notifications via AWS CloudTrail, CloudWatch, and SNS to alert security operations upon policy violations."
    ]
  },
  {
    id: "exam-forge",
    name: "Exam Forge: Customizable CBT Test Engine",
    category: "Software Engineering",
    role: "Core Developer",
    stack: ["Python", "JavaScript", "HTML5/CSS3", "Regex"],
    blurb: "Automated Computer-Based Testing (CBT) engine ingesting raw markdown/text question banks into interactive simulation environments with configurable timers, scoring schemes, and instant post-exam analytics.",
    repo: "https://github.com/LalithChaitanya1701/Exam_Forge",
    highlights: [
      "Developed an automated Computer-Based Testing (CBT) engine that ingests custom raw text/markdown question banks and transforms them into interactive simulation environments.",
      "Built customizable assessment parameters including configurable countdown timers, custom positive and negative marking schemes, and section navigation.",
      "Implemented real-time score calculation, response persistence, and instant post-exam analytics across multi-question test sessions."
    ]
  },
  {
    id: "auto-recon",
    name: "Automated Reconnaissance Tool",
    category: "OSINT & Recon",
    role: "Core Developer",
    stack: ["Python", "OSINT", "Shodan API", "DNS", "SSL", "ReportLab"],
    blurb: "Python-based GUI reconnaissance engine aggregating OSINT data streams from WHOIS, DNS records, SSL/TLS certificates, and the Shodan API with multithreaded token-bucket rate limiting and audit-ready PDF reporting.",
    repo: "https://github.com/LalithChaitanya1701/Automatic-Reconnaissance-with-Python_Mark_1",
    highlights: [
      "Engineered a Python-based GUI reconnaissance engine aggregating OSINT data streams from WHOIS, DNS records, SSL/TLS certificates, and the Shodan API.",
      "Implemented multithreaded scanning modules with built-in token-bucket rate limiting to prevent network disruptions, reducing manual reconnaissance duration by 45%.",
      "Developed an automated reporting pipeline exporting structured, audit-ready PDF intelligence summaries and attack surface assessments."
    ]
  },
  {
    id: "siem-engine",
    name: "Log-Based Threat Detection System (SIEM)",
    category: "Threat Detection",
    role: "Core Developer",
    stack: ["Python", "SQLite", "SMTP Protocol", "Regex", "Multithreading", "Socket API"],
    blurb: "Lightweight SIEM simulation pipeline featuring 50+ pre-configured detection rules, real-time log file tailing, SQLite caching, and sub-2-second automated security alerts.",
    repo: "https://github.com/LalithChaitanya1701/Log_Based_Threat_Detector",
    highlights: [
      "Engineered a lightweight SIEM simulation pipeline featuring 50+ pre-configured detection rules, real-time log file tailing, and automated SMTP incident dispatching.",
      "Implemented high-throughput multithreaded log ingestion with SQLite caching, reducing security event triage latency by 45% and achieving an average alert dispatch time under 2 seconds.",
      "Automated email incident alerts dispatched via SMTP protocol with full security context."
    ]
  },
  {
    id: "brut3zero",
    name: "Brut3Zero: Multi-Protocol Security Testing Suite",
    category: "Offensive Security",
    role: "Security Tool Developer",
    stack: ["Python", "Requests", "Paramiko", "Multithreading", "Tkinter GUI"],
    blurb: "Modular authentication stress-testing suite supporting HTTP, FTP, and SSH protocols featuring a Tkinter GUI, BFS web-form crawler, and token-bucket rate limiting.",
    repo: "https://github.com/LalithChaitanya1701/Brut3Zer0_mark_2",
    highlights: [
      "Developed a modular authentication stress-testing suite supporting HTTP, FTP, and SSH protocols featuring a Tkinter GUI and a BFS web-form crawler.",
      "Built token-bucket rate limiting and automated backoff mechanisms to prevent endpoint denial-of-service, sustaining 200+ requests/sec across 10+ authorized lab wordlists with 0% socket drops.",
      "Implemented resilient socket handlers and thread pools for safe, high-speed credential auditing in authorized lab environments."
    ]
  },
  {
    id: "chfi-forensics",
    name: "Enterprise Digital Forensics Investigation (CHFI Lab)",
    category: "Digital Forensics",
    role: "Forensic Investigator",
    stack: ["Volatility 3", "Wireshark", "FTK Imager", "Cryptographic Hashing"],
    blurb: "Forensic acquisition across 4 host system images with SHA-256 integrity verification, attack timeline reconstruction from volatile memory dumps, and 22-page post-incident assessment report.",
    repo: null,
    highlights: [
      "Conducted forensic acquisition across 4 host system images; verified evidentiary integrity through SHA-256 cryptographic hashing to maintain strict legal chain of custody.",
      "Reconstructed attack timelines from volatile memory dumps using Volatility 3 and extracted malicious payloads from packet captures in Wireshark, authoring a 22-page post-incident assessment report.",
      "Identified memory-injected DLL artifacts, malicious process lineage, and command-and-control beaconing channels."
    ]
  },
  {
    id: "yari-platform",
    name: "YaRi: Full-Stack E-Commerce Platform",
    category: "Full Stack",
    role: "Full-Stack Developer",
    stack: ["Java EE", "React.js", "Docker", "MySQL", "JWT", "Bcrypt"],
    blurb: "End-to-end e-commerce platform with role-based access control (RBAC), session management, and a dynamic storefront deployed via Docker containers.",
    repo: "https://github.com/LalithChaitanya1701/Yari_E-Commerce_Mark_1",
    highlights: [
      "Built an end-to-end e-commerce platform with role-based access control (RBAC), session management, and a dynamic storefront deployed via Docker containers.",
      "Designed normalized relational database schema with parameterized SQL queries preventing injection attacks.",
      "Implemented secure JWT session management and HTTP-only cookie guards."
    ]
  }
];

export const SKILL_GROUPS = [
  {
    title: "PROGRAMMING & SCRIPTING",
    skills: [
      { name: "Python", level: 92, tag: "Primary" },
      { name: "Java", level: 85, tag: "Enterprise" },
      { name: "SQL (MySQL, SQLite)", level: 88, tag: "Database" },
      { name: "Bash / Shell", level: 90, tag: "Automation" },
      { name: "JavaScript / TypeScript", level: 82, tag: "Full-Stack" },
      { name: "C", level: 75, tag: "Systems" }
    ]
  },
  {
    title: "SECURITY & SOC OPERATIONS",
    skills: [
      { name: "Burp Suite Pro", level: 92, tag: "VAPT" },
      { name: "SIEM & Log Correlation", level: 90, tag: "SOC Ops" },
      { name: "Nmap & Network Recon", level: 95, tag: "Recon" },
      { name: "Nessus Vulnerability Scanner", level: 88, tag: "Auditing" },
      { name: "OWASP ZAP", level: 86, tag: "Web Sec" },
      { name: "Wireshark Packet Analysis", level: 90, tag: "Traffic" },
      { name: "Volatility 3 (Memory Forensics)", level: 84, tag: "DFIR" },
      { name: "CIS Benchmarks & PCI-DSS", level: 86, tag: "Compliance" }
    ]
  },
  {
    title: "CLOUD & INFRASTRUCTURE",
    skills: [
      { name: "AWS (Config, Security Hub, Trail)", level: 88, tag: "Cloud Sec" },
      { name: "Terraform (IaC)", level: 84, tag: "DevSecOps" },
      { name: "Docker & Containerization", level: 86, tag: "Containers" },
      { name: "Linux Administration (Ubuntu, Kali)", level: 94, tag: "OS" },
      { name: "Git & CI/CD Pipelines", level: 88, tag: "Version Control" }
    ]
  }
];

export const CERTIFICATIONS = [
  {
    title: "ISC² Certified in Cybersecurity (CC)",
    issuer: "(ISC)²",
    period: "Active Member",
    desc: "Demonstrates core foundation in security principles, business continuity, disaster recovery, access controls, network security, and incident operations.",
    badge: "ISC2-CC-VERIFIED",
    image: "./assets/certified-in-cybersecurity-cc.1.png",
    verifyUrl: "https://www.credly.com/badges/ea74f8ba-4c5c-41e4-bdf5-e4c0dc0eb9ef/public_url"
  },
  {
    title: "Best Class Representative (CR) Award (2× Honoree)",
    issuer: "GNITC Academic Senate",
    period: "2024–2025 & 2025–2026",
    desc: "Recognized consecutively across two academic years for leadership, cross-functional student-faculty coordination, and technical cohort operations across 70+ peers.",
    badge: "LEADERSHIP-HONOR"
  },
  {
    title: "Tech Team Lead — HackArena National Hackathon",
    issuer: "GNITC Tech Board",
    period: "2025",
    desc: "Directed platform infrastructure, technical evaluation rubrics, code submission validation pipelines, and team mentors for a national engineering hackathon.",
    badge: "ORGANIZER-LEAD"
  }
];
