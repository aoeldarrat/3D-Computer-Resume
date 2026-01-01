import * as THREE from 'three';
import { camera, scene, renderer, cssRenderer, state, zoomToScreen, zoomToRoom } from './scene.js';
import { objects } from './models.js';

// --- Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); // Interaction state
let isDragging = false;
let mouseDownTime = 0;
let startX = 0, startY = 0;

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Hover effect only if not dragging
    if (state.view === 'ROOM' && !state.isAnimating && !isDragging) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(objects.monitorScreen);
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    } else {
        document.body.style.cursor = 'default';
    }
}

function onMouseClick(event) {
    if (state.isAnimating) return;
    // Update mouse coordinates from the click event (in case mouse hasn't moved)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (state.view === 'ROOM') {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(objects.monitorScreen);
        if (intersects.length > 0) {
            zoomToScreen();
        }
    } else if (state.view === 'SCREEN') {
        // Click outside screen should zoom out
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(objects.monitorScreen);
        if (intersects.length === 0) {
            zoomToRoom();
        }
    }
}

// --- UI Logic ---

// Content Data
const contentData = {
    projects: {
        title: "Software Projects",
        content: `
            <h2>Featured Projects</h2>
            <div class="project-item">
                <h3>Cloud Scale Analytics</h3>
                <p>Designed a distributed analytics engine processing 1TB+ daily data using Go and Kafka.</p>
            </div>
            <div class="project-item">
                <h3>Real-time Collab Tool</h3>
                <p>Built a WebSocket-based collaboration platform with React and Node.js.</p>
            </div>
        `
    },
    apps: {
        title: "Mobile Apps",
        content: `
            <h2>iOS & Android</h2>
            <p>Published 5+ apps to App Store and Play Store.</p>
            <ul>
                <li><strong>Fitness Tracker Pro</strong> (iOS) - 50k+ downloads</li>
                <li><strong>Recipe Manager</strong> (Android) - Featured in "New & Updated"</li>
            </ul>
        `
    },
    history: {
        title: "Work History",
        content: `
            <h2>Experience</h2>
            <div class="timeline-item">
                <h3>Senior Software Engineer @ TechCorp</h3>
                <small>2020 - Present</small>
                <p>Leading the frontend infrastructure team.</p>
            </div>
            <div class="timeline-item">
                <h3>Software Engineer @ StartupInc</h3>
                <small>2017 - 2020</small>
                <p>Full stack development for a high-growth fintech startup.</p>
            </div>
            <div class="timeline-item">
                <h3>Senior Software Engineer @ TechCorp</h3>
                <small>2020 - Present</small>
                <p>Leading the frontend infrastructure team.</p>
            </div>
            <div class="timeline-item">
                <h3>Senior Software Engineer @ TechCorp</h3>
                <small>2020 - Present</small>
                <p>Leading the frontend infrastructure team.</p>
            </div>
            <div class="timeline-item">
                <h3>Senior Software Engineer @ TechCorp</h3>
                <small>2020 - Present</small>
                <p>Leading the frontend infrastructure team.</p>
            </div>
            <div class="timeline-item">
                <h3>Senior Software Engineer @ TechCorp</h3>
                <small>2020 - Present</small>
                <p>Leading the frontend infrastructure team.</p>
            </div>
            <div class="timeline-item">
                <h3>Senior Software Engineer @ TechCorp</h3>
                <small>2020 - Present</small>
                <p>Leading the frontend infrastructure team.</p>
            </div>
            <div class="timeline-item">
                <h3>Senior Software Engineer @ TechCorp</h3>
                <small>2020 - Present</small>
                <p>Leading the frontend infrastructure team.</p>
            </div>
        `
    },
    skills: {
        title: "System Specs (Skills)",
        content: `
            <h2>Technical Stack</h2>
            <div class="skills-grid">
                <span class="tag">JavaScript/TypeScript</span>
                <span class="tag">React/Next.js</span>
                <span class="tag">Node.js</span>
                <span class="tag">Go</span>
                <span class="tag">Python</span>
                <span class="tag">AWS/GCP</span>
                <span class="tag">Docker/K8s</span>
                <span class="tag">Three.js</span>
            </div>
        `
    }
};

let activeWindow = null;

function openWindow(key) {
    if (activeWindow) closeWindow(activeWindow);

    const data = contentData[key];
    const win = document.createElement('div');
    win.className = 'os-window';
    win.innerHTML = `
        <div class="window-header">
            <div class="window-title">${data.title}</div>
            <div class="window-controls">
                <div class="control-btn min-btn"></div>
                <div class="control-btn max-btn"></div>
                <div class="control-btn close-btn"></div>
            </div>
        </div>
        <div class="window-content">
            ${data.content}
        </div>
    `;

    win.querySelector('.close-btn').addEventListener('click', () => closeWindow(win));

    const windowContainer = document.querySelector('.window-container');
    if (windowContainer) {
        windowContainer.appendChild(win);
    }

    // Animate in
    requestAnimationFrame(() => win.classList.add('active'));
    activeWindow = win;
}

function closeWindow(win) {
    win.classList.remove('active');
    setTimeout(() => win.remove(), 300);
    activeWindow = null;
}

export function initOS() {
    const desktopIconsContainer = document.querySelector('.desktop-icons');
    if (!desktopIconsContainer) return;

    // Clear existing icons to prevent duplicates on re-navigation
    desktopIconsContainer.innerHTML = '';

    // Generate Icons
    Object.keys(contentData).forEach(key => {
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.innerHTML = `
            <div class="icon-img"></div>
            <div class="icon-label">${contentData[key].title}</div>
        `;
        icon.addEventListener('click', () => openWindow(key));
        desktopIconsContainer.appendChild(icon);
    });

    // Start Button (Exit)
    document.querySelector('.start-button').addEventListener('click', () => {
        // Simple menu or just exit for now
        zoomToRoom();
    });
}

export function setupListeners() {
    window.addEventListener('mousedown', (e) => {
        isDragging = false;
        mouseDownTime = Date.now();
        startX = e.clientX;
        startY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.hypot(dx, dy) > 5) { // threshold 5px
            isDragging = true;
        }
        onMouseMove(e);
    });

    window.addEventListener('mouseup', (e) => {
        if (Date.now() - mouseDownTime < 200 && !isDragging) {
            onMouseClick(e);
        }
        isDragging = false;
    });

    // Also keep a simple click listener for safety (won't fire during drag)
    window.addEventListener('click', (e) => {
        if (!isDragging) onMouseClick(e);
    });

    // --- Resize ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Initialize OS UI

    // Expose exit function to global scope for UI buttons
    window.exitScreen = zoomToRoom;
}
