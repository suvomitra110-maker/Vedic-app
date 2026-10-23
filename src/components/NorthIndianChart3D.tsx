import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  VargaChartDefinition,
  NORTH_INDIAN_3D_BHAVAS,
  getPlanet3DOffset,
  computeAspectedHouses,
  generateBlenderPythonScript,
} from '../utils/shastiamshaLogic';
import {
  NavagrahaIcon,
  NINE_NAVAGRAHA_SYMBOLS,
  NAVAGRAHA_METADATA,
  drawNavagrahaCanvasIcon,
} from './NavagrahaIcon';

interface NorthIndianChart3DProps {
  vargaChart: VargaChartDefinition;
  selectedHouse: number;
  selectedPlanetSymbol: string | null;
  showAspects: boolean;
  showOuterPlanets: boolean;
  onSelectHouse: (houseNumber: number) => void;
  onSelectPlanet: (symbol: string, houseNumber: number) => void;
}

type ShadingMode = 'rendered' | 'solid' | 'wireframe';
type CameraPreset = 'isometric' | 'top' | 'altar';

const OUTER_PLANET_SET = new Set(['Ur', 'Ne', 'Pl']);

const PLANET_SPECIAL_ASPECTS: Record<string, number[]> = {
  Ma: [4, 7, 8],
  Ju: [5, 7, 9],
  Sa: [3, 7, 10],
  Ra: [5, 7, 9],
  Ke: [5, 7, 9],
};

const PLANET_PALETTE: Record<
  string,
  { primary: string; secondary: string; hex: number; ringHex: number }
> = {
  Su: { primary: '#f59e0b', secondary: '#fef3c7', hex: 0xf59e0b, ringHex: 0xfbbf24 },
  Mo: { primary: '#e2e8f0', secondary: '#94a3b8', hex: 0xe2e8f0, ringHex: 0x38bdf8 },
  Ma: { primary: '#ef4444', secondary: '#991b1b', hex: 0xef4444, ringHex: 0xf87171 },
  Me: { primary: '#10b981', secondary: '#065f46', hex: 0x10b981, ringHex: 0x34d399 },
  Ju: { primary: '#eab308', secondary: '#854d0e', hex: 0xeab308, ringHex: 0xfde047 },
  Ve: { primary: '#ec4899', secondary: '#9d174d', hex: 0xec4899, ringHex: 0xf472b6 },
  Sa: { primary: '#3b82f6', secondary: '#1e3a8a', hex: 0x3b82f6, ringHex: 0x93c5fd },
  Ra: { primary: '#8b5cf6', secondary: '#4c1d95', hex: 0x8b5cf6, ringHex: 0xc4b5fd },
  Ke: { primary: '#f97316', secondary: '#7c2d12', hex: 0xf97316, ringHex: 0xfdba74 },
  Ur: { primary: '#06b6d4', secondary: '#155e75', hex: 0x06b6d4, ringHex: 0x67e8f9 },
  Ne: { primary: '#6366f1', secondary: '#312e81', hex: 0x6366f1, ringHex: 0xa5b4fc },
  Pl: { primary: '#a855f7', secondary: '#581c87', hex: 0xa855f7, ringHex: 0xd8b4fe },
};

// Reusable module-scope math vectors to prevent GC allocations in render ticks
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

