import { scene, camera, renderer, cssRenderer, controls, attachToDOM } from './scene.js';
import { createOffice } from './models.js';
import { setupListeners } from './listeners.js';

let initialized = false;
let animationId = null;

export function init3DScene() {
    // Only set up the office and listeners once
    if (!initialized) {
        createOffice();
        setupListeners();
        initialized = true;
    }

    // Always re-attach to the DOM (since the container is recreated on navigation)
    attachToDOM();

    // Start loop if not running
    if (!animationId) {
        animate();
    }
}

export function stop3DScene() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// --- Loop ---
function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}