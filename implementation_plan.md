# Three.js Portfolio Implementation Plan

## Goal Description
Build an interactive 3D portfolio representing a Senior Software Engineer's office. The user starts in a 3D view of a desk and computer. Clicking the computer zooms the camera to focus on the screen, transitioning to a 2D "Desktop OS" interface. This OS contains folders/icons for professional content (Projects, Apps, History, Skills), which open in window-like modals.

## User Review Required
> [!IMPORTANT]
> - **Library Choices & Justification**:
>   - **Three.js (r150+)**: The industry standard for WebGL. Chosen for its robust documentation, active community, and performance. It abstracts complex WebGL boilerplate (shaders, buffers) into manageable objects.
>   - **GSAP (GreenSock Animation Platform)**: Selected for camera and UI animations. GSAP is superior to CSS animations for complex sequences (like syncing camera movement with UI fades) because of its precise timeline control and `onComplete` callbacks.
>   - **Dat.GUI (Optional)**: For debugging lighting/camera positions during development.
>
> - **3D Assets & Primitives**:
>   - **Why Primitives?**: We will use `BoxGeometry`, `PlaneGeometry`, and `CylinderGeometry`.
>     - *Performance*: Primitives are generated mathematically at runtime, requiring 0 network requests for assets.
>     - *Aesthetic*: A "Low Poly" / "Voxel" style is timeless, professional, and clearly communicates "developer" without needing a 3D artist.
>   - **Asset Breakdown**:
>     - **Desk**: `BoxGeometry` (Tabletop + Legs).
>     - **Monitor**: `BoxGeometry` (Frame) + `PlaneGeometry` (Screen Surface - distinct mesh for easy Raycasting).
>     - **Chair**: `CylinderGeometry` (Base/Wheels) + `BoxGeometry` (Seat/Back).
>     - **Room**: `BoxGeometry` (Inverted normals) or simple `PlaneGeometry` walls.
>
> - **Camera & Interaction**:
>   - **Camera**: `THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)`.
>     - *FOV 60*: Natural human-eye field of view.
>     - *Near/Far*: Standard range to prevent clipping.
>   - **States**:
>     - **Room View**: Camera at `(x: 8, y: 6, z: 8)`, looking at `(0, 0, 0)`. Allows user to see the full setup.
>     - **Screen View**: Camera moves to `(x: 0, y: 1.5, z: 1.2)` (approx), perfectly parallel to the monitor screen.
>   - **Controls**: `OrbitControls` will be used but *heavily restricted* (min/max azimuth and polar angles) to prevent the user from clipping through walls or looking under the floor.

## Proposed Changes

### Core Structure
#### [MODIFY] [index.html](file:///Users/aoe/Projects/antigravity-01/index.html)
- `#canvas-container`: For the Three.js scene.
- `#os-interface`: Hidden by default. Contains the "Desktop" environment.
    - `.desktop-icons`: Grid of folders (Projects, Apps, etc.).
    - `.taskbar`: Bottom bar with clock, start menu (optional).
    - `.window-container`: Area where content windows spawn.

#### [NEW] [style.css](file:///Users/aoe/Projects/antigravity-01/style.css)
- **3D Overlay**: Styles to ensure the canvas is behind the UI.
- **OS Theme**: "Premium Dark Mode" OS look. Glassmorphism for windows, sleek icons (using CSS shapes or SVGs), nice typography (Inter/Roboto).
- **Animations**: Fade-ins for the UI when zooming in.

#### [MODIFY] [main.js](file:///Users/aoe/Projects/antigravity-01/main.js)
- **Scene Setup**:
    - `Scene`: Standard Three.js scene with `Color` background (soft grey/blue).
    - `Camera`: `PerspectiveCamera` initialized at "Room View" coordinates.
    - `Renderer`: `WebGLRenderer` with `antialias: true` for sharp edges on primitives.
- **Lighting**:
    - `AmbientLight`: Soft global illumination (intensity ~0.5).
    - `DirectionalLight`: Simulating a window or overhead light, casting shadows on the desk.
    - `PointLight`: Optional desk lamp glow.
- **Object Creation**:
    - Helper functions like `createDesk()`, `createMonitor()`, `createChair()` to keep code modular.
- **Interaction Logic**:
    - `Raycaster`: On 'click', cast ray from camera. If it hits `MonitorScreen` mesh -> Trigger `zoomToScreen()`.
- **Animation Loop**:
    - Standard `requestAnimationFrame`.
    - `TWEEN` or `GSAP` updates called here.

### Content Sections (OS Windows)
Each "Folder" opens a window with specific content:
1.  **Projects**: Grid of software projects.
2.  **Apps**: Tabs for iOS/Android work.
3.  **Websites**: Links/Screenshots of web work.
4.  **AI Projects**: Specific AI portfolio items.
5.  **History**: Resume/Timeline style.
6.  **Skills**: "System Specs" style visualization or simple grid.

## Verification Plan
### Automated Tests
- Verify Three.js scene renders without errors.
- Verify Raycaster detects the monitor.

### Manual Verification
- **Zoom Transition**: Ensure the camera movement is smooth and lands perfectly on the screen.
- **UI Usability**: Ensure "Windows" can be opened, closed, and are readable.
- **Responsiveness**: Check how the 3D scene crops on mobile vs desktop (might need a different camera target for mobile).