function createProceduralPlanetTexture(
  symbol: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const palette = PLANET_PALETTE[symbol] || PLANET_PALETTE.Su;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, palette.secondary);
    grad.addColorStop(0.5, palette.primary);
    grad.addColorStop(1, palette.secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);

    // Subtle atmospheric bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    for (let y = 14; y < 120; y += 22) {
      ctx.fillRect(0, y, 256, 6);
    }
    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    for (let y = 26; y < 120; y += 28) {
      ctx.fillRect(0, y, 256, 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createHouseLabelTexture(
  houseNum: number,
  signNumber: number,
  signName: string,
  isSelected: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = isSelected ? 'rgba(14, 165, 233, 0.24)' : 'rgba(15, 23, 42, 0.72)';
    ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(217, 169, 78, 0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 112, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = isSelected ? '#7dd3fc' : '#fbbf24';
    ctx.font = 'bold 34px "IBM Plex Mono", monospace';
    ctx.fillText(`H${houseNum} · #${signNumber}`, 128, 56);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(signName.toUpperCase(), 128, 96);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createPlanetBadgeTexture(
  symbol: string,
  houseNum: number,
  isSelected: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const palette = PLANET_PALETTE[symbol] || PLANET_PALETTE.Su;
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 224, 96);
    ctx.fillStyle = isSelected ? '#0284c7' : '#0f172a';
    ctx.strokeStyle = isSelected ? '#fde047' : palette.primary;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(8, 8, 208, 80, 20);
    ctx.fill();
    ctx.stroke();

    // Draw minimalist Navagraha sacred-geometry icon inside left emblem circle
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(54, 48, 28, 0, Math.PI * 2);
    ctx.fill();
    drawNavagrahaCanvasIcon(ctx, symbol, 54, 48, 20);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "IBM Plex Mono", monospace';
    ctx.fillText(symbol, 144, 52);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 17px "IBM Plex Mono", monospace';
    ctx.fillText(`BHAVA H${houseNum}`, 144, 76);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export const NorthIndianChart3D: React.FC<NorthIndianChart3DProps> = ({
  vargaChart,
  selectedHouse,
  selectedPlanetSymbol,
  showAspects,
  showOuterPlanets,
  onSelectHouse,
  onSelectPlanet,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [shadingMode, setShadingMode] = useState<ShadingMode>('rendered');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [elevationScale, setElevationScale] = useState<number>(1.25);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [showScriptDrawer, setShowScriptDrawer] = useState<boolean>(false);
  const [scriptCopied, setScriptCopied] = useState<boolean>(false);

  // Store latest callbacks and props in refs so WebGL canvas never tears down on state updates
  const callbacksRef = useRef({ onSelectHouse, onSelectPlanet });
  callbacksRef.current = { onSelectHouse, onSelectPlanet };

  const sceneRefs = useRef<{
    rebuildDynamicChart?: () => void;
    applyShadingMode?: (mode: ShadingMode) => void;
    applyCameraPreset?: (preset: CameraPreset) => void;
    applyElevationScale?: (scale: number) => void;
  }>({});

  const latestPropsRef = useRef({
    vargaChart,
    selectedHouse,
    selectedPlanetSymbol,
    showAspects,
    showOuterPlanets,
    shadingMode,
    elevationScale,
  });
  latestPropsRef.current = {
    vargaChart,
    selectedHouse,
    selectedPlanetSymbol,
    showAspects,
    showOuterPlanets,
    shadingMode,
    elevationScale,
  };

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software-WebGL Guard (detect SwiftShader/llvmpipe via renderer string)
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 440);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.022);

    // 2. Mandatory Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(0, 12.2, 10.6);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minDistance = 6.5;
    controls.maxDistance = 24;
    controls.target.set(0, 0, 0);

    // 3. Balanced 3-Point Studio Lighting Rig + Warm/Cool Contrast
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2d6, 2.3);
    keyLight.position.set(8, 15, 9);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 36;
    const d = 8.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-9, 10, -8);
    scene.add(rimLight);

    // 4. Permanent Architectural Sanctuary Plinth & Beveled Gold North Indian Yantra Frame
    const sanctuaryGroup = new THREE.Group();
    scene.add(sanctuaryGroup);

    // Contact shadow grounding plane beneath the plinth
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const radGrad = sCtx.createRadialGradient(64, 64, 12, 64, 64, 62);
      radGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = radGrad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(14.5, 14.5),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    contactShadowPlane.rotation.x = -Math.PI / 2;
    contactShadowPlane.position.y = -0.42;
    sanctuaryGroup.add(contactShadowPlane);

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.55,
      metalness: 0.35,
    });
    const stepMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.5,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd9a94e,
      roughness: 0.22,
      metalness: 0.9,
    });

    const lowerPlinth = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.28, 11.4), plinthMat);
    lowerPlinth.position.y = -0.26;
    lowerPlinth.receiveShadow = true;
    sanctuaryGroup.add(lowerPlinth);

    const upperPlinth = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.14, 10.6), stepMat);
    upperPlinth.position.y = -0.07;
    upperPlinth.receiveShadow = true;
    sanctuaryGroup.add(upperPlinth);

    // 4 Outer Gold Yantra Rails
    const railThickness = 0.14;
    const railHeight = 0.28;
    const northRail = new THREE.Mesh(
      new THREE.BoxGeometry(10.28, railHeight, railThickness),
      goldMat
    );
    northRail.position.set(0, railHeight / 2, -5.07);
    const southRail = northRail.clone();
    southRail.position.set(0, railHeight / 2, 5.07);
    const westRail = new THREE.Mesh(
      new THREE.BoxGeometry(railThickness, railHeight, 10.28),
      goldMat
    );
    westRail.position.set(-5.07, railHeight / 2, 0);
    const eastRail = westRail.clone();
    eastRail.position.set(5.07, railHeight / 2, 0);
    sanctuaryGroup.add(northRail, southRail, westRail, eastRail);

    // 4 Corner Kalasha Finial Pillars (3-part composite assemblies)
    const corners: Array<[number, number]> = [
      [-5.07, -5.07],
      [5.07, -5.07],
      [5.07, 5.07],
      [-5.07, 5.07],
    ];
    corners.forEach(([cx, cz]) => {
      const kalasha = new THREE.Group();
      kalasha.position.set(cx, 0, cz);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), stepMat);
      base.position.y = 0.17;
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.45, 8), goldMat);
      column.position.y = 0.48;
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), goldMat);
      finial.position.y = 0.78;
      kalasha.add(base, column, finial);
      sanctuaryGroup.add(kalasha);
    });

    // Diagonal X-Beams & Inner Kendra Diamond Beams in Brushed Gold
    const diagLen = Math.sqrt(10 * 10 + 10 * 10);
    const diagBeam1 = new THREE.Mesh(
      new THREE.BoxGeometry(diagLen, 0.22, 0.08),
      goldMat
    );
    diagBeam1.position.set(0, 0.11, 0);
    diagBeam1.rotation.y = Math.PI / 4;

    const diagBeam2 = diagBeam1.clone();
    diagBeam2.rotation.y = -Math.PI / 4;
    sanctuaryGroup.add(diagBeam1, diagBeam2);

    const kendraSideLen = Math.sqrt(5 * 5 + 5 * 5);
    const kendraSegments: Array<{ x: number; z: number; rot: number }> = [
      { x: -2.5, z: -2.5, rot: -Math.PI / 4 },
      { x: -2.5, z: 2.5, rot: Math.PI / 4 },
      { x: 2.5, z: 2.5, rot: -Math.PI / 4 },
      { x: 2.5, z: -2.5, rot: Math.PI / 4 },
    ];
    kendraSegments.forEach((seg) => {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(kendraSideLen, 0.24, 0.09),
        goldMat
      );
      beam.position.set(seg.x, 0.12, seg.z);
      beam.rotation.y = seg.rot;
      sanctuaryGroup.add(beam);
    });

    // Dynamic groups for the 12 Bhava Chambers, Planetary Assemblies, and Aspect Arcs
    const dynamicChartGroup = new THREE.Group();
    scene.add(dynamicChartGroup);

    const clickableObjects: THREE.Object3D[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const disposableTextures: THREE.Texture[] = [];

    const clearDynamicResources = () => {
      clickableObjects.length = 0;
      while (dynamicChartGroup.children.length > 0) {
        dynamicChartGroup.remove(dynamicChartGroup.children[0]);
      }
      disposableGeometries.forEach((g) => g.dispose());
      disposableGeometries.length = 0;
      disposableMaterials.forEach((m) => m.dispose());
      disposableMaterials.length = 0;
      disposableTextures.forEach((t) => t.dispose());
      disposableTextures.length = 0;
    };

    const buildDynamicChart = () => {
      clearDynamicResources();
      const {
        vargaChart: chart,
        selectedHouse: selHouse,
        selectedPlanetSymbol: selPlanet,
        showAspects: aspectsOn,
        showOuterPlanets: outerOn,
        shadingMode: mode,
        elevationScale: elevScale,
      } = latestPropsRef.current;

      const isWire = mode === 'wireframe';
      const isSolid = mode === 'solid';

      // 1. Build 12 Extruded North Indian Bhava Chambers
      NORTH_INDIAN_3D_BHAVAS.forEach((bhava3d) => {
        const houseData = chart.houses.find((h) => h.house === bhava3d.house);
        const signNumber = houseData?.signNumber ?? bhava3d.house;
        const signName = houseData?.signName ?? '';
        const isSelected = bhava3d.house === selHouse;

        const [cx, cz] = bhava3d.centerXZ;
        const shape = new THREE.Shape();
        bhava3d.polygonXZ.forEach(([vx, vz], idx) => {
          // Shrink slightly toward centroid to reveal beveled gold channels
          const sx = cx + (vx - cx) * 0.92;
          const sz = cz + (vz - cz) * 0.92;
          // Shape is in XY, rotated -PI/2 around X -> Y becomes -Z, so pass -sz
          if (idx === 0) shape.moveTo(sx, -sz);
          else shape.lineTo(sx, -sz);
        });
        shape.closePath();

        const baseDepth = (bhava3d.isKendra ? 0.24 : 0.15) * elevScale;
        const depth = isSelected ? baseDepth + 0.14 : baseDepth;

        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          steps: 1,
          depth,
          bevelEnabled: true,
          bevelThickness: 0.025,
          bevelSize: 0.025,
          bevelSegments: 2,
        });
        extrudeGeo.rotateX(-Math.PI / 2);
        disposableGeometries.push(extrudeGeo);

        const chamberColor = isSelected
          ? 0x0369a1
          : bhava3d.isKendra
            ? 0x1e293b
            : bhava3d.isTrikona
              ? 0x172554
              : 0x0f172a;

        const chamberMat = new THREE.MeshStandardMaterial({
          color: chamberColor,
          roughness: isSolid ? 0.75 : isSelected ? 0.25 : 0.48,
          metalness: isSolid ? 0.1 : isSelected ? 0.55 : 0.35,
          emissive: isSelected ? 0x0284c7 : 0x000000,
          emissiveIntensity: isSelected ? 0.28 : 0,
          wireframe: isWire,
        });
        disposableMaterials.push(chamberMat);

        const chamberMesh = new THREE.Mesh(extrudeGeo, chamberMat);
        chamberMesh.receiveShadow = true;
        chamberMesh.castShadow = !isSoftwareGl;
        chamberMesh.userData = { type: 'house', house: bhava3d.house };
        dynamicChartGroup.add(chamberMesh);
        clickableObjects.push(chamberMesh);

        // High-contrast Top Decal Plate for House & Rashi Sign
        const labelTex = createHouseLabelTexture(
          bhava3d.house,
          signNumber,
          signName,
          isSelected,
          maxAniso
        );
        disposableTextures.push(labelTex);

        const labelPlaneGeo = new THREE.PlaneGeometry(1.38, 0.69);
        disposableGeometries.push(labelPlaneGeo);
        const labelPlaneMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        });
        disposableMaterials.push(labelPlaneMat);

        const labelMesh = new THREE.Mesh(labelPlaneGeo, labelPlaneMat);
        labelMesh.rotation.x = -Math.PI / 2;
        labelMesh.position.set(
          bhava3d.signLabelXZ[0],
          depth + 0.032,
          bhava3d.signLabelXZ[1]
        );
        labelMesh.userData = { type: 'house', house: bhava3d.house };
        dynamicChartGroup.add(labelMesh);
        clickableObjects.push(labelMesh);

        // 2. Build 5-Part Composite 3D Planetary Assemblies for Occupants
        const rawOccupants = houseData?.occupants ?? [];
        const occupants = outerOn
          ? rawOccupants
          : rawOccupants.filter((sym) => !OUTER_PLANET_SET.has(sym));

        occupants.forEach((sym, idx) => {
          const [px, pz] = getPlanet3DOffset(idx, occupants.length, bhava3d.house);
          const palette = PLANET_PALETTE[sym] || PLANET_PALETTE.Su;
          const isPlanetSelected = selPlanet === sym;

          const planetAssembly = new THREE.Group();
          planetAssembly.position.set(px, depth + 0.025, pz);

          // Part 1: Stepped Brass Pedestal Plinth
          const pedBaseGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.09, 20);
          const pedRingGeo = new THREE.CylinderGeometry(0.16, 0.21, 0.06, 20);
          disposableGeometries.push(pedBaseGeo, pedRingGeo);

          const pedMat = new THREE.MeshStandardMaterial({
            color: isPlanetSelected ? 0x38bdf8 : 0xd9a94e,
            roughness: 0.25,
            metalness: 0.85,
            wireframe: isWire,
          });
          disposableMaterials.push(pedMat);

          const pedBase = new THREE.Mesh(pedBaseGeo, pedMat);
          pedBase.position.y = 0.045;
          const pedRing = new THREE.Mesh(pedRingGeo, pedMat);
          pedRing.position.y = 0.11;
          planetAssembly.add(pedBase, pedRing);

          // Part 2: Energy Axis Column
          const stemHeight = (isPlanetSelected ? 0.68 : 0.52) * elevScale;
          const stemGeo = new THREE.CylinderGeometry(0.032, 0.032, stemHeight, 12);
          disposableGeometries.push(stemGeo);
          const stemMat = new THREE.MeshStandardMaterial({
            color: palette.hex,
            emissive: palette.hex,
            emissiveIntensity: isPlanetSelected ? 0.65 : 0.25,
            roughness: 0.3,
            metalness: 0.5,
            wireframe: isWire,
          });
          disposableMaterials.push(stemMat);
          const stemMesh = new THREE.Mesh(stemGeo, stemMat);
          stemMesh.position.y = 0.12 + stemHeight / 2;
          planetAssembly.add(stemMesh);

          // Part 3: Primary Textured Celestial Sphere
          const orbY = 0.16 + stemHeight;
          const sphereRadius = isPlanetSelected ? 0.30 : 0.24;
          const sphereGeo = new THREE.SphereGeometry(sphereRadius, 28, 28);
          disposableGeometries.push(sphereGeo);

          const planetTex = createProceduralPlanetTexture(sym, maxAniso);
          disposableTextures.push(planetTex);

          const sphereMat = new THREE.MeshStandardMaterial({
            map: isSolid ? null : planetTex,
            color: isSolid ? palette.hex : 0xffffff,
            roughness: isSolid ? 0.6 : 0.2,
            metalness: isSolid ? 0.15 : 0.3,
            emissive: palette.hex,
            emissiveIntensity: isPlanetSelected ? 0.35 : 0.1,
            wireframe: isWire,
          });
          disposableMaterials.push(sphereMat);

          const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
          sphereMesh.position.y = orbY;
          sphereMesh.castShadow = !isSoftwareGl;
          sphereMesh.userData = {
            type: 'planet',
            symbol: sym,
            house: bhava3d.house,
          };
          planetAssembly.add(sphereMesh);
          clickableObjects.push(sphereMesh);

          // Part 4: Tilted Celestial Gimbal Ring(s)
          const ringGeo = new THREE.TorusGeometry(sphereRadius + 0.11, 0.02, 12, 36);
          disposableGeometries.push(ringGeo);
          const ringMat = new THREE.MeshStandardMaterial({
            color: palette.ringHex,
            roughness: 0.18,
            metalness: 0.9,
            emissive: isPlanetSelected ? palette.ringHex : 0x000000,
            emissiveIntensity: isPlanetSelected ? 0.4 : 0,
            wireframe: isWire,
          });
          disposableMaterials.push(ringMat);

          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.y = orbY;
          ringMesh.rotation.set(Math.PI / 2.6, 0.35, 0);
          ringMesh.userData = {
            type: 'planet',
            symbol: sym,
            house: bhava3d.house,
          };
          planetAssembly.add(ringMesh);
          clickableObjects.push(ringMesh);

          if (sym === 'Sa' || sym === 'Ma' || sym === 'Me' || sym === 'Ju' || isPlanetSelected) {
            const outerRingGeo = new THREE.TorusGeometry(sphereRadius + 0.18, 0.014, 10, 36);
            disposableGeometries.push(outerRingGeo);
            const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
            outerRing.position.y = orbY;
            outerRing.rotation.set(-Math.PI / 3.2, -0.4, 0.2);
            planetAssembly.add(outerRing);
          }

          // Part 5: High-Contrast Floating Billboard Badge (Sprite)
          const badgeTex = createPlanetBadgeTexture(
            sym,
            bhava3d.house,
            isPlanetSelected,
            maxAniso
          );
          disposableTextures.push(badgeTex);
          const spriteMat = new THREE.SpriteMaterial({
            map: badgeTex,
            transparent: true,
            depthWrite: false,
          });
          disposableMaterials.push(spriteMat);

          const badgeSprite = new THREE.Sprite(spriteMat);
          badgeSprite.position.set(0, orbY + sphereRadius + 0.34, 0);
          badgeSprite.scale.set(0.95, 0.48, 1);
          badgeSprite.userData = {
            type: 'planet',
            symbol: sym,
            house: bhava3d.house,
          };
          planetAssembly.add(badgeSprite);
          clickableObjects.push(badgeSprite);

          dynamicChartGroup.add(planetAssembly);

          // 3. Build 3D Parabolic Graha Drishti (Vedic Aspect) Bridges for Selected Planet
          if (aspectsOn && isPlanetSelected) {
            const aspectOffsets = PLANET_SPECIAL_ASPECTS[sym] || [7];
            const aspectedHouses = computeAspectedHouses(bhava3d.house, aspectOffsets);
            const startVec = new THREE.Vector3(px, depth + orbY + 0.05, pz);

            aspectedHouses.forEach((targetHouseNum) => {
              const targetLayout = NORTH_INDIAN_3D_BHAVAS.find(
                (b) => b.house === targetHouseNum
              );
              if (!targetLayout) return;

              const [tx, tz] = targetLayout.centerXZ;
              const endVec = new THREE.Vector3(tx, 0.42 * elevScale, tz);
              const midVec = new THREE.Vector3(
                (px + tx) * 0.5,
                Math.max(2.1, 1.85 * elevScale + startVec.distanceTo(endVec) * 0.16),
                (pz + tz) * 0.5
              );

              const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
              const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.035, 8, false);
              disposableGeometries.push(tubeGeo);

              const tubeMat = new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.75,
                roughness: 0.2,
                metalness: 0.6,
                wireframe: isWire,
              });
              disposableMaterials.push(tubeMat);

              const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
              dynamicChartGroup.add(tubeMesh);

              // Target Beacon Cone at Aspected House
              const coneGeo = new THREE.ConeGeometry(0.14, 0.32, 12);
              disposableGeometries.push(coneGeo);
              const coneMesh = new THREE.Mesh(coneGeo, tubeMat);
              coneMesh.position.copy(endVec);
              coneMesh.rotation.x = Math.PI; // Point downward into the aspected Bhava
              dynamicChartGroup.add(coneMesh);
            });
          }
        });
      });
    };

    // 5. On-Demand Coalesced Render Architecture with Software-WebGL Fence Sync
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let activeCamTransition = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (activeCamTransition) {
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            _targetCamPos.x,
            7,
            dt
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            _targetCamPos.y,
            7,
            dt
          );
          camera.position.z = THREE.MathUtils.damp(
            camera.position.z,
            _targetCamPos.z,
            7,
            dt
          );
          controls.target.x = THREE.MathUtils.damp(
            controls.target.x,
            _targetLookAt.x,
            7,
            dt
          );
          controls.target.y = THREE.MathUtils.damp(
            controls.target.y,
            _targetLookAt.y,
            7,
            dt
          );
          controls.target.z = THREE.MathUtils.damp(
            controls.target.z,
            _targetLookAt.z,
            7,
            dt
          );
          if (camera.position.distanceTo(_targetCamPos) < 0.05) {
            activeCamTransition = false;
          } else {
            renderDirty = true;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    // Cancel scripted camera transition if user manually grabs OrbitControls
    const onControlStart = () => {
      activeCamTransition = false;
    };
    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    // Raycasting for Click Selection on 3D Planets & Bhava Chambers
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      if (dist > 6) return; // Ignore drag-orbit gestures

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object.userData;
        if (hit.type === 'planet' && hit.symbol && hit.house) {
          callbacksRef.current.onSelectPlanet(hit.symbol, hit.house);
        } else if (hit.type === 'house' && hit.house) {
          callbacksRef.current.onSelectHouse(hit.house);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 440);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    // Expose imperative hooks to React state effects
    sceneRefs.current.rebuildDynamicChart = () => {
      buildDynamicChart();
      requestRender();
    };

    sceneRefs.current.applyCameraPreset = (preset: CameraPreset) => {
      _targetLookAt.set(0, 0, 0);
      if (preset === 'top') {
        _targetCamPos.set(0, 15.8, 0.01);
      } else if (preset === 'altar') {
        _targetCamPos.set(-6.8, 6.2, 10.8);
      } else {
        _targetCamPos.set(0, 12.2, 10.6);
      }
      if (isSoftwareGl) {
        camera.position.copy(_targetCamPos);
        controls.target.copy(_targetLookAt);
        activeCamTransition = false;
      } else {
        lastTime = performance.now();
        activeCamTransition = true;
      }
      requestRender();
    };

    buildDynamicChart();
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      clearDynamicResources();
      plinthMat.dispose();
      stepMat.dispose();
      goldMat.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Trigger fast scene update whenever chart, house, planet, aspects, shading, or elevation changes
  useEffect(() => {
    sceneRefs.current.rebuildDynamicChart?.();
  }, [
    vargaChart,
    selectedHouse,
    selectedPlanetSymbol,
    showAspects,
    showOuterPlanets,
    shadingMode,
    elevationScale,
  ]);

  const handleCameraPresetChange = (preset: CameraPreset) => {
    setCameraPreset(preset);
    sceneRefs.current.applyCameraPreset?.(preset);
  };

  const handleDownloadBlenderScript = () => {
    const script = generateBlenderPythonScript(vargaChart, showOuterPlanets);
    const blob = new Blob([script], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blender_${vargaChart.code.toLowerCase()}_vedic_chart.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyBlenderScript = () => {
    const script = generateBlenderPythonScript(vargaChart, showOuterPlanets);
    navigator.clipboard?.writeText(script);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 3000);
  };

  return (
    <div className="w-full">
      {/* Blender 4.x Viewport Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#1E293B] text-slate-200 rounded-t-lg border border-b-0 border-slate-700 text-xs font-mono-tabular">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">BLENDER 3D VIEWPORT</span>
          <span className="text-slate-400">·</span>
          <span>
            {vargaChart.code} ({vargaChart.lagnaName})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowScriptDrawer((prev) => !prev)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-600 rounded cursor-pointer transition-colors"
          >
            {showScriptDrawer ? 'Hide bpy Script' : 'View Blender .py'}
          </button>
          <button
            type="button"
            onClick={handleDownloadBlenderScript}
            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded cursor-pointer transition-colors"
          >
            Export .py for Blender
          </button>
        </div>
      </div>

      {/* 9-Planet Navagraha Minimalist Sacred-Geometry Icon Strip */}
      <div
        role="toolbar"
        aria-label="Nine Vedic Planets (Navagraha) Minimalist 3D Selector"
        className="grid grid-cols-9 gap-1 px-2.5 py-2 bg-[#0F172A] border-x border-b border-slate-700"
      >
        {NINE_NAVAGRAHA_SYMBOLS.map((sym) => {
          const meta = NAVAGRAHA_METADATA[sym];
          const housePlacement =
            vargaChart.houses.find((h) => h.occupants.includes(sym))?.house ?? 1;
          const isSelected = selectedPlanetSymbol === sym;
          return (
            <button
              key={sym}
              type="button"
              onClick={() => onSelectPlanet(sym, housePlacement)}
              title={`${meta.sanskritName} (${meta.englishName}) — Bhava H${housePlacement} in ${vargaChart.code}`}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-sky-950/90 border border-sky-400 text-white'
                  : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300'
              }`}
            >
              <NavagrahaIcon symbol={sym} size="sm" active={isSelected} />
              <span className="mt-1 text-[10px] font-mono-tabular font-bold leading-none">
                {sym}
              </span>
              <span className="text-[9px] font-mono-tabular text-slate-400 leading-tight">
                H{housePlacement}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 3D WebGL Viewport Container + Unified Collapsible Bottom Dock */}
      <div className="relative w-full h-[460px] bg-[#0B1120] rounded-b-lg overflow-hidden border border-t-0 border-slate-700">
        {/* Top-Left Minimal Spec Overlay (Solid Dark Surface — Zero Backdrop-Blur) */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none bg-[#0F172A] border border-slate-700 rounded px-2.5 py-1.5 text-[11px] font-mono-tabular text-slate-300">
          <div>
            Selected: <strong className="text-sky-400">H{selectedHouse}</strong>
            {selectedPlanetSymbol ? (
              <>
                {' '}
                · Planet: <strong className="text-amber-400">{selectedPlanetSymbol}</strong>
              </>
            ) : (
              ' (Empty Bhava)'
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            Click any 3D Orb or Bhava Chamber · Drag to Orbit · Scroll to Zoom
          </div>
        </div>

        {/* Dedicated Isolated WebGL Canvas Mount */}
        <div
          ref={canvasMountRef}
          aria-label={`Interactive 3D Blender North Indian Chart for ${vargaChart.name}`}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Collapsible Unified Bottom Control Dock (Zero Side-Panel Clutter, Zero Backdrop-Blur) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-[520px] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="px-3 py-0.5 text-[11px] font-mono-tabular font-medium bg-[#1E293B] text-slate-300 hover:text-white border border-b-0 border-slate-600 rounded-t-md cursor-pointer"
          >
            {dockCollapsed ? '▴ Show 3D Controls' : '▾ Hide Controls'}
          </button>

          {!dockCollapsed && (
            <div className="w-full bg-[#0F172A] border border-slate-600 rounded-md px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-slate-200 shadow-md">
              {/* Camera View Presets */}
              <div className="flex items-center gap-1" role="group" aria-label="3D Camera View">
                {(
                  [
                    { id: 'isometric', label: 'Iso 3D' },
                    { id: 'top', label: 'Top Plan' },
                    { id: 'altar', label: 'Altar Low' },
                  ] as const
                ).map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => handleCameraPresetChange(cam.id)}
                    className={`px-2 py-1 text-[11px] rounded cursor-pointer transition-colors ${
                      cameraPreset === cam.id
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Blender Viewport Shading Mode */}
              <div className="flex items-center gap-1" role="group" aria-label="Blender Shading Mode">
                {(
                  [
                    { id: 'rendered', label: 'PBR' },
                    { id: 'solid', label: 'Solid' },
                    { id: 'wireframe', label: 'Wire' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setShadingMode(mode.id)}
                    className={`px-2 py-1 text-[11px] rounded cursor-pointer transition-colors ${
                      shadingMode === mode.id
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Z-Elevation Slider */}
              <label className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <span>Z-Lift</span>
                <input
                  type="range"
                  min={0.8}
                  max={2.0}
                  step={0.15}
                  value={elevationScale}
                  onChange={(e) => setElevationScale(Number(e.target.value))}
                  aria-label="3D Bhava Elevation Scale"
                  className="w-16 accent-amber-400 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Optional Collapsible Blender Python (bpy) Script Drawer */}
      {showScriptDrawer && (
        <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 text-xs font-mono-tabular">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-amber-300 font-semibold">
              Blender 3.x / 4.x Python Generator ({vargaChart.code} — {vargaChart.lagnaName})
            </span>
            <button
              type="button"
              onClick={handleCopyBlenderScript}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-600 rounded cursor-pointer"
            >
              {scriptCopied ? '✓ Copied to Clipboard' : 'Copy bpy Script'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-2 font-sans">
            Open <strong>Blender</strong> → switch to the <strong>Scripting</strong> workspace → click <strong>New</strong> → paste this script and press <strong>Run Script</strong> to generate the native 3D North Indian Mandapa mesh, Principled BSDF materials, and planetary spheres.
          </p>
          <pre className="max-h-48 overflow-y-auto p-2.5 bg-slate-950 text-emerald-300 rounded border border-slate-800 text-[11px] leading-relaxed">
            {generateBlenderPythonScript(vargaChart, showOuterPlanets)}
          </pre>
        </div>
      )}
    </div>
  );
};
