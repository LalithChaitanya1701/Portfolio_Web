/**
 * Interactive 3D Rotatable Glass Cuboid with Chromatic Dispersion
 * Built with Three.js r169
 * Loads GLTF rounded cube (or RoundedBoxGeometry fallback)
 * Refracts offscreen background headline with 6-band chromatic dispersion
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const MODEL_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260929_212926_92423081-b0e4-4f5a-b650-14af6c05c058.glb';

export function initCyberCube(containerEl) {
  if (!containerEl) return null;

  const canvas = containerEl.querySelector('#scene');
  if (!canvas) return null;

  const loaderEl = containerEl.querySelector('#loader');
  const btnPrev = containerEl.querySelector('#prev');
  const btnNext = containerEl.querySelector('#next');
  const dots = containerEl.querySelectorAll('.dot');

  let destroyed = false;
  let animId = null;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false
  });
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Main Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  // Background Scene with Fullscreen Quad
  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // 4a. Offscreen Headline Canvas & Texture
  const textCanvas = document.createElement('canvas');
  const textCtx = textCanvas.getContext('2d');
  const textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.colorSpace = THREE.SRGBColorSpace;
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  textTexture.generateMipmaps = false;

  const bgQuadGeo = new THREE.PlaneGeometry(2, 2);
  const bgQuadMat = new THREE.ShaderMaterial({
    uniforms: {
      uTex: { value: textTexture }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(uTex, vUv);
        #include <colorspace_fragment>
      }
    `,
    depthTest: false,
    depthWrite: false
  });
  bgQuadMat.frustumCulled = false;
  const bgQuad = new THREE.Mesh(bgQuadGeo, bgQuadMat);
  bgScene.add(bgQuad);

  // 4e. Render Targets for Two-Pass Dispersion
  let rtBack = null;
  let rtFront = null;

  // Scene Graph
  const pivot = new THREE.Group();
  const spinner = new THREE.Group();
  scene.add(pivot);
  pivot.add(spinner);

  spinner.rotation.set(-0.42, 0.62, 0.18, 'XYZ');

  // 4d. Glass Material Shaders
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vEye;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec4 mvPos = viewMatrix * worldPos;
      gl_Position = projectionMatrix * mvPos;
      vNormal = normalize(normalMatrix * normal);
      vEye = normalize(mvPos.xyz);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uIorR;
    uniform float uIorY;
    uniform float uIorG;
    uniform float uIorC;
    uniform float uIorB;
    uniform float uIorP;
    uniform float uRefractPower;
    uniform float uChromatic;
    uniform float uSaturation;
    uniform float uShininess;
    uniform float uDiffuseness;
    uniform float uFresnelPower;
    uniform vec3 uLight;
    uniform float uBackside;

    varying vec3 vNormal;
    varying vec3 vEye;

    float specular(vec3 lightDir, float shininess, float diffuseness, vec3 n, vec3 eye) {
      vec3 lightVec = normalize(-lightDir);
      vec3 halfVec = normalize(lightVec - eye);
      return pow(max(dot(n, halfVec), 0.0), shininess) + max(0.0, dot(n, lightVec)) * diffuseness;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      vec3 n = normalize(vNormal);
      if (uBackside > 0.5) n = -n;
      vec3 eye = normalize(vEye);

      vec3 color = vec3(0.0);
      const int LOOP = 16;
      for (int i = 0; i < LOOP; i++) {
        float slide = float(i) / float(LOOP) * 0.045;

        vec3 refrR = refract(eye, n, 1.0 / uIorR);
        vec3 refrY = refract(eye, n, 1.0 / uIorY);
        vec3 refrG = refract(eye, n, 1.0 / uIorG);
        vec3 refrC = refract(eye, n, 1.0 / uIorC);
        vec3 refrB = refract(eye, n, 1.0 / uIorB);
        vec3 refrP = refract(eye, n, 1.0 / uIorP);

        vec4 tR = texture2D(uTexture, uv + refrR.xy * (uRefractPower + slide * 1.0) * uChromatic);
        vec4 tY = texture2D(uTexture, uv + refrY.xy * (uRefractPower + slide * 1.0) * uChromatic);
        vec4 tG = texture2D(uTexture, uv + refrG.xy * (uRefractPower + slide * 2.0) * uChromatic);
        vec4 tC = texture2D(uTexture, uv + refrC.xy * (uRefractPower + slide * 2.5) * uChromatic);
        vec4 tB = texture2D(uTexture, uv + refrB.xy * (uRefractPower + slide * 3.0) * uChromatic);
        vec4 tP = texture2D(uTexture, uv + refrP.xy * (uRefractPower + slide * 1.0) * uChromatic);

        float r = tR.r * 0.5;
        float y = (tY.r * 2.0 + tY.g * 2.0 - tY.b) / 6.0;
        float g = tG.g * 0.5;
        float c = (tC.g * 2.0 + tC.b * 2.0 - tC.r) / 6.0;
        float b = tB.b * 0.5;
        float p = (tP.b * 2.0 + tP.r * 2.0 - tP.g) / 6.0;

        float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
        float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
        float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

        color += vec3(R, G, B);
      }

      color /= float(LOOP);

      // Saturation
      float luma = dot(color, vec3(0.2125, 0.7154, 0.0721));
      color = mix(vec3(luma), color, uSaturation);

      // Specular Blinn-Phong
      float spec = specular(uLight, uShininess, uDiffuseness, n, eye) +
                   0.6 * specular(vec3(1.0, 1.0, -1.0), uShininess * 0.6, uDiffuseness * 0.5, n, eye);
      color += spec * (uBackside > 0.5 ? 0.35 : 1.0);

      // Fresnel
      float f = pow(1.0 + dot(eye, n), uFresnelPower);
      color = mix(color, vec3(1.0), f * (uBackside > 0.5 ? 0.25 : 0.55));
      color += vec3(0.004, 0.005, 0.007);

      gl_FragColor = vec4(color, 1.0);
      #include <colorspace_fragment>
    }
  `;

  function createGlassMat(isBack) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uIorR: { value: 1.15 },
        uIorY: { value: 1.16 },
        uIorG: { value: 1.18 },
        uIorC: { value: 1.22 },
        uIorB: { value: 1.22 },
        uIorP: { value: 1.22 },
        uRefractPower: { value: isBack ? 0.22 : 0.30 },
        uChromatic: { value: 0.5 },
        uSaturation: { value: 1.08 },
        uShininess: { value: 90.0 },
        uDiffuseness: { value: 0.02 },
        uFresnelPower: { value: 5.0 },
        uLight: { value: new THREE.Vector3(-1, 1, 1) },
        uBackside: { value: isBack ? 1.0 : 0.0 }
      },
      vertexShader,
      fragmentShader,
      side: isBack ? THREE.BackSide : THREE.FrontSide
    });
  }

  const backMat = createGlassMat(true);
  const frontMat = createGlassMat(false);
  let cubeMesh = null;

  // 4b. Load Model with Fallback
  function setCubeGeometry(geo) {
    if (cubeMesh) spinner.remove(cubeMesh);
    cubeMesh = new THREE.Mesh(geo, frontMat);
    spinner.add(cubeMesh);
    if (loaderEl) loaderEl.classList.add('done');
  }

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    MODEL_URL,
    (gltf) => {
      if (destroyed) return;
      try {
        const geometries = [];
        gltf.scene.traverse((child) => {
          if (child.isMesh && child.geometry) {
            const g = child.geometry.clone();
            g.deleteAttribute('uv');
            g.deleteAttribute('color');
            g.deleteAttribute('tangent');
            const cleanG = mergeVertices(g, 1e-4);
            cleanG.computeVertexNormals();
            cleanG.applyMatrix4(child.matrixWorld);
            geometries.push(cleanG);
          }
        });

        if (geometries.length > 0) {
          const merged = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries);
          merged.center();
          merged.computeBoundingBox();
          const bbox = merged.boundingBox;
          const maxDim = Math.max(
            bbox.max.x - bbox.min.x,
            bbox.max.y - bbox.min.y,
            bbox.max.z - bbox.min.z
          );
          if (maxDim > 0) {
            merged.scale(1 / maxDim, 1 / maxDim, 1 / maxDim);
          }
          setCubeGeometry(merged);
        } else {
          setCubeGeometry(new RoundedBoxGeometry(1, 1, 1, 8, 0.12));
        }
      } catch (err) {
        setCubeGeometry(new RoundedBoxGeometry(1, 1, 1, 8, 0.12));
      }
    },
    undefined,
    () => {
      // Fallback geometry
      if (!destroyed) {
        setCubeGeometry(new RoundedBoxGeometry(1, 1, 1, 8, 0.12));
      }
    }
  );

  // 4a & 4c. Layout, Offscreen Headline, and Projections
  function updateHeadlineText(w, h, dpr) {
    textCanvas.width = Math.max(1, Math.floor(w * dpr));
    textCanvas.height = Math.max(1, Math.floor(h * dpr));

    textCtx.fillStyle = '#000000';
    textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);

    const mobile = (w < 768) || (w / h < 1);
    let fs = Math.min(textCanvas.height * 0.21, textCanvas.width * (mobile ? 0.21 : 0.118));

    textCtx.font = `800 ${fs}px Poppins, sans-serif`;
    const lines = ['Privacy', 'is a', 'MYTH'];

    // If widest line exceeds target width, scale down
    const maxWidthTarget = textCanvas.width * (mobile ? 0.9 : 0.5);
    let maxW = 0;
    lines.forEach(l => {
      const m = textCtx.measureText(l).width;
      if (m > maxW) maxW = m;
    });

    if (maxW > maxWidthTarget && maxW > 0) {
      fs = fs * (maxWidthTarget / maxW);
      textCtx.font = `800 ${fs}px Poppins, sans-serif`;
    }

    textCtx.fillStyle = '#e9e9e9';
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'alphabetic';

    const cx = textCanvas.width * (mobile ? 0.5 : 0.505);
    const cy = textCanvas.height * (mobile ? 0.45 : 0.468);
    const gap = fs * 1.07;
    const cap = fs * 0.7;

    lines.forEach((line, i) => {
      const y = cy + cap / 2 + (i - 1) * gap;
      textCtx.fillText(line, cx, y);
    });

    textTexture.needsUpdate = true;
  }

  function layout() {
    const rect = containerEl.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // Render Targets
    const rtW = Math.max(1, Math.floor(w * dpr));
    const rtH = Math.max(1, Math.floor(h * dpr));

    if (rtBack) rtBack.dispose();
    if (rtFront) rtFront.dispose();

    const rtOpts = {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true
    };
    rtBack = new THREE.WebGLRenderTarget(rtW, rtH, rtOpts);
    rtFront = new THREE.WebGLRenderTarget(rtW, rtH, rtOpts);

    backMat.uniforms.uTexture.value = rtBack.texture;
    backMat.uniforms.uResolution.value.set(rtW, rtH);
    frontMat.uniforms.uTexture.value = rtFront.texture;
    frontMat.uniforms.uResolution.value.set(rtW, rtH);

    updateHeadlineText(w, h, dpr);

    // 4c. Cube placement
    const mobile = (w < 768) || (w / h < 1);
    const visH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * 10;
    const visW = visH * camera.aspect;

    const sx = mobile ? 0.5 : 0.517;
    const sy = mobile ? 0.45 : 0.488;
    pivot.position.set((sx - 0.5) * visW, (0.5 - sy) * visH, 0);

    const px = Math.min(h * 0.44, w * (mobile ? 0.45 : 0.29));
    const scale = (px / h) * visH;
    pivot.scale.set(scale, scale, scale);
  }

  // Interaction: Drag, Inertia, Idle Drift, Arrow controls
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let velX = 0, velY = 0;
  let lastTime = performance.now();
  let timeSinceDrag = 1.0;
  let targetRotY = 0;
  let hasTargetRot = false;

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
    velX = 0;
    velY = 0;
    timeSinceDrag = 0;
    hasTargetRot = false;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('dragging');
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - prevX);
    const dy = (e.clientY - prevY);
    prevX = e.clientX;
    prevY = e.clientY;

    const rotX = dx * 0.008;
    const rotY = dy * 0.008;

    velX = rotX;
    velY = rotY;

    const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotX);
    const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotY);
    spinner.quaternion.premultiply(qY).premultiply(qX);
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    canvas.classList.remove('dragging');
  };

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // Arrow Buttons: rotate -90° / +90° around Y
  function rotateBy(deltaRad) {
    hasTargetRot = true;
    targetRotY += deltaRad;
    velX = 0;
    velY = 0;
  }

  btnPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    rotateBy(-Math.PI / 2);
  });

  btnNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    rotateBy(Math.PI / 2);
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      rotateBy((idx - 1) * Math.PI / 2);
    });
  });

  // Fonts loading done listener
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (!destroyed) layout();
    });
  }

  layout();
  const resizeObserver = new ResizeObserver(() => {
    if (!destroyed) layout();
  });
  resizeObserver.observe(containerEl);

  // Render Loop
  function tick(now) {
    if (destroyed) return;

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!isDragging) {
      timeSinceDrag += dt;

      if (hasTargetRot) {
        const step = targetRotY * Math.min(1.0, 0.09 * dt * 60);
        const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), step);
        spinner.quaternion.premultiply(qY);
        targetRotY -= step;
        if (Math.abs(targetRotY) < 0.0005) {
          hasTargetRot = false;
          targetRotY = 0;
        }
      } else {
        // Inertia damping
        if (Math.abs(velX) > 0.0001 || Math.abs(velY) > 0.0001) {
          const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), velX);
          const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), velY);
          spinner.quaternion.premultiply(qY).premultiply(qX);

          const damp = Math.pow(0.94, dt * 60);
          velX *= damp;
          velY *= damp;
        }

        // Idle drift
        if (timeSinceDrag > 0.6) {
          const blend = Math.min(1.0, (timeSinceDrag - 0.6) / 1.0);
          const driftY = 0.0035 * blend;
          const driftX = 0.0012 * blend;
          const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), driftY);
          const qX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), driftX);
          spinner.quaternion.premultiply(qY).premultiply(qX);
        }
      }
    }

    // 4e. Dual-Pass Chromatic Dispersion Render Pipeline
    if (rtBack && rtFront && cubeMesh) {
      // 1) render bgScene -> rtBack
      renderer.setRenderTarget(rtBack);
      renderer.clear();
      renderer.render(bgScene, bgCamera);

      // 2) render bgScene -> rtFront, then cube with backMat -> rtFront
      renderer.setRenderTarget(rtFront);
      renderer.clear();
      renderer.render(bgScene, bgCamera);

      cubeMesh.material = backMat;
      renderer.autoClear = false;
      renderer.render(scene, camera);

      // 3) render bgScene -> screen, then cube with frontMat -> screen
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(bgScene, bgCamera);

      cubeMesh.material = frontMat;
      renderer.clearDepth();
      renderer.render(scene, camera);
      renderer.autoClear = true;
    }

    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);

  return () => {
    destroyed = true;
    if (animId) cancelAnimationFrame(animId);
    resizeObserver.disconnect();
    if (rtBack) rtBack.dispose();
    if (rtFront) rtFront.dispose();
    renderer.dispose();
  };
}
