// Renderiza un archivo 3D (GLB/GLTF/OBJ/FBX/STL) en varias vistas fijas.
// El modelo de vídeo no entiende geometría 3D: le pasamos estas vistas como
// imágenes de referencia para que el producto salga igual desde cualquier ángulo.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export const MODEL_EXTENSIONS = ["glb", "gltf", "obj", "fbx", "stl"] as const;

export const isModelFile = (file: File): boolean => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (MODEL_EXTENSIONS as readonly string[]).includes(ext);
};

const VIEWS: { name: string; dir: [number, number, number] }[] = [
  { name: "frontal", dir: [0, 0.25, 1] },
  { name: "tres-cuartos", dir: [0.9, 0.35, 0.9] },
  { name: "lateral", dir: [1, 0.15, 0] },
  { name: "trasera", dir: [-0.6, 0.3, -1] },
  { name: "superior", dir: [0.2, 1, 0.35] },
];

async function loadObject(file: File): Promise<THREE.Object3D> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const url = URL.createObjectURL(file);
  try {
    if (ext === "glb" || ext === "gltf") {
      const gltf = await new GLTFLoader().loadAsync(url);
      return gltf.scene;
    }
    if (ext === "obj") return await new OBJLoader().loadAsync(url);
    if (ext === "fbx") return await new FBXLoader().loadAsync(url);
    if (ext === "stl") {
      const geometry = await new STLLoader().loadAsync(url);
      geometry.computeVertexNormals();
      return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 0.1, roughness: 0.6 }));
    }
    throw new Error("formato no soportado");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Devuelve una imagen JPEG por vista, lista para subir como referencia. */
export async function renderModelViews(file: File, size = 768): Promise<File[]> {
  const object = await loadObject(file);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2f2f2);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-4, 2, -3);
  scene.add(fill);
  scene.add(object);

  // Centra el modelo en el origen y normaliza su tamaño.
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  const radius = box.getSize(new THREE.Vector3()).length() / 2 || 1;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(size, size, false);
  renderer.setPixelRatio(1);

  const camera = new THREE.PerspectiveCamera(35, 1, radius / 100, radius * 100);
  const distance = radius / Math.sin((35 * Math.PI) / 360) * 1.05;

  const files: File[] = [];
  try {
    for (const view of VIEWS) {
      const dir = new THREE.Vector3(...view.dir).normalize();
      camera.position.copy(dir.multiplyScalar(distance));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (blob) files.push(new File([blob], `vista-${view.name}.jpg`, { type: "image/jpeg" }));
    }
  } finally {
    renderer.dispose();
  }

  if (files.length === 0) throw new Error("no se pudo renderizar el modelo");
  return files;
}
