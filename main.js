import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import gsap from 'gsap';

// --- Configuration ---
const CONFIG = {
    camera: {
        // Close room view so monitor takes ~70% of viewport
        room: { position: { x: 0, y: 6, z: 4 }, lookAt: { x: 0, y: 2.5, z: -0.5 } },
        // Zoomed view: horizontal view, distance ~1.24 units (Z=0.8 to -0.44) to fit screen height
        screen: { position: { x: 0, y: 2.3, z: 0.6 }, lookAt: { x: 0, y: 2.5, z: -0.44 } }
    },
    colors: {
        background: 0x1a1a2e,
        desk: 0x8d6e63,
        monitorFrame: 0x212121,
        monitorScreen: 0x000000, // Deep black for contrast
        chair: 0x424242,
        floor: 0xeeeeee
    }
};

// --- State ---
const state = {
    view: 'ROOM', // 'ROOM' or 'SCREEN'
    isAnimating: false
};

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.colors.background);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(CONFIG.camera.room.position.x, CONFIG.camera.room.position.y, CONFIG.camera.room.position.z);
camera.lookAt(CONFIG.camera.room.lookAt.x, CONFIG.camera.room.lookAt.y, CONFIG.camera.room.lookAt.z);

// WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.zIndex = '1'; // Behind CSS3D
document.getElementById('canvas-container').appendChild(renderer.domElement);

// CSS3D Renderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.zIndex = '2'; // On top of WebGL to allow interaction
// Allow pointer events so OrbitControls can work
cssRenderer.domElement.style.pointerEvents = 'auto';
document.getElementById('canvas-container').appendChild(cssRenderer.domElement);

const controls = new OrbitControls(camera, cssRenderer.domElement); // Attach to body to catch all events
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2; // Don't go below floor
controls.minDistance = 2;
controls.maxDistance = 15;
controls.enableRotate = true; // Explicitly enable rotation
controls.enablePan = false; // Disable panning to keep focus on desk
// Set initial target to match room config
controls.target.set(CONFIG.camera.room.lookAt.x, CONFIG.camera.room.lookAt.y, CONFIG.camera.room.lookAt.z);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// --- Objects ---
const objects = {
    monitorScreen: null // Reference for raycasting
};

function createOffice() {
    // Floor (smaller for focused view)
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.floor });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Desk (smaller, more focused)
    const deskGroup = new THREE.Group();
    const topGeo = new THREE.BoxGeometry(3, 0.15, 1.5);
    const topMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.desk });
    const deskTop = new THREE.Mesh(topGeo, topMat);
    deskTop.position.y = 1.5;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    // Legs (adjusted for smaller desk)
    const legGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const positions = [
        { x: -1.4, z: -0.65 }, { x: 1.4, z: -0.65 },
        { x: -1.4, z: 0.65 }, { x: 1.4, z: 0.65 }
    ];
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(pos.x, 0.75, pos.z);
        leg.castShadow = true;
        deskGroup.add(leg);
    });
    scene.add(deskGroup);

    // Monitor
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0, 1.5 + 0.1, -0.5); // On desk

    // Stand
    const standGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    const standMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.monitorFrame });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = 0.25;
    monitorGroup.add(stand);

    // Screen Frame
    const frameGeo = new THREE.BoxGeometry(2.2, 1.3, 0.1);
    const frame = new THREE.Mesh(frameGeo, standMat);
    frame.position.y = 0.9;
    monitorGroup.add(frame);

    // Screen Surface (The clickable part - kept for raycasting/occlusion)
    // Increased size to cover full monitor face for easier clicking
    const screenGeo = new THREE.PlaneGeometry(2, 1);
    const screenMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0, // Invisible, just for raycasting or backing
        transparent: true,
        blending: THREE.NoBlending // Helps with CSS3D occlusion sometimes
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.9, 0.05); // Slightly in front of frame
    objects.monitorScreen = screen; // Save reference
    monitorGroup.add(screen);

    // CSS3D Object (The OS Interface)
    const osElement = document.getElementById('os-interface');
    // Ensure it's visible for the renderer
    osElement.style.display = 'block';
    // Re-enable pointer events for the UI elements specifically
    osElement.style.pointerEvents = 'auto';

    const cssObject = new CSS3DObject(osElement);
    // Scale DOM pixels to 3D units
    // Screen is 2 units wide. DOM is 1000px wide. Scale = 2 / 1000 = 0.002
    cssObject.scale.set(0.002, 0.002, 0.002);
    cssObject.position.set(0, 0.9, 0.06); // Just in front of the screen mesh
    monitorGroup.add(cssObject);

    scene.add(monitorGroup);

    // Chair (Simple representation)
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, 1.5);

    const seatGeo = new THREE.BoxGeometry(1, 0.1, 1);
    const seatMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.chair });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 1;
    chairGroup.add(seat);

    const backGeo = new THREE.BoxGeometry(1, 1, 0.1);
    const back = new THREE.Mesh(backGeo, seatMat);
    back.position.set(0, 1.5, 0.45);
    chairGroup.add(back);

    const baseGeo = new THREE.CylinderGeometry(0.3, 0.3, 1);
    const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    base.position.y = 0.5;
    chairGroup.add(base);

    scene.add(chairGroup);

    // Plant in the corner
    const plantGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6);
    const plant = new THREE.Mesh(plantGeo, new THREE.MeshStandardMaterial({ color: 0x3a453a }));
    // Place plant all the way in teh corner
    plant.position.x = 4;
    plant.position.y = 0.5;
    plant.position.z = -4;
    scene.add(plant)
}

