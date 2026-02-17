/**
 * CampusLens AR Navigation System
 * Handles AR marker detection and HUD updates.
 */

// Register custom A-Frame component for marker events
// Must be registered before the scene loads or entities are created
AFRAME.registerComponent('marker-handler', {
    init: function () {
        // Cache DOM elements for performance
        this.scanningOverlay = document.querySelector('.scanning-overlay');
        this.targetNameConfig = document.getElementById('target-name');
        this.distanceDisplay = document.getElementById('target-distance');

        this.el.addEventListener('markerFound', () => {
            console.log("Target Locked: " + this.el.id);
            this.updateHUD(true, this.el.getAttribute('data-name'), this.el.getAttribute('data-distance'));
        });

        this.el.addEventListener('markerLost', () => {
            console.log("Target Lost");
            this.updateHUD(false);
        });
    },

    updateHUD: function (found, name, distance) {
        if (found) {
            if (this.scanningOverlay) this.scanningOverlay.style.opacity = '0.2';
            if (this.targetNameConfig) {
                this.targetNameConfig.innerText = name || "UNKNOWN TARGET";
                this.targetNameConfig.style.color = "var(--neon-blue)";
            }
            if (this.distanceDisplay) this.distanceDisplay.innerText = distance || "CALCULATING...";

            document.documentElement.style.setProperty('--glass-border', 'rgba(0, 243, 255, 0.8)');
        } else {
            if (this.scanningOverlay) this.scanningOverlay.style.opacity = '1';
            if (this.targetNameConfig) {
                this.targetNameConfig.innerText = "NO MARKER DETECTED";
                this.targetNameConfig.style.color = "white";
            }
            if (this.distanceDisplay) this.distanceDisplay.innerText = "-- M";

            document.documentElement.style.setProperty('--glass-border', 'rgba(0, 243, 255, 0.3)');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("CampusLens System Online...");

    // Initialize HUD elements
    const statusText = document.querySelector('.system-status');

    // Simulate system boot sequence
    setTimeout(() => {
        if (statusText) statusText.innerHTML = '<span class="status-dot"></span> SYSTEM READY';
    }, 1500);

    // Add Markers to Scene
    const scene = document.querySelector('a-scene');

    // Define Destinations
    const destinations = [
        { id: "marker-library", preset: "hiro", name: "CENTRAL LIBRARY", distance: "45 M", color: "#00f3ff" },
        { id: "marker-lab", preset: "kanji", name: "ROBOTICS LAB", distance: "120 M", color: "#ff0055" }
    ];

    if (scene) {
        destinations.forEach(dest => {
            const marker = document.createElement('a-marker');
            marker.setAttribute('preset', dest.preset);
            marker.setAttribute('id', dest.id);
            marker.setAttribute('marker-handler', '');
            marker.setAttribute('data-name', dest.name);
            marker.setAttribute('data-distance', dest.distance);

            // Add 3D Navigation Arrow
            const arrow = document.createElement('a-entity');
            arrow.setAttribute('geometry', 'primitive: cone; radiusBottom: 0.2; radiusTop: 0; height: 1');
            arrow.setAttribute('material', `color: ${dest.color}; transparent: true; opacity: 0.8; metalness: 0.5; roughness: 0.2`);
            arrow.setAttribute('position', '0 1 0');
            arrow.setAttribute('rotation', '180 0 0'); // Point down

            // Add Animation
            arrow.setAttribute('animation', 'property: position; to: 0 1.2 0; dir: alternate; dur: 1000; loop: true; easing: easeInOutSine');
            arrow.setAttribute('animation__spin', 'property: rotation; to: 180 360 0; loop: true; dur: 5000; easing: linear');

            // Add Glow Ring
            const ring = document.createElement('a-entity');
            ring.setAttribute('geometry', 'primitive: ring; radiusInner: 0.5; radiusOuter: 0.6');
            ring.setAttribute('material', `color: ${dest.color}; shader: flat; side: double`);
            ring.setAttribute('position', '0 0.1 0');
            ring.setAttribute('rotation', '-90 0 0');

            marker.appendChild(arrow);
            marker.appendChild(ring);
            scene.appendChild(marker);
        });
    } else {
        console.error("A-Scene not found!");
    }
});
