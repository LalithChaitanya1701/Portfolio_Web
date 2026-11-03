/**
 * Lalith Chaitanya Mulapala - Portfolio & Experience Data
 * Technical Specifications & Direct Experience Metrics (aligned with Lalith_Resume.pdf)
 */

export const PERSONAL_INFO = {
  name: "Lalith Chaitanya Mulapala",
  title: "Cybersecurity Analyst & Systems Engineer",
  location: "Hyderabad, India",
  email: "lalithchaitanya.mulapala@gmail.com",
  phone: "+91 8309191260",
  linkedin: "https://www.linkedin.com/in/lalith-chaitanya-mulapala-615435301/",
  github: "https://github.com/LalithChaitanya1701",
  summary: "ISC2-certified Cybersecurity Analyst and Computer Science Engineer (Major GPA: 8.58, Minor GPA: 8.22) with practical experience in threat monitoring, web application vulnerability assessment (VAPT), network auditing, and cloud security automation. Proven track record in triaging enterprise security events, building automated SIEM detection pipelines with 50+ pre-configured rules, engineering custom reconnaissance and testing engines, and validating infrastructure against CIS Benchmarks and PCI-DSS standards. Proficient in Python, Java, Linux administration, and network forensics, with demonstrated leadership in technical incident management and cross-functional operations across 70+ peers.",
  stats: [
    { value: "8.58", label: "CUMULATIVE GPA (MAJOR)", sub: "Minor: 8.22 / 10.0 · B.Tech CSE" },
    { value: "14", label: "VULNS DOCUMENTED", sub: "3 Critical SQLi, 4 High IDOR" },
    { value: "50+", label: "SIEM DETECTION RULES", sub: "<2s Alert Ingestion Pipeline" },
    { value: "18", label: "AWS CONTROLS AUTOMATED", sub: "60% Faster Audit Evaluations" }
  ],
  education: {
    institution: "Guru Nanak Institutions Technical Campus (GNITC)",
    location: "Hyderabad, India",
    degree: "Bachelor of Technology in Computer Science Engineering",
    specialization: "Cybersecurity Major, AI/ML Minor",
    period: "November 2022 – April 2026",
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
    period: "May 2025 – January 2026",
    specs: [
      "Conducted authorized security assessments of 8 production endpoints supporting enterprise clients, identifying vulnerabilities through manual testing and automated security assessment techniques.",
      "Identified and validated 14 security vulnerabilities, including 3 critical SQL Injection vulnerabilities and 4 high-severity Insecure Direct Object Reference (IDOR) vulnerabilities.",
      "Utilized Burp Suite Professional, OWASP ZAP, Nmap NSE scripts, and SQLMap to perform vulnerability assessment, application security testing, and security validation.",
      "Collaborated with development teams to prioritize remediation activities, validate security fixes, and achieve an 85% remediation rate across documented vulnerabilities within 30 days.",
      "Prepared 6 comprehensive security risk assessment reports to communicate vulnerability findings, potential business impact, and remediation recommendations.",
      "Developed a lightweight vulnerability tracking dashboard to monitor remediation progress and Mean Time to Remediate (MTTR)."
    ],
    tools: [
      "Burp Suite Professional",
      "OWASP ZAP",
      "Nmap",
      "SQLMap",
      "Python",
      "Linux",
      "Vulnerability Assessment",
      "Web Application Security Testing"
    ]
  },
  {
    id: "securwires",
    role: "Cyber Security & AI/ML Operations Intern (SAB 1.0 Cohort)",
    company: "SecurWires Technologies and Services LLP (STSL)",
    location: "Mumbai, India",
    period: "January 2026 – March 2026",
    specs: [
      "Supported security assessment activities across 25+ internal network subnets, covering hundreds of active network nodes.",
      "Performed manual validation of 40+ high-priority Nessus vulnerability findings to distinguish genuine security risks from false positives and scanner-generated artifacts.",
      "Developed Python-based log parsing and correlation scripts to streamline security log analysis and identify authentication anomalies and unusual endpoint activity.",
      "Improved security log triage efficiency by reducing manual analysis time by approximately 35% through process automation.",
      "Co-authored Standard Operating Procedures (SOPs) covering incident escalation, security event handling, and forensic data acquisition.",
      "Contributed to security operations workflows through vulnerability validation, network assessment, log analysis, and incident response documentation."
    ],
    tools: [
      "Nessus",
      "Python",
      "Nmap",
      "Wireshark",
      "Bash",
      "SIEM Concepts",
      "Security Log Analysis",
      "Vulnerability Assessment",
      "Incident Response"
    ]
  }
];

