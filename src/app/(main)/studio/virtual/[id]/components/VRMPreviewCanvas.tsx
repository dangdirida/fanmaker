"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadVRM(url: string): Promise<any> {
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loader.register((parser: any) => new VRMLoaderPlugin(parser));
    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm;
        if (vrm) {
          VRMUtils.rotateVRM0(vrm);
          resolve(vrm);
        } else {
          reject(new Error("VRM not found in file"));
        }
      },
      undefined,
      reject
    );
  });
}

function VRMScene({ hairColor }: { hairColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vrmRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    loadVRM("/models/base_female.vrm")
      .then((vrm) => {
        if (disposed) return;
        vrmRef.current = vrm;
        if (groupRef.current) {
          groupRef.current.add(vrm.scene);
        }
        try {
          const lArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
          const rArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
          if (lArm) lArm.rotation.z = 0.6;
          if (rArm) rArm.rotation.z = -0.6;
        } catch { /* bone not found */ }
        setLoaded(true);
      })
      .catch((err) => {
        console.warn("VRM load failed:", err);
        if (!disposed) setError(true);
      });

    return () => {
      disposed = true;
      if (vrmRef.current?.scene) {
        import("@pixiv/three-vrm").then(({ VRMUtils }) => {
          VRMUtils.deepDispose(vrmRef.current.scene);
        }).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    vrm.scene.traverse((obj: THREE.Object3D) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mats.forEach((m: any) => {
        if (obj.name.toLowerCase().includes("hair") && m?.color) {
          m.color.set(hairColor);
        }
      });
    });
  }, [hairColor, loaded]);

  useFrame((_, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    const t = performance.now() / 1000;
    try {
      const chest = vrm.humanoid.getNormalizedBoneNode("chest");
      if (chest) chest.rotation.x = Math.sin(t * 0.8) * 0.015;
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        head.rotation.y = Math.sin(t * 0.3) * 0.04;
        head.rotation.x = -0.05 + Math.sin(t * 0.5) * 0.015;
      }
      if (vrm.expressionManager) {
        vrm.expressionManager.setValue("blink", (t % 4) < 0.12 ? 1 : 0);
        vrm.expressionManager.update();
      }
    } catch { /* expression not available */ }
    vrm.update(delta);
  });

  if (error) {
    return (
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
    );
  }

  return (
    <>
      <group ref={groupRef} />
      {!loaded && (
        <mesh position={[0, 1, 0]}>
          <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
          <meshStandardMaterial color="#d4d4d4" wireframe />
        </mesh>
      )}
    </>
  );
}

interface Props {
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  gender: string;
}

export default function VRMPreviewCanvas({ hairColor }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 1.1, 2.2], fov: 28 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[1, 3, 2]} intensity={1.2} />
      <directionalLight position={[-1, 1, -1]} intensity={0.4} color="#c4d4ff" />
      <VRMScene hairColor={hairColor} />
      <OrbitControls
        target={[0, 1.0, 0]}
        enablePan={false}
        minDistance={1.2}
        maxDistance={3.5}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.75}
      />
    </Canvas>
  );
}
