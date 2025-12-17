import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import gsap from 'gsap';

// --- Configuration ---
export const CONFIG = {
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
export const state = {
    view: 'ROOM', // 'ROOM' or 'SCREEN'
    isAnimating: false
};

// --- Scene Setup ---
export const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.colors.background);

export const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(CONFIG.camera.room.position.x, CONFIG.camera.room.position.y, CONFIG.camera.room.position.z);
camera.lookAt(CONFIG.camera.room.lookAt.x, CONFIG.camera.room.lookAt.y, CONFIG.camera.room.lookAt.z);

// WebGL Renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.zIndex = '1'; // Behind CSS3D
document.getElementById('canvas-container').appendChild(renderer.domElement);

// CSS3D Renderer
export const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.zIndex = '2'; // On top of WebGL to allow interaction
// Allow pointer events so OrbitControls can work
cssRenderer.domElement.style.pointerEvents = 'auto';
document.getElementById('canvas-container').appendChild(cssRenderer.domElement);

export const controls = new OrbitControls(camera, cssRenderer.domElement); // Attach to body to catch all events
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

// --- Zoom Functions ---
export function zoomToScreen() {
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

export function zoomToRoom() {
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