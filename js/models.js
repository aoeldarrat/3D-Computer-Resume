import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene, CONFIG } from './scene';

export const objects = {
    monitorScreen: null // Reference for raycasting
};

export function createOffice() {
    const loader = new GLTFLoader();

    // Floor (smaller for focused view)
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.floor });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    /* 
    // --- BLENDER REPLACEMENT: FLOOR ---
    loader.load('/models/floor.glb', (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = true;
            }
        });
        scene.add(model);
    });
    */

    // Desk (smaller, more focused)
    // const deskGroup = new THREE.Group();
    // const topGeo = new THREE.BoxGeometry(3, 0.15, 1.5);
    // const topMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.desk });
    // const deskTop = new THREE.Mesh(topGeo, topMat);
    // deskTop.position.y = 1.5;
    // deskTop.castShadow = true;
    // deskTop.receiveShadow = true;
    // deskGroup.add(deskTop);

    // // Legs (adjusted for smaller desk)
    // const legGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    // const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    // const positions = [
    //     { x: -1.4, z: -0.65 }, { x: 1.4, z: -0.65 },
    //     { x: -1.4, z: 0.65 }, { x: 1.4, z: 0.65 }
    // ];
    // positions.forEach(pos => {
    //     const leg = new THREE.Mesh(legGeo, legMat);
    //     leg.position.set(pos.x, 0.75, pos.z);
    //     leg.castShadow = true;
    //     deskGroup.add(leg);
    // });
    // scene.add(deskGroup);

    // --- BLENDER DESK ---
    loader.load('/assets/antique_desk.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.addScalar(1)
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(model);
    });

    // Screen group - clickable part
    const screenGroup = new THREE.Group();
    screenGroup.position.set(-0.25, 1.6, -0.4);

    // // Stand
    // const standGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    // const standMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.monitorFrame });
    // const stand = new THREE.Mesh(standGeo, standMat);
    // stand.position.y = 0.25;
    // monitorGroup.add(stand);

    // // Screen Frame
    // const frameGeo = new THREE.BoxGeometry(2.2, 1.3, 0.1);
    // const frame = new THREE.Mesh(frameGeo, standMat);
    // frame.position.y = 0.9;
    // monitorGroup.add(frame);

    // // Back frame (to cover the view from behind)
    // const backFrameGeo = new THREE.BoxGeometry(2.2, 1.3, 0.1)
    // const backFrame = new THREE.Mesh(backFrameGeo, standMat) // use same material as stand
    // backFrame.position.y = 0.9;
    // backFrame.position.z = -0.1;
    // monitorGroup.add(backFrame);


    // Screen Surface (The clickable part - kept for raycasting/occlusion)
    // Increased size to cover full monitor face for easier clicking
    const screenGeo = new THREE.PlaneGeometry(1.7, 1);
    const screenMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0, // Invisible, just for raycasting or backing
        transparent: true,
        blending: THREE.NoBlending // Helps with CSS3D occlusion sometimes
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.9, 0.05); // Slightly in front of frame
    objects.monitorScreen = screen; // Save reference
    screenGroup.add(screen);

    // CSS3D Object (The OS Interface)
    const osElement = document.getElementById('os-interface');
    // Ensure it's visible for the renderer
    osElement.style.display = 'block';
    // Re-enable pointer events for the UI elements specifically
    osElement.style.pointerEvents = 'auto';

    const cssObject = new CSS3DObject(osElement);
    // Scale DOM pixels to 3D units
    // Screen is 2 units wide. DOM is 1000px wide. Scale = 2 / 1000 = 0.002
    cssObject.scale.set(0.0018, 0.0018, 0.0018);
    cssObject.position.set(0, 0.9, 0.06); // Just in front of the screen mesh
    screenGroup.add(cssObject);

    scene.add(screenGroup);

    // --- BLENDER MONITOR ---
    // Note: You still need the CSS3DObject and the invisible raycast plane (screen).
    // You can either create them manually like above, or find a placeholder mesh in your Blender model.
    loader.load('/assets/desktop2.glb', (gltf) => {
        const computerModel = gltf.scene;
        computerModel.position.set(0, 1.75, 0.8);
        computerModel.scale.addScalar(0.2);
        scene.add(computerModel);

        // If not using a placeholder in Blender, just add the CSS object manually relative to the model
        // scene.add(cssObject); 
        // cssObject.position.set(...)
    });

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

    /*
    // --- BLENDER REPLACEMENT: CHAIR ---
    loader.load('/models/chair.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 1.5);
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(model);
    });
    */

    // Plant in the corner
    const plantGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6);
    const plant = new THREE.Mesh(plantGeo, new THREE.MeshStandardMaterial({ color: 0x3a453a }));
    // Place plant all the way in teh corner
    plant.position.x = 4;
    plant.position.y = 0.5;
    plant.position.z = -4;
    scene.add(plant)

    /*
    // --- BLENDER REPLACEMENT: PLANT ---
    loader.load('/models/plant.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(4, 0, -4);
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(model);
    });
    */
}
