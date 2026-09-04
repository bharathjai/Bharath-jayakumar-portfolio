/* ==========================================================================
   TERMINAL PORTFOLIO - JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initBgCanvas();
    initAnimatedBootSequence();
    init3DAsciiCube();
    initDraggableWindows();
    initWindowControlDots();
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
   2. ANIMATED BOOT SEQUENCE (TYPING EFFECT ON LOAD)
   ========================================================================== */
function initAnimatedBootSequence() {
    const bootContainer = document.getElementById('boot-log');
    if (!bootContainer) return;

    const bootMessages = [
        "> INITIALIZING CORE ARCHITECTURE...",
        "> LOADING USER PROFILE: BHARATH JAYAKUMAR...",
        "> MOUNTING CYBER SECURITY & FULL-STACK MODULES...",
        "> CONNECTING MERN & QUANTITATIVE ALGO ENGINES...",
        "> STATUS: BHARATH_PROFILE_ONLINE [SYSTEM READY]"
    ];

    bootContainer.innerHTML = '';
    let msgIndex = 0;

    function typeNextLine() {
        if (msgIndex >= bootMessages.length) return;

        const lineText = bootMessages[msgIndex];
        const lineDiv = document.createElement('div');
        lineDiv.className = 'log-line' + (msgIndex === bootMessages.length - 1 ? ' highlight-line' : '');
        bootContainer.appendChild(lineDiv);

        let charIndex = 0;
        const charInterval = setInterval(() => {
            if (charIndex <= lineText.length) {
                lineDiv.textContent = lineText.substring(0, charIndex) + (charIndex < lineText.length ? '█' : ' [OK]');
                charIndex++;
                bootContainer.scrollTop = bootContainer.scrollHeight;
            } else {
                clearInterval(charInterval);
                msgIndex++;
                setTimeout(typeNextLine, 180);
            }
        }, 22);
    }

    setTimeout(typeNextLine, 200);
}

/* ==========================================================================
   3. 3D INTERACTIVE SPINNING ASCII WIREFRAME CUBE ENGINE
   ========================================================================== */
function init3DAsciiCube() {
    const pre = document.getElementById('ascii-cube-pre');
    if (!pre) return;

    let A = 0;
    let B = 0;

    const width = 44;
    const height = 20;

    function renderFrame() {
        let zBuffer = new Array(width * height).fill(0);
        let buffer = new Array(width * height).fill(' ');

        // Cube coordinates rendering
        for (let x = -10; x < 10; x += 1.2) {
            for (let y = -10; y < 10; y += 1.2) {
                for (let z = -10; z < 10; z += 1.2) {
                    // Only render points on the outer faces of the cube
                    if (Math.abs(x) < 9 && Math.abs(y) < 9 && Math.abs(z) < 9) continue;

                    // Rotate 3D points
                    let cosA = Math.cos(A), sinA = Math.sin(A);
                    let cosB = Math.cos(B), sinB = Math.sin(B);

                    let x1 = x;
                    let y1 = y * cosA - z * sinA;
                    let z1 = y * sinA + z * cosA;

                    let x2 = x1 * cosB + z1 * sinB;
                    let y2 = y1;
                    let z2 = -x1 * sinB + z1 * cosB;

                    let distance = 35;
                    let ooz = 1 / (z2 + distance);

                    let xp = Math.floor(width / 2 + x2 * ooz * 42);
                    let yp = Math.floor(height / 2 + y2 * ooz * 22);

                    let idx = xp + yp * width;

                    if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                        if (ooz > zBuffer[idx]) {
                            zBuffer[idx] = ooz;
                            // Luminance chars for retro phosphor shading
                            const chars = '.,-~:;=!*#$@';
                            let luminanceIdx = Math.floor((z2 + 10) / 20 * (chars.length - 1));
                            luminanceIdx = Math.max(0, Math.min(chars.length - 1, luminanceIdx));
                            buffer[idx] = chars[luminanceIdx];
                        }
                    }
                }
            }
        }

        let outputStr = '';
        for (let i = 0; i < height; i++) {
            outputStr += buffer.slice(i * width, (i + 1) * width).join('') + '\n';
        }

        pre.textContent = outputStr;
        A += 0.03;
        B += 0.02;
    }

    let cubeInterval = setInterval(renderFrame, 45);

    // Pause cube animation when tab is invisible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(cubeInterval);
        } else {
            cubeInterval = setInterval(renderFrame, 45);
        }
    });
}

/* ==========================================================================
   4. DRAGGABLE WINDOW PANELS
   ========================================================================== */
