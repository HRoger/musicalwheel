# MusicalWheel Architecture

This document describes the architecture of the MusicalWheel project, a WordPress-based music industry directory platform built as an FSE child theme extending the Voxel parent theme.

## 🏗️ Core Philosophy: "All-in Child Theme"

The project adheres to a "All-in Child Theme" strategy where all custom functionality is consolidated within the `themes/voxel-fse/` directory. This avoids the fragmentation of separate plugins and aligns with the Voxel parent theme's architecture.

## 📂 Project Structure

- `themes/voxel-fse/`: The main workspace containing all project-specific code.
    - `app/controllers/`: Contains OOP controllers for handling backend logic and REST API endpoints.
    - `app/blocks/`: Contains Gutenberg block definitions and logic.
    - `app/dynamic-data/`: Custom VoxelScript parser and data handling.
    - `app/modules/`: Specialized feature modules (e.g., courses, timeline extensions).
    - `assets/`: Compiled CSS and JS assets.

## 🛠️ Key Architectural Patterns

### 1. OOP Controller Pattern
Custom logic is organized into controllers that extend `FSE_Base_Controller`. This provides a structured way to register hooks, handle permissions, and provide data to the frontend.

### 2. Autoloader Conflict Avoidance
To prevent conflicts with the Voxel parent theme (which uses `locate_template()`), the child theme uses:
- `fse-` prefixes for filenames and classes.
- Distinct namespaces (`VoxelFSE\`).
- Custom paths for controllers and templates.

### 3. FSE & Gutenberg Integration
The project heavily uses Full Site Editing components. Gutenberg blocks are developed using React and TypeScript, built with Vite, and enqueued via `Block_Loader.php`.

### 4. API Layer (FSE Controllers)
Since Voxel's native AJAX system is geared towards HTML responses, MusicalWheel implements a REST API layer (`/wp-json/voxel-fse/v1/`) for:
- Returning JSON data to React components.
- Handling server-side configuration gathering.
- Generating nonces for secure interactions.

## 💉 Tech Stack

- **Framework:** WordPress (Full Site Editing)
- **Parent Theme:** Voxel
- **Backend:** PHP (OOP)
- **Frontend:** React, TypeScript, Vanilla CSS/SCSS
- **Build System:** Vite
- **Database:** MySQL
