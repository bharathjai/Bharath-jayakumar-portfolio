/* ==========================================================================
   TERMINAL PORTFOLIO - JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initBgCanvas();
    initTypewriterObserver();
    initNavigation();
    initFilters();
    initInteractiveCLI();
    initProjectModals();
    initContactForm();
    initLiveClock();
});

/* ==========================================================================
   1. FAINT DIGITAL RAIN / MATRIX CODE CANVAS ENGINE (NEON YELLOW)
   ========================================================================== */
function initBgCanvas() {
    const canvas = document.getElementById('terminal-bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Matrix character set: Binary 0/1, Katakana, Hex, and Terminal Symbols
    const chars = '01010101010101アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ0123456789ABCDEF<=>/{}';
    const charArray = chars.split('');

    let fontSize = width < 768 ? 20 : 15;
    let columns = Math.floor(width / fontSize);
    let drops = [];

    function resetDrops() {
        fontSize = width < 768 ? 22 : 15; // Reduce drop density on mobile screens
        columns = Math.floor(width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -80); // Stagger initial drop start positions
        }
    }

    resetDrops();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        resetDrops();
    });

    // Pause animation when tab is not active to optimize system resources
    let isTabActive = true;
    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    let lastTime = 0;
    const fpsInterval = 1000 / 28; // Frame rate throttled to ~28 FPS for ultra-low CPU load

    function drawMatrix(currentTime) {
        if (!isTabActive) {
            requestAnimationFrame(drawMatrix);
            return;
        }

        const delta = currentTime - lastTime;
        if (delta > fpsInterval) {
            lastTime = currentTime - (delta % fpsInterval);

            // Subtle black trail fade
            ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
            ctx.fillRect(0, 0, width, height);

            ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = charArray[Math.floor(Math.random() * charArray.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Random subtle highlight on leading character
                if (Math.random() > 0.95) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Faint tip accent
                } else {
                    ctx.fillStyle = 'rgba(255, 230, 0, 0.04)'; // Ultra-subtle low opacity neon yellow (0.04 max)
                }

                if (y > 0) {
                    ctx.fillText(text, x, y);
                }

                // Reset drop to top once it falls past screen height
                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        }

        requestAnimationFrame(drawMatrix);
    }

    requestAnimationFrame(drawMatrix);
}

/* ==========================================================================
   2. TYPEWRITER ANIMATION (SCROLL-TRIGGERED)
   ========================================================================== */
function initTypewriterObserver() {
    const targets = document.querySelectorAll('.typewriter-target');
    if (!targets.length) return;

    const observerOptions = {
        root: null,
        threshold: 0.25
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (!target.dataset.typed) {
                    target.dataset.typed = "true";
                    startTyping(target);
                }
                obs.unobserve(target);
            }
        });
    }, observerOptions);

    targets.forEach(target => observer.observe(target));
}

function startTyping(element) {
    const fullText = element.getAttribute('data-type-text') || element.textContent.trim();
    const speed = parseInt(element.getAttribute('data-speed')) || 50;
    const delay = parseInt(element.getAttribute('data-delay')) || 0;
    
    const textSpan = element.querySelector('.typed-text') || element;
    textSpan.textContent = '';

    setTimeout(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < fullText.length) {
                textSpan.textContent += fullText.charAt(index);
                index++;
            } else {
                clearInterval(timer);
            }
        }, speed);
    }, delay);
}

/* ==========================================================================
   3. NAVIGATION, HAMBURGER & ACTIVE LINK HIGHLIGHTER
   ========================================================================== */
function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link-box');
    const sections = document.querySelectorAll('.terminal-section');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    // Close menu when clicking nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
            }
        });
    });

    // Active Section Scroll Highlight
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   4. CATEGORY FILTERS (SKILLS & PROJECTS)
   ========================================================================== */
