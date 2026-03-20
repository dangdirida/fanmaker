"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, Maximize2, Download } from "lucide-react";
import Script from "next/script";

interface VRMExperienceProps {
  vrmUrl: string;
}

export default function VRMExperience({ vrmUrl }: VRMExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vrmRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const holisticRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false);
  const [vrmLoaded, setVrmLoaded] = useState(false);

  // Three.js + VRM 씬 초기화
  const initScene = useCallback(async () => {
    if (!canvasRef.current || !containerRef.current) return;

    const THREE = await import("three");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 1.3, 2.5);
    camera.lookAt(0, 1.0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 2, 3);
    scene.add(dirLight);

    // VRM 로드
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    try {
      const gltf = await loader.loadAsync(vrmUrl);
      const vrm = gltf.userData.vrm;
      if (!vrm) return;
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.removeUnnecessaryJoints(gltf.scene);
      vrm.scene.rotation.y = Math.PI;
      scene.add(vrm.scene);
      vrmRef.current = vrm;
      setVrmLoaded(true);
    } catch (err) {
      console.error("VRM load failed:", err);
      return;
    }

    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (vrmRef.current) vrmRef.current.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
    };
  }, [vrmUrl]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initScene().then((fn) => {
      cleanup = fn;
    });
    return () => {
      cancelAnimationFrame(frameRef.current);
      cleanup?.();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [initScene]);

  // VRM 뼈대에 트래킹 결과 적용
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rigFace = useCallback((vrm: any, faceRig: any) => {
    if (!vrm?.humanoid || !faceRig) return;
    const head = vrm.humanoid.getNormalizedBoneNode("head");
    if (head && faceRig.head) {
      head.rotation.x = faceRig.head.x * 0.5;
      head.rotation.y = faceRig.head.y * 0.5;
      head.rotation.z = faceRig.head.z * 0.3;
    }
    if (vrm.expressionManager && faceRig.mouth) {
      vrm.expressionManager.setValue("aa", faceRig.mouth.shape.A || 0);
      vrm.expressionManager.setValue("oh", faceRig.mouth.shape.O || 0);
    }
    if (vrm.expressionManager && faceRig.eye) {
      vrm.expressionManager.setValue("blink", 1 - (faceRig.eye.l || 1));
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rigPose = useCallback((vrm: any, poseRig: any) => {
    if (!vrm?.humanoid || !poseRig) return;

    const applyRotation = (boneName: string, rotation: { x: number; y: number; z: number } | undefined) => {
      if (!rotation) return;
      const bone = vrm.humanoid.getNormalizedBoneNode(boneName);
      if (bone) {
        bone.rotation.x = rotation.x * 0.5;
        bone.rotation.y = rotation.y * 0.5;
        bone.rotation.z = rotation.z * 0.5;
      }
    };

    if (poseRig.Spine) applyRotation("spine", poseRig.Spine);
    if (poseRig.RightUpperArm) applyRotation("rightUpperArm", poseRig.RightUpperArm);
    if (poseRig.LeftUpperArm) applyRotation("leftUpperArm", poseRig.LeftUpperArm);
    if (poseRig.RightLowerArm) applyRotation("rightLowerArm", poseRig.RightLowerArm);
    if (poseRig.LeftLowerArm) applyRotation("leftLowerArm", poseRig.LeftLowerArm);
  }, []);

  // 웹캠 + MediaPipe 시작
  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      streamRef.current = stream;
      setCameraOn(true);

      // MediaPipe Holistic 초기화
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = (window as any);
      if (!mp.Holistic) {
        console.warn("MediaPipe not loaded yet");
        return;
      }

      const Kalidokit = await import("kalidokit");

      const holistic = new mp.Holistic({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5/${file}`,
      });
      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      holistic.onResults((results: any) => {
        if (!vrmRef.current) return;
        const vrm = vrmRef.current;

        if (results.faceLandmarks) {
          const faceRig = Kalidokit.Face.solve(results.faceLandmarks, {
            runtime: "mediapipe",
            video: videoRef.current!,
          });
          rigFace(vrm, faceRig);
        }

        if (results.poseLandmarks) {
          const poseRig = Kalidokit.Pose.solve(
            results.ea,
            results.poseLandmarks,
            { runtime: "mediapipe", video: videoRef.current! }
          );
          rigPose(vrm, poseRig);
        }
      });

      holisticRef.current = holistic;

      // 프레임 전송
      const sendFrame = async () => {
        if (!videoRef.current || !cameraOn) return;
        if (holisticRef.current) {
          await holisticRef.current.send({ image: videoRef.current });
        }
        requestAnimationFrame(sendFrame);
      };
      sendFrame();
    } catch (err) {
      console.error("Camera error:", err);
      alert("카메라 권한을 허용해주세요.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (holisticRef.current) {
      holisticRef.current.close();
      holisticRef.current = null;
    }
    setCameraOn(false);
  };

  const captureScreenshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "virtual-idol-screenshot.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* MediaPipe CDN 로드 */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5/holistic.js"
        onLoad={() => setMediapipeLoaded(true)}
        strategy="lazyOnload"
      />

      <div className="relative">
        <div
          ref={containerRef}
          className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200"
          style={{ height: "65vh", minHeight: 400 }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
          {!vrmLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 웹캠 PIP */}
        {cameraOn && (
          <div className="absolute bottom-4 left-4 w-40 h-30 rounded-xl overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        )}

        {/* 숨겨진 비디오 (카메라 Off 시) */}
        {!cameraOn && (
          <video ref={videoRef} className="hidden" playsInline muted />
        )}
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-3">
        {!cameraOn ? (
          <button
            onClick={startCamera}
            disabled={!vrmLoaded || !mediapipeLoaded}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            <Camera className="w-4 h-4" />
            웹캠 시작
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all"
          >
            <CameraOff className="w-4 h-4" />
            웹캠 중지
          </button>
        )}

        <button
          onClick={captureScreenshot}
          disabled={!vrmLoaded}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-all"
        >
          <Maximize2 className="w-4 h-4" />
          스크린샷
        </button>

        <button
          onClick={() => {
            const a = document.createElement("a");
            a.href = vrmUrl;
            a.download = "virtual-idol.vrm";
            a.click();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
        >
          <Download className="w-4 h-4" />
          VRM 다운로드
        </button>

        {!mediapipeLoaded && (
          <span className="text-xs text-gray-400 ml-auto">
            MediaPipe 로딩 중...
          </span>
        )}
      </div>
    </div>
  );
}
