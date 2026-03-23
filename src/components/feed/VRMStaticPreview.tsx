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
  width = 200,
  height = 300,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!mountRef.current) return;
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any = null;

    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

        if (disposed) return;

        const container = mountRef.current!;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
        camera.position.set(0, 1.0, 2.8);
        camera.lookAt(0, 0.9, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 2.2));
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

        loader.load(
          modelUrl,
          (gltf) => {
            if (disposed) return;
            const vrm = gltf.userData.vrm;
            if (!vrm) { setStatus("error"); return; }

            VRMUtils.rotateVRM0(vrm);
            vrm.scene.rotation.y = Math.PI;
            vrm.scene.position.y = -0.05;

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

            // 여러 프레임 렌더링 후 status ready
            let frame = 0;
            const renderLoop = () => {
              if (disposed) return;
              vrm.update(1 / 60);
              renderer.render(scene, camera);
              frame++;
              if (frame < 20) {
                requestAnimationFrame(renderLoop);
              } else {
                if (!disposed) setStatus("ready");
              }
            };
            requestAnimationFrame(renderLoop);
          },
          undefined,
          (err: unknown) => {
            console.error("VRM load error:", err);
            if (!disposed) setStatus("error");
          }
        );
      } catch (err) {
        console.error("VRMStaticPreview error:", err);
        if (!disposed) setStatus("error");
      }
    })();

    return () => {
      disposed = true;
      if (renderer && mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, hairColor, skinTone, eyeColor]);

  return (
    <div
      style={{ width, height, position: "relative", borderRadius: "12px", overflow: "hidden" }}
    >
      {/* 배경 */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)",
          borderRadius: "12px",
        }}
      />
      {/* 로딩 */}
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "3px solid #bfdbfe",
            borderTopColor: "#3b82f6",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      )}
      {/* 에러 */}
      {status === "error" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>캐릭터 로드 실패</span>
        </div>
      )}
      {/* Three.js 렌더러 마운트 포인트 */}
      <div
        ref={mountRef}
        style={{
          position: "absolute", inset: 0,
          opacity: status === "ready" ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