createOffice();

// --- Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); // Interaction state
let isDragging = false;
let mouseDownTime = 0;
let startX = 0, startY = 0;

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

function zoomToScreen() {
    state.isAnimating = true;
    // We keep controls enabled but stop user interaction? 
    // Actually, best to animate the controls.target so the camera follows
    controls.enabled = false;

    // Animate Camera Position
    gsap.to(camera.position, {
        x: CONFIG.camera.screen.position.x,
        y: CONFIG.camera.screen.position.y,
        z: CONFIG.camera.screen.position.z,
        duration: 1.2,
        ease: "power2.inOut"
    });

    // Animate Controls Target (Where we are looking)
    gsap.to(controls.target, {
        x: CONFIG.camera.screen.lookAt.x,
        y: CONFIG.camera.screen.lookAt.y,
        z: CONFIG.camera.screen.lookAt.z,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
            // Keep looking at screen center during transition
            // camera.lookAt(CONFIG.camera.screen.lookAt.x, CONFIG.camera.screen.lookAt.y, CONFIG.camera.screen.lookAt.z);
        },
        onComplete: () => {
            state.view = 'SCREEN';
            state.isAnimating = false;
            // No need to showOS(), it's always there in 3D
        }
    });
}

function zoomToRoom() {
    state.isAnimating = true;
    // No need to hideOS()

    gsap.to(camera.position, {
        x: CONFIG.camera.room.position.x,
        y: CONFIG.camera.room.position.y,
        z: CONFIG.camera.room.position.z,
        duration: 1.2,
        ease: "power2.inOut"
    });

    // Animate Controls Target
    gsap.to(controls.target, {
        x: CONFIG.camera.room.lookAt.x,
        y: CONFIG.camera.room.lookAt.y,
        z: CONFIG.camera.room.lookAt.z,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
            state.view = 'ROOM';
            state.isAnimating = false;
            controls.enabled = true;
        }
    });
}

// --- UI Logic ---
const osInterface = document.getElementById('os-interface');
const desktopIconsContainer = document.querySelector('.desktop-icons');
const windowContainer = document.querySelector('.window-container');

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

function initOS() {
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
    windowContainer.appendChild(win);

    // Animate in
    requestAnimationFrame(() => win.classList.add('active'));
    activeWindow = win;
}

function closeWindow(win) {
    win.classList.remove('active');
    setTimeout(() => win.remove(), 300);
    activeWindow = null;
}

initOS();

// Expose exit function to global scope for UI buttons
window.exitScreen = zoomToRoom;

// --- Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}

animate();