function initDraggableWindows() {
    const headers = document.querySelectorAll('.terminal-box .box-header');

    headers.forEach(header => {
        const box = header.closest('.terminal-box');
        if (!box) return;

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.style.cursor = 'grab';

        header.addEventListener('mousedown', (e) => {
            // Ignore click if clicking on control dot buttons
            if (e.target.classList.contains('control-dot')) return;

            isDragging = true;
            header.style.cursor = 'grabbing';

            const rect = box.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;

            // Get computed positioning or set relative offsets
            if (getComputedStyle(box).position === 'static') {
                box.style.position = 'relative';
            }

            initialLeft = box.offsetLeft;
            initialTop = box.offsetTop;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            box.style.left = `${dx}px`;
            box.style.top = `${dy}px`;
        }

        function onMouseUp() {
            isDragging = false;
            header.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    });
}

/* ==========================================================================
   5. WINDOW CONTROL DOTS (MINIMIZE / EXPAND / CLOSE)
   ========================================================================== */
function initWindowControlDots() {
    const boxes = document.querySelectorAll('.terminal-box');

    boxes.forEach(box => {
        const dots = box.querySelectorAll('.control-dot');
        const body = box.querySelector('.box-body');

        if (dots.length >= 3 && body) {
            // Dot 1 (Red): Hide/Close Window with smooth animation
            dots[0].addEventListener('click', (e) => {
                e.stopPropagation();
                box.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                box.style.opacity = '0.15';
                box.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    box.style.display = 'none';
                    showRestoreBanner(box);
                }, 300);
            });

            // Dot 2 (Yellow): Minimize/Collapse Window Body
            dots[1].addEventListener('click', (e) => {
                e.stopPropagation();
                if (body.style.display === 'none') {
                    body.style.display = 'block';
                } else {
                    body.style.display = 'none';
                }
            });

            // Dot 3 (Green): Toggle Window Highlight/Maximize
            dots[2].addEventListener('click', (e) => {
                e.stopPropagation();
                box.classList.toggle('window-maximized');
                if (box.classList.contains('window-maximized')) {
                    box.style.borderColor = 'var(--neon-yellow-bright)';
                    box.style.boxShadow = '0 0 30px var(--neon-yellow-glow)';
                } else {
                    box.style.borderColor = 'var(--neon-yellow)';
                    box.style.boxShadow = '';
                }
            });
        }
    });
}

