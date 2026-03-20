"use client";

import { useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, VRM, VRMHumanBoneName } from "@pixiv/three-vrm";

interface VRMModelProps {
  url: string;
  hairColor: string;
}

function VRMModel({ url, hairColor }: VRMModelProps) {
  const vrmRef = useRef<VRM | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  useEffect(() => {
    const vrm: VRM | undefined = gltf?.userData?.vrm;
    if (!vrm) return;
    vrmRef.current = vrm;

    VRMUtils.rotateVRM0(vrm);

    // T-pose -> A-pose
    const la = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm);
    const ra = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm);
    if (la) la.rotation.z = Math.PI / 5;
    if (ra) ra.rotation.z = -Math.PI / 5;

    // 머리카락 색상
    vrm.scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh) || !obj.material) return;
      const name = (obj.name || "").toLowerCase();
      if (name.includes("hair") || name.includes("髪")) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m.color) m.color.set(hairColor);
        });
      }
    });

    return () => {
      VRMUtils.deepDispose(vrm.scene);
    };
  }, [gltf, hairColor]);

  useFrame((_state, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;

    const t = clockRef.current.getElapsedTime();

    // 숨쉬기
    const chest = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest);
    if (chest) chest.rotation.x = Math.sin(t * 0.8) * 0.015;

    // 고개 미세 움직임
    const head = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
    if (head) {
      head.rotation.y = Math.sin(t * 0.3) * 0.05;
      head.rotation.x = Math.sin(t * 0.5) * 0.02 - 0.05;
    }

    // 눈깜빡임
    if (vrm.expressionManager) {
      const blink = t % 3.5 < 0.15 ? 1 : 0;
      vrm.expressionManager.setValue("blink", blink);
      vrm.expressionManager.setValue("blinkLeft", blink);
      vrm.expressionManager.setValue("blinkRight", blink);
      vrm.expressionManager.update();
    }

    vrm.update(delta);
  });

  if (!gltf?.userData?.vrm) return null;
  return <primitive object={gltf.userData.vrm.scene} />;
}

function FallbackSphere() {
  return (
    <mesh position={[0, 0.8, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color="#e5e7eb" />
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
  const modelUrl = "/models/base_female.vrm";

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.2, 2.5], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[1, 2, 2]} intensity={1.5} />
        <directionalLight position={[-1, 1, -1]} intensity={0.4} color="#b4c8ff" />

        <Suspense fallback={<FallbackSphere />}>
          <VRMModel url={modelUrl} hairColor={hairColor} />
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.3}
            scale={3}
            blur={2}
          />
        </Suspense>

        <OrbitControls
          target={[0, 1.0, 0]}
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
