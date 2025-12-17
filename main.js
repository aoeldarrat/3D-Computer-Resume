import { scene, camera, renderer, cssRenderer, controls } from './scene.js';
import { createOffice } from './models.js';
import { setupListeners } from './listeners.js';

// Setup Objects
createOffice();

// Setup Listeners
setupListeners();

// --- Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}

animate();