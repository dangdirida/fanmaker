"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  gender: string;
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  width?: number;
  height?: number;
}

export default function VRMStaticPreview({
  gender, hairColor, skinTone, eyeColor,
  width = 280, height = 380,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;

    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

        const canvas = canvasRef.current!;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(width * 2, height * 2);
        renderer.setPixelRatio(2);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
        camera.position.set(0, 1.0, 3.2);
        camera.lookAt(0, 0.9, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 2.0));
        const dir = new THREE.DirectionalLight(0xfff0e0, 1.4);
        dir.position.set(1, 3, 2);
        scene.add(dir);
        const fill = new THREE.DirectionalLight(0xc4d4ff, 0.5);
        fill.position.set(-2, 1, 1);
        scene.add(fill);

        const modelUrl = gender === "male" ? "/models/base_male.vrm" : "/models/base_female.vrm";

        const loader = new GLTFLoader();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loader.register((parser: any) => new VRMLoaderPlugin(parser));
        loader.load(modelUrl, (gltf) => {
          if (disposed) return;
          const vrm = gltf.userData.vrm;
          if (!vrm) { setStatus("error"); return; }

          VRMUtils.rotateVRM0(vrm);
          vrm.scene.rotation.y = Math.PI;
          vrm.scene.position.y = -0.1;

          // 색상 적용
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vrm.scene.traverse((obj: any) => {
            if (!(obj instanceof THREE.Mesh)) return;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mats.forEach((m: any) => {
              if (!m?.name || !m.color) return;
              if (m.name.includes("HairBack_00_HAIR")) m.color.set(hairColor);
              if (m.name.includes("Face_00_SKIN") || m.name.includes("Body_00_SKIN")) m.color.set(skinTone);
              if (m.name.includes("EyeIris_00_EYE")) m.color.set(eyeColor);
            });
          });

          // 팔 자연스럽게
          try {
            const la = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
            const ra = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
            if (la) la.rotation.z = 0.5;
            if (ra) ra.rotation.z = -0.5;
          } catch { /* ok */ }

          scene.add(vrm.scene);
          vrm.update(0);

          // 여러 프레임 렌더링 (텍스처 완전히 로드될 때까지)
          let frames = 0;
          const renderLoop = () => {
            if (disposed || frames > 30) {
              setStatus("ready");
              return;
            }
            vrm.update(1/60);
            renderer.render(scene, camera);
            frames++;
            requestAnimationFrame(renderLoop);
          };
          renderLoop();
        }, undefined, () => {
          if (!disposed) setStatus("error");
        });
      } catch {
        if (!disposed) setStatus("error");
      }
    })();

    return () => { disposed = true; };
  }, [gender, hairColor, skinTone, eyeColor, width, height]);

  return (
    <div className="relative" style={{ width, height }}>
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 rounded-xl">
          <div className="w-8 h-8 border-2 border-cyan-300 border-t-cyan-600 rounded-full animate-spin" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 rounded-xl">
          <span className="text-xs text-gray-400">캐릭터를 불러올 수 없어요</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width * 2}
        height={height * 2}
        style={{
          width, height,
          opacity: status === "ready" ? 1 : 0,
          transition: "opacity 0.4s ease",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}
