/**
 * CampusLens: AR Navigation System
 * Handles AR marker detection, directional logic, and HUD updates.
 */

// Register custom A-Frame component
AFRAME.registerComponent('campus-marker', {
    init: function () {
        // Cache UI elements
        this.statusText = document.getElementById('status-text');
        this.reticle = document.getElementById('scanning-reticle');
        this.infoPanel = document.getElementById('info-panel');
        this.locName = document.getElementById('location-name');
        this.locDist = document.getElementById('location-distance');
        this.navInstruction = document.getElementById('nav-instruction');

        // Bind events
        this.el.addEventListener('markerFound', () => {
            const name = this.el.getAttribute('data-name');
            const dist = this.el.getAttribute('data-dist');
            const instruction = this.el.getAttribute('data-instruction');

            console.log(`Target Locked: ${name}`);
            this.onMarkerFound(name, dist, instruction);
        });

        this.el.addEventListener('markerLost', () => {
            console.log("Target Lost");
            this.onMarkerLost();
        });
    },

    onMarkerFound: function (name, dist, instruction) {
        // Update Status
        if (this.statusText) {
            this.statusText.innerText = "NAVIGATION ACTIVE // FOLLOWING PATH";
            this.statusText.style.color = "var(--neon-blue)";
        }

        // Hide Scanning Reticle
        if (this.reticle) this.reticle.classList.add('hidden');

        // Show Info Panel
        if (this.infoPanel) {
            this.locName.innerText = name;
            this.locDist.innerText = dist;
            if (this.navInstruction) this.navInstruction.innerText = instruction;
            this.infoPanel.classList.remove('hidden');
        }
    },

    onMarkerLost: function () {
        // Update Status
        if (this.statusText) {
            this.statusText.innerText = "SYSTEM ONLINE // SCANNING...";
            this.statusText.style.color = "var(--neon-blue)";
        }

        // Show Scanning Reticle
        if (this.reticle) this.reticle.classList.remove('hidden');

        // Hide Info Panel
        if (this.infoPanel) this.infoPanel.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("CampusLens Navigation Initialized");

    // Loading Handler
    const loader = document.getElementById('loader');
    const scene = document.querySelector('a-scene');

    function hideLoader() {
        if (loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            console.log("System Initialized");
        }
    }

    // Force hide loader after 3 seconds (Fallback for Quest)
    // Quest browser sometimes doesn't fire 'loaded' event reliably for AR.js
    setTimeout(hideLoader, 3000);

    // Also listen for scene loaded
    if (scene) {
        scene.addEventListener('loaded', hideLoader);
    }

    // Define Targets with Navigation Logic
    // Rotation: x y z (Forward=0 0 0, Right=0 -90 0, Left=0 90 0, Back=0 180 0)
    // Note: A-Frame rotations are in degrees. 
    const targets = [
        {
            id: "target-library",
            preset: "hiro",
            name: "Central Library",
            dist: "45m",
            color: "#00f3ff",
            instruction: "GO STRAIGHT",
            rotation: "0 0 0"
        },
        {
            id: "target-lab",
            preset: "kanji",
            name: "Robotics Lab",
            dist: "120m",
            color: "#ff2a2a",
            instruction: "TURN RIGHT",
            rotation: "0 -90 0"
        }
    ];

    if (scene) {
        targets.forEach(t => {
            // Create Marker
            const marker = document.createElement('a-marker');
            marker.setAttribute('preset', t.preset);
            marker.setAttribute('id', t.id);
            marker.setAttribute('campus-marker', '');
            marker.setAttribute('data-name', t.name);
            marker.setAttribute('data-dist', t.dist);
            marker.setAttribute('data-instruction', t.instruction);

            // Container for 3D Elements
            const navContainer = document.createElement('a-entity');

            // 1. Directional Arrow (Cone + Cylinder)
            const arrowGroup = document.createElement('a-entity');
            arrowGroup.setAttribute('position', '0 1 0');
            arrowGroup.setAttribute('rotation', t.rotation); // Apply navigation direction

            // Arrow Shaft
            const shaft = document.createElement('a-cylinder');
            shaft.setAttribute('radius', '0.1');
            shaft.setAttribute('height', '1');
            shaft.setAttribute('position', '0 0 0.5'); // Offset to align with head
            shaft.setAttribute('rotation', '90 0 0'); // Lay flat
            shaft.setAttribute('material', `color: ${t.color}; emissive: ${t.color}; emissiveIntensity: 0.6; opacity: 0.9`);

            // Arrow Head
            const head = document.createElement('a-cone');
            head.setAttribute('radius-bottom', '0.3');
            head.setAttribute('radius-top', '0');
            head.setAttribute('height', '0.6');
            head.setAttribute('position', '0 0 -0.4'); // Tip forward
            head.setAttribute('rotation', '-90 0 0'); // Point forward
            head.setAttribute('material', `color: ${t.color}; emissive: ${t.color}; emissiveIntensity: 0.8; opacity: 1`);

            arrowGroup.appendChild(shaft);
            arrowGroup.appendChild(head);

            // Animate entire arrow group (Float up/down)
            arrowGroup.setAttribute('animation', 'property: position; to: 0 1.2 0; dir: alternate; dur: 1500; easing: easeInOutSine; loop: true');

            // 2. Floating Instruction Text
            const textLabel = document.createElement('a-text');
            textLabel.setAttribute('value', t.instruction);
            textLabel.setAttribute('align', 'center');
            textLabel.setAttribute('position', '0 2 0'); // Above arrow
            textLabel.setAttribute('scale', '1.5 1.5 1.5');
            textLabel.setAttribute('color', t.color);
            textLabel.setAttribute('look-at', '[camera]'); // Always face user

            // 3. Ground Pulse Ring
            const ring = document.createElement('a-ring');
            ring.setAttribute('radius-inner', '0.8');
            ring.setAttribute('radius-outer', '0.9');
            ring.setAttribute('material', `color: ${t.color}; shader: flat; side: double; opacity: 0.5`);
            ring.setAttribute('rotation', '-90 0 0');
            ring.setAttribute('animation', 'property: scale; to: 1.5 1.5 1.5; dir: alternate; dur: 1000; easing: easeInOutSine; loop: true');
            ring.setAttribute('animation__fade', 'property: material.opacity; to: 0; dir: alternate; dur: 1000; easing: easeInOutSine; loop: true');

            // Assemble
            navContainer.appendChild(arrowGroup);
            navContainer.appendChild(textLabel);
            navContainer.appendChild(ring);

            marker.appendChild(navContainer);
            scene.appendChild(marker);
        });
    }
});
