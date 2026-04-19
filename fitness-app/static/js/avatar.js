/**
 * 3D Human Avatar — parametric body that morphs based on
 * body fat %, weight, height, and circumference measurements.
 */

const Avatar = (() => {
  let scene, camera, renderer, avatarGroup, animFrame;
  let autoRotating = false;
  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let rotX = 0, rotY = 0;
  let currentFatPct = 15;
  let currentSex = 'M';

  // Body segment meshes
  let parts = {};

  function init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1117);
    scene.fog = new THREE.Fog(0x0f1117, 8, 20);

    // Camera
    camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 1.2, 4.5);
    camera.lookAt(0, 1.0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x8899cc, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(2, 5, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4f8ef7, 0.3);
    fillLight.position.set(-3, 2, -1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, -2, -4);
    scene.add(rimLight);

    // Ground
    const groundGeo = new THREE.CircleGeometry(1.5, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e2535, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid lines on ground
    const gridHelper = new THREE.GridHelper(3, 6, 0x2a3348, 0x2a3348);
    scene.add(gridHelper);

    // Build avatar group
    avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    buildAvatar();
    setupMouseControls(container);
    animate();
  }

  function buildAvatar() {
    while (avatarGroup.children.length) avatarGroup.remove(avatarGroup.children[0]);
    parts = {};

    const skin = new THREE.MeshStandardMaterial({ color: 0xc8a882, roughness: 0.7, metalness: 0.0 });
    const skinDark = new THREE.MeshStandardMaterial({ color: 0xb8956e, roughness: 0.8 });

    // HEAD
    const headGeo = new THREE.SphereGeometry(0.18, 16, 12);
    parts.head = new THREE.Mesh(headGeo, skin);
    parts.head.position.set(0, 2.28, 0);
    parts.head.castShadow = true;

    // NECK
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.10, 0.14, 10);
    parts.neck = new THREE.Mesh(neckGeo, skin);
    parts.neck.position.set(0, 2.04, 0);

    // TORSO (upper) — tapered box
    const torsoGeo = new THREE.CylinderGeometry(0.26, 0.20, 0.55, 12);
    parts.torsoUpper = new THREE.Mesh(torsoGeo, skin);
    parts.torsoUpper.position.set(0, 1.62, 0);
    parts.torsoUpper.castShadow = true;

    // TORSO (lower/abdomen)
    const abdGeo = new THREE.CylinderGeometry(0.20, 0.22, 0.45, 12);
    parts.abdomen = new THREE.Mesh(abdGeo, skin);
    parts.abdomen.position.set(0, 1.17, 0);
    parts.abdomen.castShadow = true;

    // PELVIS/HIP
    const hipGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.22, 12);
    parts.hip = new THREE.Mesh(hipGeo, skin);
    parts.hip.position.set(0, 0.87, 0);
    parts.hip.castShadow = true;

    // LEFT ARM upper
    const armUGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.38, 10);
    parts.armUL = new THREE.Mesh(armUGeo, skin);
    parts.armUL.position.set(-0.38, 1.62, 0);
    parts.armUL.rotation.z = Math.PI / 12;

    // RIGHT ARM upper
    parts.armUR = parts.armUL.clone();
    parts.armUR.position.set(0.38, 1.62, 0);
    parts.armUR.rotation.z = -Math.PI / 12;

    // LEFT ARM lower
    const armLGeo = new THREE.CylinderGeometry(0.058, 0.048, 0.34, 10);
    parts.armLL = new THREE.Mesh(armLGeo, skin);
    parts.armLL.position.set(-0.45, 1.27, 0);
    parts.armLL.rotation.z = Math.PI / 14;

    parts.armLR = parts.armLL.clone();
    parts.armLR.position.set(0.45, 1.27, 0);
    parts.armLR.rotation.z = -Math.PI / 14;

    // HANDS
    const handGeo = new THREE.SphereGeometry(0.052, 8, 8);
    parts.handL = new THREE.Mesh(handGeo, skin);
    parts.handL.position.set(-0.52, 1.05, 0);
    parts.handR = parts.handL.clone();
    parts.handR.position.set(0.52, 1.05, 0);

    // SHOULDERS (rounded)
    const shoulGeo = new THREE.SphereGeometry(0.11, 10, 8);
    parts.shoulL = new THREE.Mesh(shoulGeo, skin);
    parts.shoulL.position.set(-0.30, 1.82, 0);
    parts.shoulR = parts.shoulL.clone();
    parts.shoulR.position.set(0.30, 1.82, 0);

    // LEFT THIGH
    const thighGeo = new THREE.CylinderGeometry(0.115, 0.10, 0.46, 12);
    parts.thighL = new THREE.Mesh(thighGeo, skin);
    parts.thighL.position.set(-0.14, 0.50, 0);
    parts.thighL.castShadow = true;

    parts.thighR = parts.thighL.clone();
    parts.thighR.position.set(0.14, 0.50, 0);

    // LEFT CALF
    const calfGeo = new THREE.CylinderGeometry(0.085, 0.065, 0.42, 12);
    parts.calfL = new THREE.Mesh(calfGeo, skin);
    parts.calfL.position.set(-0.14, 0.06, 0);

    parts.calfR = parts.calfL.clone();
    parts.calfR.position.set(0.14, 0.06, 0);

    // FEET
    const footGeo = new THREE.BoxGeometry(0.10, 0.06, 0.18);
    parts.footL = new THREE.Mesh(footGeo, skinDark);
    parts.footL.position.set(-0.14, -0.16, 0.04);
    parts.footR = parts.footL.clone();
    parts.footR.position.set(0.14, -0.16, 0.04);

    for (const p of Object.values(parts)) {
      p.castShadow = true;
      avatarGroup.add(p);
    }

    avatarGroup.position.set(0, 0.16, 0);
  }

  function updateShape(params) {
    const {
      fatPct = 15, sex = 'M', weight = 70, height = 170,
      waist = 80, chest = 95, hip = 96, thigh = 55, arm = 32, calf = 37, shoulder = 110,
    } = params;

    currentFatPct = fatPct;
    currentSex = sex;

    // Normalize fat % to a 0-1 "obesity factor"
    const baseMin = sex === 'F' ? 14 : 6;
    const baseMax = sex === 'F' ? 45 : 40;
    const fatFactor = Math.max(0, Math.min(1, (fatPct - baseMin) / (baseMax - baseMin)));

    // Height scale (1.0 = 170cm)
    const hScale = Math.max(0.8, Math.min(1.2, height / 170));

    // Avatar body color based on fat%
    const color = getFatColor(fatPct, sex);
    setAllColor(color);

    // Scale from measurements or estimate from fat
    const waistR = waist > 0 ? waist / 2 / 100 : (0.39 + fatFactor * 0.22);
    const chestR = chest > 0 ? chest / 2 / 100 : (0.48 + fatFactor * 0.12);
    const hipR = hip > 0 ? hip / 2 / 100 : (0.48 + fatFactor * 0.16);
    const thighR = thigh > 0 ? thigh / 2 / 100 : (0.27 + fatFactor * 0.12);
    const armR = arm > 0 ? arm / 2 / 100 : (0.155 + fatFactor * 0.08);
    const calfR = calf > 0 ? calf / 2 / 100 : (0.185 + fatFactor * 0.07);
    const shoulR = shoulder > 0 ? shoulder / 2 / 100 : (0.55 + fatFactor * 0.06);

    // Apply scales to body parts
    if (parts.torsoUpper) {
      parts.torsoUpper.scale.set(chestR / 0.26, hScale, chestR / 0.26);
    }
    if (parts.abdomen) {
      const abdW = Math.max(chestR, waistR);
      parts.abdomen.scale.set(abdW / 0.20, hScale, abdW / 0.20);
    }
    if (parts.hip) {
      parts.hip.scale.set(hipR / 0.24, hScale, hipR / 0.24);
    }

    // Thighs
    [parts.thighL, parts.thighR].forEach(p => {
      if (p) p.scale.set(thighR / 0.115, hScale, thighR / 0.115);
    });

    // Calves
    [parts.calfL, parts.calfR].forEach(p => {
      if (p) p.scale.set(calfR / 0.085, hScale, calfR / 0.085);
    });

    // Arms
    [parts.armUL, parts.armUR].forEach(p => {
      if (p) p.scale.set(armR / 0.075, hScale, armR / 0.075);
    });
    [parts.armLL, parts.armLR].forEach(p => {
      if (p) p.scale.set(armR / 0.065 * 0.85, hScale, armR / 0.065 * 0.85);
    });

    // Shoulders
    [parts.shoulL, parts.shoulR].forEach(p => {
      if (p) p.scale.set(shoulR / 0.55 * 0.55, shoulR / 0.55, shoulR / 0.55);
    });

    // Head & neck — proportional to height only
    [parts.head, parts.neck].forEach(p => {
      if (p) p.scale.setScalar(hScale);
    });

    // Reposition parts relative to scaling
    const baseY = 0;
    if (parts.footL) { parts.footL.position.y = baseY - 0.16; parts.footR.position.y = baseY - 0.16; }
    if (parts.calfL) {
      const calfH = 0.42 * hScale;
      parts.calfL.position.y = baseY + 0.06 + (hScale - 1) * 0.05;
      parts.calfR.position.y = parts.calfL.position.y;
    }
    if (parts.thighL) {
      parts.thighL.position.y = 0.50 + (hScale - 1) * 0.2;
      parts.thighR.position.y = parts.thighL.position.y;
    }
    if (parts.hip) {
      parts.hip.position.y = 0.87 + (hScale - 1) * 0.3;
    }
    if (parts.abdomen) {
      parts.abdomen.position.y = 1.17 + (hScale - 1) * 0.3;
    }
    if (parts.torsoUpper) {
      parts.torsoUpper.position.y = 1.62 + (hScale - 1) * 0.35;
    }
    if (parts.shoulL) {
      const sy = 1.82 + (hScale - 1) * 0.35;
      parts.shoulL.position.y = sy;
      parts.shoulR.position.y = sy;
    }
    if (parts.armUL) {
      const ay = 1.62 + (hScale - 1) * 0.35;
      parts.armUL.position.y = ay; parts.armUR.position.y = ay;
    }
    if (parts.armLL) {
      const aly = 1.27 + (hScale - 1) * 0.3;
      parts.armLL.position.y = aly; parts.armLR.position.y = aly;
    }
    if (parts.handL) {
      const hy = 1.05 + (hScale - 1) * 0.2;
      parts.handL.position.y = hy; parts.handR.position.y = hy;
    }
    if (parts.neck) {
      parts.neck.position.y = 2.04 + (hScale - 1) * 0.4;
    }
    if (parts.head) {
      parts.head.position.y = 2.28 + (hScale - 1) * 0.45;
    }
  }

  function getFatColor(fatPct, sex) {
    const isM = sex === 'M';
    const lean = isM ? 8 : 16;
    const fit = isM ? 15 : 23;
    const avg = isM ? 22 : 30;

    if (fatPct < lean) return new THREE.Color(0x60a5fa);
    if (fatPct < fit) return new THREE.Color(0x4ade80);
    if (fatPct < avg) return new THREE.Color(0xfbbf24);
    return new THREE.Color(0xf87171);
  }

  function setAllColor(color) {
    for (const p of Object.values(parts)) {
      if (p.material) p.material.color.set(color);
    }
  }

  function setupMouseControls(container) {
    container.addEventListener('mousedown', e => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotY += dx * 0.008;
      rotX += dy * 0.005;
      rotX = Math.max(-0.5, Math.min(0.8, rotX));
      prevMouse = { x: e.clientX, y: e.clientY };
      if (avatarGroup) {
        avatarGroup.rotation.y = rotY;
        avatarGroup.rotation.x = rotX;
      }
    });

    // Pinch/touch
    let touchStartDist = null;
    container.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (touchStartDist) {
          camera.position.z += (touchStartDist - d) * 0.02;
          camera.position.z = Math.max(2.5, Math.min(8, camera.position.z));
        }
        touchStartDist = d;
      }
    }, { passive: true });
    container.addEventListener('touchend', () => { touchStartDist = null; });

    // Scroll zoom
    container.addEventListener('wheel', e => {
      camera.position.z += e.deltaY * 0.005;
      camera.position.z = Math.max(2.5, Math.min(8, camera.position.z));
    }, { passive: true });
  }

  function animate() {
    animFrame = requestAnimationFrame(animate);
    if (autoRotating && avatarGroup) {
      avatarGroup.rotation.y += 0.008;
    }
    renderer.render(scene, camera);
  }

  function toggleAutoRotate() {
    autoRotating = !autoRotating;
    return autoRotating;
  }

  function resetView() {
    rotX = 0; rotY = 0;
    if (avatarGroup) { avatarGroup.rotation.x = 0; avatarGroup.rotation.y = 0; }
    camera.position.set(0, 1.2, 4.5);
  }

  function resize() {
    if (!renderer) return;
    const c = renderer.domElement.parentElement;
    if (!c) return;
    const W = c.clientWidth, H = c.clientHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }

  return { init, updateShape, toggleAutoRotate, resetView, resize };
})();
