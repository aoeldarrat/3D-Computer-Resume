# Blender to Three.js Workflow Guide

## 1. Modeling in Blender

1.  **Scene Setup**:
    *   Set your units to **Meters** (default in Blender).
    *   Keep the scale reasonable. A desk should be roughly 1.5m wide, 0.75m high.
    *   **Orientation**: Blender uses Z-up, Three.js uses Y-up. The exporter usually handles this, but keep it in mind. Front view in Blender (-Y) usually maps to Front in Three.js.

2.  **Naming Objects (Crucial)**:
    *   Name your objects clearly in the Outliner (top right panel).
    *   **Monitor Screen**: You MUST name the mesh for the screen `MonitorScreen` (case-sensitive). This is how the code will find it to attach the interactive web interface and click events.
    *   **Desk**: Name it `Desk` (optional, but good for organization).
    *   **Chair**: Name it `Chair`.

3.  **Materials**:
    *   Use **Principled BSDF** materials.
    *   Textures will be exported if they are standard image textures connected to the Principled BSDF.
    *   Avoid complex procedural nodes (Noise, Voronoi) unless you bake them into textures, as they won't export to GLTF.

4.  **Optimization**:
    *   Keep polygon count low (Low Poly).
    *   Apply modifiers (like Mirror or Array) before exporting, or check "Apply Modifiers" in the export settings.

## 2. Exporting to GLTF/GLB

1.  Select the objects you want to export (or export everything).
2.  Go to **File > Export > glTF 2.0 (.glb/.gltf)**.
3.  **Settings**:
    *   **Format**: `glTF Binary (.glb)` (Single file, easiest to manage).
    *   **Include**: Check `Selected Objects` if you only want to export what you selected.
    *   **Transform**: Check `+Y Up` (usually on by default).
    *   **Mesh**: Check `Apply Modifiers`.
4.  **Filename**: Save it as `office.glb`.
5.  **Location**: Save this file into your project's `public/models/` folder.
    *   Path: `.../antigravity-01/public/models/office.glb`

## 3. What the Code Expects

The updated code looks for a file named `office.glb` in `public/models/`.
It specifically looks for a mesh named `MonitorScreen` inside that model to use as the interactive surface.

**Troubleshooting**:
*   **Model is black?** You might need to add lights in Blender or rely on the Three.js lights (which we have set up).
*   **Model is huge/tiny?** Check your scale in Blender. Apply Scale (Ctrl+A > Scale) before exporting.