function initFilters() {
    // Skills Filter
    const skillBtns = document.querySelectorAll('#skills-filter .filter-btn');
    const skillCards = document.querySelectorAll('#skills-grid .skill-card');

    skillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            skillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            skillCards.forEach(card => {
                const fillBar = card.querySelector('.progress-bar-fill');
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    if (fillBar) {
                        const targetWidth = fillBar.style.width;
                        fillBar.style.width = '0%';
                        setTimeout(() => { fillBar.style.width = targetWidth; }, 50);
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Projects Filter
    const projectBtns = document.querySelectorAll('#projects-filter .filter-btn');
    const projectCards = document.querySelectorAll('#projects-grid .project-card');

    projectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            projectBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ==========================================================================
   5. INTERACTIVE TERMINAL CLI MODAL ENGINE
   ========================================================================== */
function initInteractiveCLI() {
    const cliModal = document.getElementById('cli-modal');
    const openCliBtn = document.getElementById('open-cli-btn');
    const heroCliBtn = document.getElementById('hero-cli-trigger');
    const closeCliBtn = document.getElementById('close-cli-btn');
    const cliInput = document.getElementById('cli-input');
    const cliOutput = document.getElementById('cli-output-window');

    if (!cliModal || !cliInput || !cliOutput) return;

    function openCLI() {
        cliModal.hidden = false;
        cliInput.focus();
    }

    function closeCLI() {
        cliModal.hidden = true;
    }

    if (openCliBtn) openCliBtn.addEventListener('click', openCLI);
    if (heroCliBtn) heroCliBtn.addEventListener('click', openCLI);
    if (closeCliBtn) closeCliBtn.addEventListener('click', closeCLI);

    // Close on escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !cliModal.hidden) {
            closeCLI();
        }
        // Shortcut Ctrl+K to open CLI
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (cliModal.hidden) openCLI(); else closeCLI();
        }
    });

    // Handle command submission
    cliInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = cliInput.value.trim();
            if (rawCmd !== '') {
                executeCommand(rawCmd);
            }
            cliInput.value = '';
        }
    });

    function printLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `cli-line ${className}`;
        line.innerHTML = text;
        cliOutput.appendChild(line);
        cliOutput.scrollTop = cliOutput.scrollHeight;
    }

    function executeCommand(cmdStr) {
        // Echo input command
        printLine(`<span class="prompt-user">guest@terminal</span>:<span class="prompt-path">~</span>$&nbsp;${escapeHTML(cmdStr)}`);

        const args = cmdStr.toLowerCase().split(' ').filter(Boolean);
        const command = args[0];

        switch (command) {
            case 'help':
                printLine(`AVAILABLE COMMANDS:`);
                printLine(`  <span class="text-highlight">about</span>      - Display user background & bio summary`);
                printLine(`  <span class="text-highlight">skills</span>     - List core technical stack & competencies`);
                printLine(`  <span class="text-highlight">projects</span>   - View featured software repositories`);
                printLine(`  <span class="text-highlight">experience</span> - Show career chronology timeline`);
                printLine(`  <span class="text-highlight">contact</span>    - Print communication endpoints`);
                printLine(`  <span class="text-highlight">clear</span>      - Clear terminal screen history`);
                printLine(`  <span class="text-highlight">date</span>       - Display system date and time`);
                printLine(`  <span class="text-highlight">whoami</span>     - Output active user session info`);
                printLine(`  <span class="text-highlight">sudo hire</span>  - Execute hiring authorization protocol`);
                printLine(`  <span class="text-highlight">exit</span>       - Close terminal window session`);
                break;

            case 'about':
            case 'cat':
                printLine(`USER PROFILE: BHARATH JAYAKUMAR`);
                printLine(`ROLE: Software Developer | Cyber Security | Full-Stack Development`);
                printLine(`BIO: Cyber Security graduate building MERN e-commerce platforms, AI-driven spyware detection, and secure RESTful services.`);
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'skills':
                printLine(`TECHNICAL SKILLS SUMMARY:`);
                printLine(`  • Languages: Java, JavaScript, TypeScript, Python, SQL`);
                printLine(`  • Web Stack: Node.js, Express, React.js, HTML5, CSS3, RESTful APIs`);
                printLine(`  • Databases: MongoDB, MySQL`);
                printLine(`  • Tools & Analytics: Git, GitHub, Firebase FCM, Postman, GA4, Microsoft Clarity`);
                document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'projects':
                printLine(`FEATURED REPOSITORIES & DEPLOYMENTS:`);
                printLine(`  1. Namma Veetu Anjaraipetti [MERN E-Commerce Platform] (Live: https://nammaveetuanjaraipetti.online)`);
                printLine(`  2. Spyware Detection Using AI & ML [Python / Flask / Supervised ML] (2nd Prize Expo)`);
                printLine(`  3. Code in Borderland [Node.js / TypeScript] (100+ Participants Event Platform)`);
                printLine(`  4. NextGen ATM — Multi-Bank Biometric Access [Python / OpenCV / ML]`);
                document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'experience':
                printLine(`CAREER CHRONOLOGY:`);
                printLine(`  [2026] Freelance Full-Stack Developer @ Namma Veetu Anjaraipetti`);
                printLine(`  [2022-2026] B.E. Cyber Security @ SRM Valliammai Engineering College`);
                printLine(`  [2025] Infosys Springboard Certification: AI & ML`);
                printLine(`  [2022] HSC @ ARC Kamatchi Matriculation School`);
                document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'contact':
                printLine(`DIRECT ENDPOINTS:`);
                printLine(`  Email: <a href="mailto:bharathjai2005@gmail.com" class="ep-link">bharathjai2005@gmail.com</a>`);
                printLine(`  Phone: +91 9489890596`);
                printLine(`  Location: Chennai, Tamil Nadu, India`);
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'clear':
                cliOutput.innerHTML = '';
                break;

            case 'date':
                printLine(`SYSTEM TIME: ${new Date().toUTCString()}`);
                break;

            case 'whoami':
                printLine(`USER: guest_visitor | VIEWING PROFILE: BHARATH JAYAKUMAR`);
                break;

            case 'sudo':
                if (args[1] === 'hire') {
                    printLine(`<span class="text-accent">[ACCESS GRANTED] OFFER ACCEPTED!</span>`, 'text-accent');
                    printLine(`Initiating onboarding sequence... Sending congratulations packet to contact form!`);
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    printLine(`sudo: permission denied. Try 'sudo hire' for special access.`);
                }
                break;

            case 'exit':
            case 'quit':
                closeCLI();
                break;

            default:
                printLine(`Command not found: '${escapeHTML(command)}'. Type <span class="text-highlight">'help'</span> for list of commands.`);
                break;
        }
    }
}

