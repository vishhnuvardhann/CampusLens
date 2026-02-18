# CampusLens AR Navigation

A futuristic WebVR-based Augmented Reality campus navigation interface using A-Frame and AR.js.
You access this through https://vishhnuvardhann.github.io/CampusLens/ link

## Features
- **Immersive AR**: Detects "Hiro" and "Kanji" markers to show 3D navigation arrows.
- **Futuristic HUD**: Glassmorphism UI with scanning reticles and neon aesthetics.
- **Dynamic Feedback**: Real-time status updates ("System Online", "Target Locked").

## How to Run it locally
⚠️ **Important**: WebXR/AR requires the site to be served via **HTTPS** or **localhost**.

### Option 1: VS Code Live Server (Recommended)
1.  Install the "Live Server" extension in VS Code.
2.  Right-click `index.html` and select "Open with Live Server".
3.  Open the URL on your mobile device (ensure both are on the same Wi-Fi).

### Option 2: Python Simple Server
Run this command in the project folder:
```bash
python -m http.server
```
Then access `http://localhost:8000`.

## Testing the AR
1.  Open the app on your phone.
2.  Allow camera access.
3.  Point the camera at a **Hiro Marker** or **Kanji Marker**.
    - [Download Hiro Marker](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png)
    - [Download Kanji Marker](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/kanji.png)
4.  You should see:
    - **Hiro**: Navigation to "Central Library" (Blue System).
    - **Kanji**: Navigation to "Robotics Lab" (Red System).

# CampusLens