export const PROJECTS = [
  {
    id: "aws-compliance",
    name: "Security Automation and Compliance Testing Across AWS",
    category: "Cloud Security",
    role: "Cloud Security Architect & Engineer",
    stack: ["Terraform", "AWS Security Hub", "AWS Config", "Python (Boto3)", "CloudTrail", "CloudWatch", "SNS"],
    blurb: "Continuous compliance framework automating real-time evaluation and remediation for 18 security controls against CIS AWS Foundations Benchmark and PCI-DSS, decreasing audit evaluation time by 60%.",
    repo: "https://github.com/LalithChaitanya1701",
    tag: "Internal Project / Architecture Artifact",
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
    blurb: "Automated Computer-Based Testing (CBT) engine that ingests custom raw text/markdown question banks and transforms them into interactive simulation environments.",
    repo: "https://github.com/LalithChaitanya1701/Exam_Forge",
    tag: "GitHub Repository",
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
    blurb: "Python-based GUI reconnaissance engine aggregating OSINT data streams from WHOIS, DNS records, SSL/TLS certificates, and Shodan API with token-bucket rate limiting.",
    repo: "https://github.com/LalithChaitanya1701/Automatic-Reconnaissance-with-Python_Mark_1",
    tag: "GitHub Repository",
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
    stack: ["Python", "SQLite", "SMTP Protocol", "Regex", "Socket API"],
    blurb: "Lightweight SIEM simulation pipeline featuring 50+ pre-configured detection rules, real-time log file tailing, SQLite caching, and sub-2-second automated security alerts.",
    repo: "https://github.com/LalithChaitanya1701/Log_Based_Threat_Detector",
    tag: "GitHub Repository",
    highlights: [
      "Engineered a lightweight SIEM simulation pipeline featuring 50+ pre-configured detection rules, real-time log file tailing, and automated SMTP incident dispatching.",
      "Implemented high-throughput multithreaded log ingestion with SQLite caching, reducing security event triage latency by 45% and achieving an average alert dispatch time under 2 seconds."
    ]
  },
  {
    id: "brut3zero",
    name: "Brut3Zero: Multi-Protocol Security Testing Suite",
    category: "Offensive Security",
    role: "Security Tool Developer",
    stack: ["Python", "Requests", "Paramiko", "Multithreading", "Tkinter"],
    blurb: "Modular authentication stress-testing suite supporting HTTP, FTP, and SSH protocols featuring a Tkinter GUI and a BFS web-form crawler with token-bucket rate limiting.",
    repo: "https://github.com/LalithChaitanya1701/Brut3Zer0_mark_2",
    tag: "GitHub Repository",
    highlights: [
      "Developed a modular authentication stress-testing suite supporting HTTP, FTP, and SSH protocols featuring a Tkinter GUI and a BFS web-form crawler.",
      "Built token-bucket rate limiting and automated backoff mechanisms to prevent endpoint denial-of-service, sustaining 200+ requests/sec across 10+ authorized lab wordlists with 0% socket drops."
    ]
  },
  {
    id: "chfi-forensics",
    name: "Enterprise Digital Forensics Investigation (CHFI Lab)",
    category: "Digital Forensics",
    role: "Forensic Investigator",
    stack: ["Volatility 3", "Wireshark", "FTK Imager", "Cryptographic Hashing (SHA-256)"],
    blurb: "Forensic acquisition across 4 host system images with SHA-256 integrity verification, attack timeline reconstruction from volatile memory dumps, and 22-page post-incident assessment report.",
    repo: null,
    tag: "Technical Report Available Upon Request",
    highlights: [
      "Conducted forensic acquisition across 4 host system images; verified evidentiary integrity through SHA-256 cryptographic hashing to maintain strict legal chain of custody.",
      "Reconstructed attack timelines from volatile memory dumps using Volatility 3 and extracted malicious payloads from packet captures in Wireshark, authoring a 22-page post-incident assessment report."
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
    tag: "GitHub Repository",
    highlights: [
      "Built an end-to-end e-commerce platform with role-based access control (RBAC), session management, and a dynamic storefront deployed via Docker containers.",
      "Designed normalized relational database schema with parameterized SQL queries preventing injection attacks.",
      "Implemented secure JWT session management and HTTP-only cookie guards."
    ]
  }
];

export const SKILL_GROUPS = [
  {
    title: "SECURITY & SOC OPERATIONS",
    skills: [
      { name: "Burp Suite Professional & OWASP ZAP", level: 94, tag: "VAPT" },
      { name: "SIEM Detection Pipelines & Log Triage", level: 92, tag: "SOC Ops" },
      { name: "Nmap, Nessus & Vulnerability Auditing", level: 92, tag: "Recon" },
      { name: "Wireshark Packet Analysis & Forensics", level: 90, tag: "Traffic" },
      { name: "Volatility 3 Memory Forensics", level: 86, tag: "DFIR" },
      { name: "CIS Benchmarks & PCI-DSS Compliance", level: 88, tag: "Compliance" },
      { name: "Incident Triage & SOP Authoring", level: 90, tag: "Incident Response" },
      { name: "SQLMap & Metasploit", level: 85, tag: "Exploit Validation" }
    ]
  },
  {
    title: "PROGRAMMING & SCRIPTING",
    skills: [
      { name: "Python", level: 92, tag: "Primary" },
      { name: "Java", level: 85, tag: "Enterprise" },
      { name: "SQL (MySQL, SQLite)", level: 88, tag: "Database" },
      { name: "Bash Scripting", level: 90, tag: "Automation" },
      { name: "JavaScript", level: 84, tag: "Scripting / Web" },
      { name: "C", level: 78, tag: "Systems" }
    ]
  },
  {
    title: "TOOLS & PLATFORMS",
    skills: [
      { name: "AWS (Config, Security Hub, Trail, Watch, SNS)", level: 90, tag: "Cloud Sec" },
      { name: "Linux Administration (Kali, Ubuntu)", level: 94, tag: "OS / Sec" },
      { name: "Terraform (IaC)", level: 86, tag: "DevSecOps" },
      { name: "Docker Containerization", level: 86, tag: "Containers" },
      { name: "VMware", level: 82, tag: "Virtualization" },
      { name: "Git & GitHub", level: 88, tag: "Version Control" }
    ]
  },
  {
    title: "FRAMEWORKS & LIBRARIES",
    skills: [
      { name: "React.js", level: 84, tag: "Frontend" },
      { name: "Java EE", level: 82, tag: "Backend" },
      { name: "PyTorch", level: 80, tag: "AI / ML" },
      { name: "Hugging Face Transformers", level: 80, tag: "NLP / LLMs" },
      { name: "Scikit-learn", level: 82, tag: "Machine Learning" }
    ]
  }
];

export const CERTIFICATIONS = [
  {
    title: "ISC² Certified in Cybersecurity (CC)",
    issuer: "(ISC)²",
    period: "Active Member",
    desc: "Active (ISC)² member certification verifying core competencies across security principles, business continuity, disaster recovery, access controls, network security, and incident response operations.",
    badge: "ISC2-CC-VERIFIED",
    image: "./assets/certified-in-cybersecurity-cc.1.png",
    verifyUrl: "https://www.credly.com/badges/ea74f8ba-4c5c-41e4-bdf5-e4c0dc0eb9ef/public_url"
  },
  {
    title: "Best Class Representative (CR) Award (2× Honoree)",
    issuer: "GNITC Academic Senate",
    period: "2024–2025 & 2025–2026",
    desc: "Recognized consecutively across two academic years for cross-functional communication and academic operations management across 70+ peers.",
    badge: "LEADERSHIP-HONOR"
  },
  {
    title: "Tech Team Lead — HackArena National Hackathon",
    issuer: "GNITC Tech Board",
    period: "2025",
    desc: "Directed technical evaluation criteria, platform infrastructure, and team coordination for a national-level engineering hackathon at GNITC.",
    badge: "ORGANIZER-LEAD"
  }
];