/* Helper function to sanitize HTML in CLI output */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================================
   6. PROJECT DETAILS MODAL
   ========================================================================== */
function initProjectModals() {
    const projectModal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-project-modal-btn');
    const modalPath = document.getElementById('modal-project-path');
    const modalBody = document.getElementById('modal-project-body');
    const projectCards = document.querySelectorAll('.project-card');

    const projectData = {
        'project-1': {
            path: '~/projects/namma-veetu-anjaraipetti',
            title: '[Namma Veetu Anjaraipetti — E-Commerce]',
            description: 'Full-stack MERN e-commerce platform built & deployed for a local spice business. Features Google authentication, guest checkout, MongoDB order workflows, and Firebase Cloud Messaging (FCM) for real-time order notifications.',
            features: [
                'Google authentication & guest checkout workflow',
                'MongoDB-based order management & Firebase FCM real-time order notifications',
                'SEO optimization, Google Search Console, GA4, & Microsoft Clarity tracking',
                'Collaborated directly with client to gather requirements & refine UX'
            ],
            tech: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Firebase FCM', 'GA4'],
            githubUrl: 'https://github.com/bharathjai/terminal-portfolio',
            demoUrl: 'https://nammaveetuanjaraipetti.online'
        },
        'project-2': {
            path: '~/projects/spyware-detection-ai',
            title: '[Spyware Detection Using AI & ML]',
            description: 'AI-based spyware detection system that analyzes running processes and classifies suspicious activity using supervised machine learning.',
            features: [
                'Supervised ML classifier analyzing running system processes',
                'Real-time security dashboard with risk levels & process metrics',
                'PDF report generation & instant threat alerting support',
                'Awarded 2nd Prize in Department Mini Project Expo'
            ],
            tech: ['Python', 'Flask', 'Machine Learning', 'HTML5', 'CSS3', 'JavaScript'],
            githubUrl: 'https://github.com',
            demoUrl: 'https://github.com'
        },
        'project-3': {
            path: '~/projects/code-in-borderland',
            title: '[Code in Borderland — Technical Event Web]',
            description: 'Event platform designed and developed for registrations, event rules, participant dashboards, and coding challenge coordination.',
            features: [
                'Supported successful hosting of 100+ participants',
                'Independently managed the full technical workflow & deployment',
                'Participant dashboard & coding challenge coordination'
            ],
            tech: ['Node.js', 'TypeScript', 'HTML5', 'CSS3', 'JavaScript'],
            githubUrl: 'https://github.com',
            demoUrl: 'https://github.com'
        },
        'project-4': {
            path: '~/projects/nextgen-biometric-atm',
            title: '[NextGen ATM — Biometric Access]',
            description: 'Cardless ATM concept utilizing facial recognition, cancelable biometric templates, multi-bank account retrieval, and risk-based authentication.',
            features: [
                'Facial recognition pipeline built with Python & OpenCV',
                'Cancelable biometric templates for security compliance',
                'Multi-bank account retrieval & risk-based authentication protocol'
            ],
            tech: ['Python', 'OpenCV', 'Machine Learning', 'Biometric Security'],
            githubUrl: 'https://github.com',
            demoUrl: 'https://github.com'
        }
    };

    function openModalForCard(card) {
        if (!projectModal || !modalPath || !modalBody) {
            console.error('[Modal Error] Missing modal DOM elements in document.');
            return;
        }

        const triggerBtn = card.querySelector('.project-modal-trigger');
        const projectId = triggerBtn ? triggerBtn.getAttribute('data-project') : null;
        let data = projectId ? projectData[projectId] : null;

        // Fallback: extract directly from DOM elements of the card if data object not found
        if (!data) {
            const pathText = card.querySelector('.card-path')?.textContent.trim() || '~/projects/details';
            const titleText = card.querySelector('.project-title')?.textContent.trim() || '[Project Details]';
            const descText = card.querySelector('.project-desc')?.textContent.trim() || '[Project Description Placeholder]';
            const tagEls = card.querySelectorAll('.tech-tags .tag');
            const techList = Array.from(tagEls).map(t => t.textContent.trim());

            data = {
                path: pathText,
                title: titleText,
                description: descText,
                features: ['Automated deployment pipeline', 'Modular system architecture', 'Responsive terminal interface'],
                tech: techList.length > 0 ? techList : ['[Tech Stack]'],
                githubUrl: 'https://github.com',
                demoUrl: 'https://example.com'
            };
            console.log(`[Modal] Using extracted DOM data for project: ${titleText}`);
        } else {
            console.log(`[Modal] Loaded dictionary payload for project ID: ${projectId}`);
        }

        // Error check if data is still completely empty
        if (!data.title && !data.description) {
            console.warn('[Modal Warning] No project payload found. Displaying fallback info.');
            data = {
                path: '~/projects/unknown',
                title: '[No Project Data Found]',
                description: '[Project description payload is currently empty. Replace with real project details.]',
                features: ['[Feature placeholder 1]', '[Feature placeholder 2]'],
                tech: ['[Technology Placeholder]'],
                githubUrl: 'https://github.com',
                demoUrl: 'https://example.com'
            };
        }

        // Render modal content
        modalPath.textContent = data.path || '~/projects/details';

        const techPills = (data.tech || []).map(t => `<span class="tag" style="font-size:0.85rem; padding: 0.2rem 0.5rem;">${escapeHTML(t)}</span>`).join(' ');
        const featureItems = (data.features || ['[Feature Detail 1]']).map(f => `<li style="margin-bottom:0.35rem;">${escapeHTML(f)}</li>`).join('');

        modalBody.innerHTML = `
            <div class="modal-project-content">
                <h3 class="section-heading" style="margin-bottom: 0.8rem; font-size: 1.3rem;">${escapeHTML(data.title || '[Project Title]')}</h3>
                
                <p class="bio-paragraph" style="margin-bottom: 1.2rem; line-height: 1.6;">
                    ${escapeHTML(data.description || '[Project Description Placeholder]')}
                </p>

                <h4 class="info-title" style="margin-bottom: 0.5rem; font-size: 0.95rem;">> SYSTEM ARCHITECTURE & KEY FEATURES</h4>
                <ul style="margin-left: 1.4rem; margin-bottom: 1.5rem; color: var(--neon-yellow); font-size: 0.9rem;">
                    ${featureItems}
                </ul>

                <h4 class="info-title" style="margin-bottom: 0.5rem; font-size: 0.95rem;">> STACK / TECHNOLOGIES USED</h4>
                <div class="tech-tags" style="margin-bottom: 1.8rem;">
                    ${techPills}
                </div>

                <div class="hero-actions" style="margin-top: 1rem; gap: 0.8rem; display: flex;">
                    <a href="${escapeHTML(data.githubUrl || 'https://github.com')}" target="_blank" rel="noopener noreferrer" class="btn-box glow-btn">[> REPOSITORY_SOURCE]</a>
                    <a href="${escapeHTML(data.demoUrl || 'https://example.com')}" target="_blank" rel="noopener noreferrer" class="btn-box glow-btn">[> LIVE_DEMO]</a>
                </div>
            </div>
        `;

        projectModal.hidden = false;
    }

    // Attach click handlers to project cards and trigger buttons
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Allow direct links (like GitHub external button) without opening modal
            if (e.target.tagName === 'A' && !e.target.classList.contains('project-modal-trigger')) {
                return;
            }
            e.preventDefault();
            openModalForCard(card);
        });
        card.style.cursor = 'pointer';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (projectModal) projectModal.hidden = true;
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal && !projectModal.hidden) {
            projectModal.hidden = true;
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.hidden = true;
        }
        if (e.target === document.getElementById('cli-modal')) {
            document.getElementById('cli-modal').hidden = true;
        }
    });
}

