/**
 * CampusLens: Hybrid AR/VR System
 * Automatically detects device type and loads the appropriate experience.
 */

// Device Detection
function isQuestDevice() {
    const userAgent = navigator.userAgent;
    return userAgent.includes("Oculus") || userAgent.includes("Quest") || navigator.xr !== undefined;
}

// Scene Templates
const AR_SCENE_HTML = `
    <!-- Mobile AR Scene (AR.js) -->
    <a-scene 
        embedded
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true; alpha: true; precision: medium;"
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;">
        
        <a-entity camera></a-entity>
        
        <!-- Markers will be injected here -->
        <div id="ar-marker-container"></div>
    </a-scene>
`;

const VR_SCENE_HTML = `
    <!-- Quest VR Scene (WebXR) -->
    <a-scene 
        vr-mode-ui="enabled: true"
        webxr="optionalFeatures: dom-overlay; overlayElement: #ar-hud"
        renderer="antialias: true; alpha: true;">

        <!-- Virtual Environment -->
        <a-plane rotation="-90 0 0" width="100" height="100" color="#111" material="roughness: 1"></a-plane>
        <a-grid infinite="true" material="wireframe: true; color: #00f3ff; opacity: 0.2"></a-grid>

        <!-- Camera Rig -->
        <a-entity id="rig" position="0 0 5">
            <a-entity camera look-controls wasd-controls position="0 1.6 0"></a-entity>
            <a-entity oculus-touch-controls="hand: left"></a-entity>
            <a-entity oculus-touch-controls="hand: right"></a-entity>
        </a-entity>

        <!-- Virtual Navigation Points will be injected here -->
        <div id="vr-point-container"></div>
    </a-scene>
`;

// Navigation Data
const LOCATIONS = [
    {
        id: "loc-library",
        name: "Central Library",
        dist: "45m",
        instruction: "GO STRAIGHT",
        color: "#00f3ff",
        rotation: "0 0 0", // AR Rotation
        vrPosition: "0 1 -5", // VR Position
        preset: "hiro"
    },
    {
        id: "loc-lab",
        name: "Robotics Lab",
        dist: "120m",
        instruction: "TURN RIGHT",
        color: "#ff2a2a",
        rotation: "0 -90 0", // AR Rotation
        vrPosition: "5 1 -5", // VR Position
        preset: "kanji"
    }
];

// AR Component (Mobile)
AFRAME.registerComponent('campus-marker', {
    init: function () {
        this.el.addEventListener('markerFound', () => {
            updateHUD(true, this.el.getAttribute('data-name'), this.el.getAttribute('data-dist'), this.el.getAttribute('data-instruction'));
        });
        this.el.addEventListener('markerLost', () => updateHUD(false));
    }
});

function updateHUD(active, name, dist, instruction) {
    const statusText = document.getElementById('status-text');
    const reticle = document.getElementById('scanning-reticle');
    const infoPanel = document.getElementById('info-panel');
    const locName = document.getElementById('location-name');
    const locDist = document.getElementById('location-distance');
    const navInstruction = document.getElementById('nav-instruction');

    if (active) {
        if (statusText) {
            statusText.innerText = "NAVIGATION ACTIVE";
            statusText.style.color = "var(--neon-blue)";
        }
        if (reticle) reticle.classList.add('hidden');
        if (infoPanel) {
            locName.innerText = name;
            locDist.innerText = dist;
            if (navInstruction) navInstruction.innerText = instruction;
            infoPanel.classList.remove('hidden');
        }
    } else {
        if (statusText) {
            statusText.innerText = "SCANNING...";
            statusText.style.color = "var(--neon-blue)";
        }
        if (reticle) reticle.classList.remove('hidden');
        if (infoPanel) infoPanel.classList.add('hidden');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scene-container');
    const isQuest = isQuestDevice();
    const loader = document.getElementById('loader');

    console.log("Device Detected:", isQuest ? "Quest / WebXR" : "Mobile / Desktop");

    // Inject Scene
    container.innerHTML = isQuest ? VR_SCENE_HTML : AR_SCENE_HTML;

    // Wait for DOM injection
    setTimeout(() => {
        const scene = document.querySelector('a-scene');

        if (isQuest) {
            // Setup VR Content
            setupVRContent(scene);
        } else {
            // Setup AR Content
            setupARContent(scene);
        }

        // Hide Loader
        if (scene) {
            scene.addEventListener('loaded', () => {
                if (loader) loader.classList.add('hidden');
            });
            // Fallback
            setTimeout(() => { if (loader) loader.classList.add('hidden'); }, 4000);
        }
    }, 100);
});

function setupARContent(scene) {
    LOCATIONS.forEach(loc => {
        const marker = document.createElement('a-marker');
        marker.setAttribute('preset', loc.preset);
        marker.setAttribute('campus-marker', '');
        marker.setAttribute('data-name', loc.name);
        marker.setAttribute('data-dist', loc.dist);
        marker.setAttribute('data-instruction', loc.instruction);

        // 3D Arrow
        const arrow = document.createElement('a-entity');
        arrow.setAttribute('position', '0 1 0');
        arrow.setAttribute('rotation', loc.rotation);

        // Arrow Geometry
        arrow.innerHTML = `
            <a-cylinder radius="0.1" height="1" position="0 0 0.5" rotation="90 0 0" material="color: ${loc.color}; emissive: ${loc.color}; opacity: 0.9"></a-cylinder>
            <a-cone radius-bottom="0.3" height="0.6" position="0 0 -0.4" rotation="-90 0 0" material="color: ${loc.color}; emissive: ${loc.color}; opacity: 1"></a-cone>
            <a-text value="${loc.instruction}" align="center" position="0 2 0" scale="1.5 1.5 1.5" color="${loc.color}" look-at="[camera]"></a-text>
        `;

        marker.appendChild(arrow);
        scene.appendChild(marker);
    });
}

function setupVRContent(scene) {
    // In VR mode, we simulate marker detection by placing the "markers" as fixed points in the world.

    LOCATIONS.forEach(loc => {
        const point = document.createElement('a-entity');
        point.setAttribute('position', loc.vrPosition);

        // Visuals
        point.innerHTML = `
            <a-cone position="0 0 0" color="${loc.color}" animation="property: rotation; to: 0 360 0; loop: true; dur: 3000"></a-cone>
            <a-text value="${loc.name}" position="0 1.5 0" align="center" color="${loc.color}" scale="2 2 2"></a-text>
            <a-text value="${loc.instruction}" position="0 1 0" align="center" color="white"></a-text>
            <a-ring radius-inner="0.8" radius-outer="1" rotation="-90 0 0" color="${loc.color}" animation="property: scale; to: 1.2 1.2 1.2; dir: alternate; loop: true"></a-ring>
        `;

        // Interaction (Simulate detection logic could go here, e.g. distance check)
        // For now, we just show them as fixed waypoints.

        scene.appendChild(point);
    });

    // Auto-update HUD to "Navigation Active" since we are in a virtual world
    updateHUD(true, "VIRTUAL CAMPUS", "ONLINE", "EXPLORE FREELY");
}
