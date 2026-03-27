"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface VRMViewerProps {
  gender: "female" | "male";
  customImageUrl?: string;
  isActive?: boolean;
  isDancing?: boolean;
  width?: number;
  height?: number;
}

function SilhouetteFallback({
  width,
  height,
  gender,
}: {
  width: number;
  height: number;
  gender: "female" | "male";
}) {
  const headSize = Math.round(width * 0.35);
  const bodyWidth = Math.round(width * 0.5);
  const bodyHeight = Math.round(height * 0.45);
  const bodyColor = gender === "female" ? "#6b5b7b" : "#5b6b7b";

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width, height }}
    >
      <div
        className="rounded-full"
        style={{
          width: headSize,
          height: headSize,
          backgroundColor: "#9ca3af",
        }}
      />
      <div
        className="mt-1 rounded-md"
        style={{
          width: bodyWidth,
          height: bodyHeight,
          backgroundColor: bodyColor,
        }}
      />
    </div>
  );
}

function SkeletonPlaceholder({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const headSize = Math.round(width * 0.35);
  const bodyWidth = Math.round(width * 0.5);
  const bodyHeight = Math.round(height * 0.45);

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width, height }}
    >
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
      <div
        className="rounded-full"
        style={{
          width: headSize,
          height: headSize,
          backgroundColor: "#6b7280",
          animation: "skeletonPulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        className="mt-1 rounded-md"
        style={{
          width: bodyWidth,
          height: bodyHeight,
          backgroundColor: "#4b5563",
          animation: "skeletonPulse 1.5s ease-in-out infinite 0.2s",
        }}
      />
    </div>
  );
}

export default function VRMViewer({
  gender,
  customImageUrl,
  isActive = false,
  isDancing = false,
  width = 80,
  height = 140,
}: VRMViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  const frameIdRef = useRef<number>(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const cleanup = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = 0;
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (customImageUrl) {
      setStatus("ready");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    async function initVRM() {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import(
          "three/examples/jsm/loaders/GLTFLoader.js"
        );
        const { VRMLoaderPlugin } = await import("@pixiv/three-vrm");

        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({
          canvas: canvas!,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = renderer;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
          45,
          width / height,
          0.1,
          20
        );
        camera.position.set(0, 0.75, 3.2);
        camera.lookAt(0, 0.75, 0);

        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(0.5, 1.5, 2);
        scene.add(directional);

        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        const modelPath =
          gender === "female"
            ? "/models/female_casual.vrm"
            : "/models/male_casual.vrm";

        const gltf = await loader.loadAsync(modelPath);
        if (cancelled) return;

        const vrm = gltf.userData.vrm;
        if (!vrm) {
          throw new Error("VRM data not found in loaded model");
        }

        vrm.scene.rotation.y = Math.PI;
        scene.add(vrm.scene);

        // T-포즈 해제 — 팔을 자연스럽게 내림
        const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
        const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
        if (leftUpperArm) leftUpperArm.rotation.z = 1.2;
        if (rightUpperArm) rightUpperArm.rotation.z = -1.2;

        // 손가락 본 지원 여부 확인 후 자연스럽게 모아주기
        const fingerBones = [
          'leftIndexProximal', 'leftMiddleProximal', 'leftRingProximal', 'leftLittleProximal',
          'rightIndexProximal', 'rightMiddleProximal', 'rightRingProximal', 'rightLittleProximal',
        ];
        fingerBones.forEach((boneName) => {
          const bone = vrm.humanoid.getNormalizedBoneNode(boneName);
          if (bone) bone.rotation.z = boneName.startsWith('left') ? -0.3 : 0.3;
        });
        console.log('VRM finger bones support:', fingerBones.map((b) => ({
          name: b,
          supported: !!vrm.humanoid.getNormalizedBoneNode(b),
        })));

        const clock = new THREE.Clock();
        const animate = () => {
          if (cancelled) return;
          frameIdRef.current = requestAnimationFrame(animate);
          const delta = clock.getDelta();
          if (vrm.update) vrm.update(delta);
          renderer.render(scene, camera);
        };
        animate();

        setStatus("ready");
      } catch (err) {
        console.warn("[VRMViewer] Load failed:", err);
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    initVRM();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [gender, customImageUrl, width, height, cleanup]);

  const animationClass = isDancing
    ? "vrm-dance"
    : isActive
      ? "vrm-float"
      : "";

  return (
    <div className="relative inline-block" style={{ width, height }}>
      <style>{`
        @keyframes vrmFloat {
          0%, 100% { transform: translateY(3px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes vrmDance {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(2deg); }
          50% { transform: translateY(2px) rotate(0deg); }
          75% { transform: translateY(-4px) rotate(-2deg); }
        }
        .vrm-float { animation: vrmFloat 2s ease-in-out infinite; }
        .vrm-dance { animation: vrmDance 0.4s ease-in-out infinite; }
      `}</style>

      <div className={animationClass}>
        {customImageUrl ? (
          <img
            src={customImageUrl}
            alt={`${gender} idol`}
            className="rounded-lg object-cover"
            style={{ width, height }}
          />
        ) : (
          <>
            {status === "loading" && (
              <SkeletonPlaceholder width={width} height={height} />
            )}

            {status === "error" && (
              <SilhouetteFallback
                width={width}
                height={height}
                gender={gender}
              />
            )}

            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              style={{
                width,
                height,
                display: status === "ready" ? "block" : "none",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