/* ==========================================================================
   7. CONTACT FORM SUBMISSION WITH TERMINAL FEEDBACK LOG
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name')?.value;
        const email = document.getElementById('form-email')?.value;
        const message = document.getElementById('form-message')?.value;

        if (!name || !email || !message) return;

        // Terminal animation sequence
        submitBtn.disabled = true;
        submitBtn.textContent = '[> TRANSMITTING_PAYLOAD...]';

        feedback.hidden = false;
        feedback.innerHTML = `
            <div>> INITIATING ENCRYPTED CONNECTION TO HOST...</div>
            <div>> VALIDATING PACKET PAYLOAD FOR: ${escapeHTML(email)}...</div>
        `;

        setTimeout(() => {
            feedback.innerHTML += `<div>> STATUS: 200 OK — TRANSMISSION DELIVERED SUCCESSFULLY!</div>`;
            feedback.innerHTML += `<div class="text-accent">> Thank you ${escapeHTML(name)}. I will respond to your message shortly.</div>`;

            submitBtn.disabled = false;
            submitBtn.textContent = '[> SEND_TRANSMISSION]';
            form.reset();
        }, 1200);
    });
}

/* ==========================================================================
   8. FOOTER LIVE UTC CLOCK & YEAR
   ========================================================================== */
function initLiveClock() {
    const clockEl = document.getElementById('live-clock');
    const yearEl = document.getElementById('current-year');

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const hrs = String(now.getUTCHours()).padStart(2, '0');
        const mins = String(now.getUTCMinutes()).padStart(2, '0');
        const secs = String(now.getUTCSeconds()).padStart(2, '0');
        clockEl.innerHTML = `${hrs}:${mins}:${secs} UTC <span class="blink-symbol">|</span> LIVE`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

// Guarantee clock runs immediately
initLiveClock();