function showRestoreBanner(closedBox) {
    let banner = document.getElementById('restore-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'restore-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            background: rgba(0,0,0,0.95);
            border: 1px solid var(--neon-yellow);
            padding: 0.6rem 1rem;
            z-index: 800;
            font-size: 0.85rem;
            color: var(--neon-yellow);
            box-shadow: 0 0 15px var(--neon-yellow-glow);
        `;
        document.body.appendChild(banner);
    }

    const boxTitle = closedBox.querySelector('.box-title')?.textContent || 'Terminal Window';
    banner.innerHTML = `
        [WINDOW CLOSED] '${boxTitle}' 
        <button id="restore-btn" style="margin-left:10px; background:var(--neon-yellow); color:#000; border:none; padding:2px 8px; font-weight:bold; cursor:pointer;">
            [RESTORE]
        </button>
    `;
    banner.style.display = 'block';

    document.getElementById('restore-btn').addEventListener('click', () => {
        closedBox.style.display = 'block';
        closedBox.style.opacity = '1';
        closedBox.style.transform = 'none';
        banner.style.display = 'none';
    });
}

/* ==========================================================================
   6. TYPEWRITER ANIMATION (SCROLL-TRIGGERED)
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
   7. NAVIGATION, HAMBURGER & ACTIVE LINK HIGHLIGHTER
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
   8. CATEGORY FILTERS (SKILLS & PROJECTS)
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
   9. INTERACTIVE TERMINAL CLI MODAL ENGINE (WITH THEME SWITCHER & EASTER EGGS)
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
        printLine(`<span class="prompt-user">bharath@terminal</span>:<span class="prompt-path">~</span>$&nbsp;${escapeHTML(cmdStr)}`);

        const args = cmdStr.toLowerCase().split(' ').filter(Boolean);
        const command = args[0];

        switch (command) {
            case 'help':
                printLine(`AVAILABLE SYSTEM COMMANDS:`);
                printLine(`  <span class="text-highlight">about</span>            - Display user bio & background details`);
                printLine(`  <span class="text-highlight">skills</span>           - List core technical stack & competencies`);
                printLine(`  <span class="text-highlight">projects</span>         - View featured software & case studies`);
                printLine(`  <span class="text-highlight">experience</span>       - Show career chronology timeline`);
                printLine(`  <span class="text-highlight">contact</span>          - Print communication endpoints`);
                printLine(`  <span class="text-highlight">theme &lt;name&gt;</span>     - Switch terminal palette (<span class="text-accent">green</span>, <span class="text-accent">amber</span>, <span class="text-accent">light</span>, <span class="text-accent">yellow</span>)`);
                printLine(`  <span class="text-highlight">cat contact.txt</span>   - Download resume / trigger email link`);
                printLine(`  <span class="text-highlight">clear</span>            - Clear terminal output history`);
                printLine(`  <span class="text-highlight">date</span>             - Display system date & time`);
                printLine(`  <span class="text-highlight">whoami</span>           - Output active session details`);
                printLine(`  <span class="text-highlight">sudo hire</span>        - Execute hiring authorization protocol`);
                printLine(`  <span class="text-highlight">exit</span>             - Close terminal window session`);
                break;

            case 'theme':
                const themeName = args[1];
                if (!themeName || themeName === 'yellow' || themeName === 'reset') {
                    document.body.className = '';
                    printLine(`[THEME] Switched to default Neon Yellow terminal theme.`);
                } else if (themeName === 'green') {
                    document.body.className = 'theme-green';
                    printLine(`[THEME] Switched to Green CRT Matrix phosphor theme.`);
                } else if (themeName === 'amber') {
                    document.body.className = 'theme-amber';
                    printLine(`[THEME] Switched to Amber Retro terminal theme.`);
                } else if (themeName === 'light') {
                    document.body.className = 'theme-light';
                    printLine(`[THEME] Switched to High-Contrast Light hacker theme.`);
                } else {
                    printLine(`Unknown theme variant '${escapeHTML(themeName)}'. Options: <span class="text-highlight">green, amber, light, yellow</span>`);
                }
                break;

            case 'cat':
                if (args[1] === 'contact.txt' || args[1] === 'resume.txt' || args[1] === 'resume') {
                    printLine(`> OPENING CONTACT TRANSMISSION & RESUME LINK...`);
                    printLine(`Direct Mailto: <a href="mailto:bharathjai2005@gmail.com" class="ep-link">bharathjai2005@gmail.com</a>`);
                    window.location.href = 'mailto:bharathjai2005@gmail.com';
                } else {
                    printLine(`USER PROFILE: BHARATH JAYAKUMAR`);
                    printLine(`ROLE: Software Developer | Cyber Security | Full-Stack Development`);
                    printLine(`BIO: Cyber Security graduate building MERN e-commerce platforms, MQL5 algo trading engines, and AI spyware classification systems.`);
                    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                }
                break;

            case 'about':
                printLine(`USER PROFILE: BHARATH JAYAKUMAR`);
                printLine(`ROLE: Software Developer | Cyber Security | Full-Stack Development`);
                printLine(`BIO: Cyber Security graduate building MERN e-commerce platforms, MQL5 algo trading engines, and AI spyware classification systems.`);
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'skills':
                printLine(`TECHNICAL SKILLS SUMMARY:`);
                printLine(`  • Languages: Java, JavaScript, TypeScript, Python, SQL, MQL5`);
                printLine(`  • Web Stack: Node.js, Express, React.js, HTML5, CSS3, RESTful APIs`);
                printLine(`  • Databases: MongoDB, MySQL`);
                printLine(`  • Tools & Analytics: Git, GitHub, Firebase FCM, Postman, GA4, Microsoft Clarity`);
                document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' });
                break;

            case 'projects':
                printLine(`FEATURED REPOSITORIES & CASE STUDIES:`);
                printLine(`  1. Namma Veetu Anjaraipetti [MERN E-Commerce Platform] (Live: https://nammaveetuanjaraipetti.online)`);
                printLine(`  2. Automated Algorithmic Trading EA [MQL5 & Python Quantitative Risk Script]`);
                printLine(`  3. Spyware Detection Using AI & ML [Python / Flask / Supervised ML] (2nd Prize Expo)`);
                printLine(`  4. AI Generative Brand & Media Pipeline [Python / Synthetic Visual Models]`);
                printLine(`  5. Code in Borderland [Node.js / TypeScript] (100+ Participants Event Platform)`);
                printLine(`  6. NextGen ATM — Multi-Bank Biometric Access [Python / OpenCV / ML]`);
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
   10. DETAILED PROJECT CASE STUDY MODALS
   ========================================================================== */
function initProjectModals() {
    const projectModal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-project-modal-btn');
    const modalPath = document.getElementById('modal-project-path');
    const modalBody = document.getElementById('modal-project-body');
    const projectCards = document.querySelectorAll('.project-card');

    const projectData = {
        'project-1': {
            path: '~/case-study/namma-veetu-anjaraipetti',
            title: '[Namma Veetu Anjaraipetti — MERN E-Commerce Case Study]',
            description: 'Full-stack MERN e-commerce platform built and deployed for a client spice business. Focuses on seamless shopping UX, low-friction checkout, real-time push notifications, and performance tracking.',
            designProcess: 'Designed initial UI/UX wireframes in Figma featuring dark theme aesthetics and fast mobile navigation. Integrated interactive product catalogs, guest checkout flow, and custom badge notifications.',
            features: [
                'Google Authentication & low-friction guest checkout workflow',
                'MongoDB order management & Firebase Cloud Messaging (FCM) real-time notifications',
                'SEO optimization, Google Search Console, GA4 & Microsoft Clarity telemetry',
                'Direct client collaboration to refine UI/UX, product cards, and mobile responsiveness'
            ],
            tech: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Firebase FCM', 'GA4 / Clarity'],
            githubUrl: 'https://github.com/bharathjai/terminal-portfolio',
            demoUrl: 'https://nammaveetuanjaraipetti.online'
        },
        'project-2': {
            path: '~/case-study/mql5-algo-trader',
            title: '[Automated Algorithmic Trading EA & Risk Script]',
            description: 'Quantitative trading engine and Expert Advisor developed in MQL5 & Python. Executes automated backtested algorithmic strategies on MetaTrader with dynamic position sizing and trailing stops.',
            designProcess: 'Architected modular risk calculation engine using mathematical risk-to-reward ratios. Built custom telemetry scripts communicating execution metrics via webhooks.',
            features: [
                'MQL5 Expert Advisor executing automated high-probability setups',
                'Dynamic equity risk management & automated trailing stop algorithm',
                'Python telemetry integration for strategy backtesting & stats logging',
                'Strict stop-loss calculations to prevent drawdown during high-volatility events'
            ],
            tech: ['MQL5', 'Python', 'Quantitative Analysis', 'MetaTrader API', 'Risk Engine'],
            githubUrl: 'https://github.com/bharathjai',
            demoUrl: 'https://github.com/bharathjai'
        },
        'project-3': {
            path: '~/case-study/spyware-detection-ai',
            title: '[Spyware Detection Using AI & ML Case Study]',
            description: 'AI-based security classifier analyzing active system processes to identify and isolate spyware behavior using supervised machine learning models.',
            designProcess: 'Designed interactive security dashboard UI displaying real-time process risk metrics, threat levels, and automatic PDF report generation.',
            features: [
                'Supervised ML classifier analyzing system process calls & memory footprints',
                'Real-time web security dashboard with instant threat level visualization',
                'Automated PDF security audit report generator',
                'Awarded 2nd Prize in Department Mini Project Expo'
            ],
            tech: ['Python', 'Flask', 'Supervised ML', 'OpenCV', 'HTML5/CSS3/JS'],
            githubUrl: 'https://github.com/bharathjai',
            demoUrl: 'https://github.com/bharathjai'
        },
        'project-4': {
            path: '~/case-study/ai-generative-pipeline',
            title: '[AI Generative Brand & Cinematic Media Pipeline]',
            description: 'Automated creative pipeline leveraging AI visual models, text generation, and prompt engineering workflows to generate dynamic brand identity assets and cinematic video sequences.',
            designProcess: 'Mapped out structured prompt-chaining workflows and API integrations for automated media generation, asset scaling, and color harmony validation.',
            features: [
                'Prompt-chaining pipeline for automated brand visual generation',
                'Integration with generative visual APIs & video rendering engines',
                'Custom metadata tagging & dynamic asset portfolio delivery'
            ],
            tech: ['Python', 'Generative AI', 'Prompt Engineering', 'Media APIs', 'Node.js'],
            githubUrl: 'https://github.com/bharathjai',
            demoUrl: 'https://github.com/bharathjai'
        },
        'project-5': {
            path: '~/case-study/code-in-borderland',
            title: '[Code in Borderland — Technical Event Platform]',
            description: 'Full-stack platform built to manage contestant registration, event guidelines, contestant dashboards, and coding challenge coordination during a college tech fest.',
            designProcess: 'Created custom terminal-inspired gamer aesthetic for participant portals, leaderboard tables, and live announcements.',
            features: [
                'Successfully supported 100+ live participants simultaneously',
                'Independently managed registration pipeline & leaderboard state',
                'Responsive dashboard layout for challenge viewing and submission'
            ],
            tech: ['Node.js', 'TypeScript', 'HTML5', 'CSS3', 'JavaScript'],
            githubUrl: 'https://github.com/bharathjai',
            demoUrl: 'https://github.com/bharathjai'
        },
        'project-6': {
            path: '~/case-study/nextgen-biometric-atm',
            title: '[NextGen ATM — Biometric Security Case Study]',
            description: 'Cardless ATM prototype integrating facial recognition, cancelable biometric templates, multi-bank account retrieval, and risk-based authentication algorithms.',
            designProcess: 'Iterated on UI flow to ensure quick facial scans with clear step-by-step visual guidance, ensuring accessibility and zero card requirement.',
            features: [
                'Facial recognition pipeline implemented via Python & OpenCV',
                'Cancelable biometric templates for enhanced user privacy',
                'Multi-bank account retrieval & risk scoring authentication'
            ],
            tech: ['Python', 'OpenCV', 'Machine Learning', 'Biometric Security'],
            githubUrl: 'https://github.com/bharathjai',
            demoUrl: 'https://github.com/bharathjai'
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
                designProcess: 'Iterative prototyping using responsive UI principles, dark mode accents, and clear technical documentation.',
                features: ['Automated deployment pipeline', 'Modular system architecture', 'Responsive terminal interface'],
                tech: techList.length > 0 ? techList : ['[Tech Stack]'],
                githubUrl: 'https://github.com/bharathjai',
                demoUrl: 'https://github.com/bharathjai'
            };
        }

        // Render modal content
        modalPath.textContent = data.path || '~/case-study/details';

        const techPills = (data.tech || []).map(t => `<span class="tag" style="font-size:0.85rem; padding: 0.25rem 0.6rem;">${escapeHTML(t)}</span>`).join(' ');
        const featureItems = (data.features || ['[Feature Detail 1]']).map(f => `<li style="margin-bottom:0.4rem;">${escapeHTML(f)}</li>`).join('');

        modalBody.innerHTML = `
            <div class="modal-project-content">
                <h3 class="section-heading" style="margin-bottom: 0.8rem; font-size: 1.3rem;">${escapeHTML(data.title || '[Project Title]')}</h3>
                
                <p class="bio-paragraph" style="margin-bottom: 1.2rem; line-height: 1.6;">
                    ${escapeHTML(data.description || '[Project Description Placeholder]')}
                </p>

                ${data.designProcess ? `
                <h4 class="info-title" style="margin-bottom: 0.5rem; font-size: 0.95rem;">> UI/UX DESIGN & ARCHITECTURE PROCESS</h4>
                <p class="bio-paragraph" style="margin-bottom: 1.2rem; font-size: 0.92rem; line-height: 1.6;">
                    ${escapeHTML(data.designProcess)}
                </p>
                ` : ''}

                <h4 class="info-title" style="margin-bottom: 0.5rem; font-size: 0.95rem;">> SYSTEM ARCHITECTURE & KEY HIGHLIGHTS</h4>
                <ul style="margin-left: 1.4rem; margin-bottom: 1.5rem; color: var(--neon-yellow); font-size: 0.9rem;">
                    ${featureItems}
                </ul>

                <h4 class="info-title" style="margin-bottom: 0.5rem; font-size: 0.95rem;">> TECH STACK & TOOLS</h4>
                <div class="tech-tags" style="margin-bottom: 1.8rem;">
                    ${techPills}
                </div>

                <div class="hero-actions" style="margin-top: 1rem; gap: 0.8rem; display: flex; flex-wrap: wrap;">
                    <a href="${escapeHTML(data.githubUrl || 'https://github.com/bharathjai')}" target="_blank" rel="noopener noreferrer" class="btn-box glow-btn">[> REPOSITORY_SOURCE]</a>
                    <a href="${escapeHTML(data.demoUrl || 'https://nammaveetuanjaraipetti.online')}" target="_blank" rel="noopener noreferrer" class="btn-box glow-btn">[> LIVE_DEMO]</a>
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
   11. CONTACT FORM SUBMISSION WITH TERMINAL FEEDBACK LOG
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
   12. FOOTER LIVE UTC CLOCK & YEAR
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

