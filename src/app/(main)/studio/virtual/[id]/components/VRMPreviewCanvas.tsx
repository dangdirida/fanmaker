"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { GLTFLoader } from "three-stdlib";
import { VRMLoaderPlugin, VRMUtils, VRM, VRMHumanBoneName } from "@pixiv/three-vrm";
import * as THREE from "three";

function VRMAvatar({ url, hairColor }: { url: string; hairColor: string }) {
  const vrmRef = useRef<VRM | null>(null);

  const gltf = useLoader(GLTFLoader, url, (loader: GLTFLoader) => {
    // @ts-expect-error three-stdlib GLTFParser vs @types/three GLTFParser 타입 불일치
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  useEffect(() => {
    const vrm = gltf?.userData?.vrm as VRM | undefined;
    if (!vrm) return;
    vrmRef.current = vrm;
    VRMUtils.rotateVRM0(vrm);

    const lArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm);
    const rArm = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm);
    if (lArm) lArm.rotation.z = 0.6;
    if (rArm) rArm.rotation.z = -0.6;

    vrm.scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        const n = obj.name.toLowerCase();
        if ((n.includes("hair") || n.includes("髪")) && "color" in m && m.color instanceof THREE.Color) {
          m.color.set(hairColor);
        }
      });
    });

    return () => VRMUtils.deepDispose(vrm.scene);
  }, [gltf, hairColor]);

  useFrame((_, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    const t = performance.now() / 1000;

    const chest = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest);
    if (chest) chest.rotation.x = Math.sin(t * 0.8) * 0.015;

    const head = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
    if (head) {
      head.rotation.y = Math.sin(t * 0.3) * 0.04;
      head.rotation.x = -0.05 + Math.sin(t * 0.5) * 0.015;
    }

    if (vrm.expressionManager) {
      const blink = (t % 4) < 0.12 ? 1 : 0;
      vrm.expressionManager.setValue("blink", blink);
      vrm.expressionManager.update();
    }

    vrm.update(delta);
  });

  const vrm = gltf?.userData?.vrm as VRM | undefined;
  if (!vrm) return null;
  return <primitive object={vrm.scene} />;
}

function LoadingFallback() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#e0e0e0" wireframe />
    </mesh>
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
      <directionalLight position={[-1, 1, -1]} intensity={0.3} color="#c4d4ff" />

      <Suspense fallback={<LoadingFallback />}>
        <VRMAvatar url="/models/base_female.vrm" hairColor={hairColor} />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.25} scale={4} blur={2.5} />
      </Suspense>

      <OrbitControls
        target={[0, 1.0, 0]}
        enablePan={false}
        minDistance={1.2}
        maxDistance={3.5}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.7}
      />
    </Canvas>
  );
}
