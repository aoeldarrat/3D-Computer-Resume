# Interactive 3D Portfolio

An interactive 3D office scene and a desktop OS interface that displays a resume. The user can scroll to view the room, tapping the screen will zoom the user to the Desktop and display a set of folders to go through. An interesting take on a resume/profile website. This site is inspired by a another website i visited years ago that ive long forgotten the name of. It had fully coded games, a bunch programs, and an almost fully operational OS, office scene was really immersive, with a nice sound track to go with it. Anyway, this project is just a little hobby project that im using as a way to re-learn JS and website making.

### Early demo
<video src="https://github.com/user-attachments/assets/6497a734-e797-4c06-8fd1-7582357b05d6" controls></video>

### Scroll
<video src="https://github.com/user-attachments/assets/933be5b3-db78-45fe-af26-24812e7c64f4" controls></video>

## Tech
- **Three.js**: 3D rendering and scene management.
- **GSAP**: Animations (Camera transitions, UI fades).
- **Vite**: Build tool and dev server.

## Future development
|     Feature    | Implemented (✅/❌)  |
| -------------- | ------------------- |
| Add soundtrack - office, cafe, library, etc | ❌                  |
| Replace CSS 3d models with blender models using GLTF | ❌|
| Expand on OS UI and functionality| ❌ |
| Spruce up the place a bit | ❌ |
| Host on live site | ❌ |
| Add something living for goodness sake | ❌ |
| Background for more immersion | ❌ |
| Fix folder close, expand, and minmize functions | ❌ |
| Host on live site | ❌ |

## How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npx vite
   ```
3. Open the URL shown in the terminal (usually `http://localhost:5173`).

## Features
- **3D Office**: Interactive desk environment.
- **Zoom Interaction**: Click the monitor to enter "Work Mode".
- **OS Interface**: Functional desktop with draggable windows (simulated).
- **Content**: Projects, Apps, History, and Skills sections - WIP (Will change the sections displayed).
