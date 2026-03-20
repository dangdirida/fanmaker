"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Camera, CameraOff, ArrowLeft } from "lucide-react";

interface IdolData {
  name: string;
  hairColor: string;
}

export default function WebcamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [idol, setIdol] = useState<IdolData | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [cameraOn, setCameraOn] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch(`/api/virtual-idols/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setIdol(d.data); });
  }, [id]);

  const startExperience = async () => {
    if (!mountRef.current || !videoRef.current) return;
    setStatus("loading");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraOn(true);

      const THREE = await import("three");
      const container = mountRef.current;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 1.3, 2.5);
      camera.lookAt(0, 1.2, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 1.8));
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(1, 3, 2);
      scene.add(dir);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let vrm: any = null;
      try {
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");
        vrm = await new Promise((resolve, reject) => {
          const loader = new GLTFLoader();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          loader.register((p: any) => new VRMLoaderPlugin(p));
          loader.load("/models/base_female.vrm",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (g: any) => g.userData.vrm ? resolve(g.userData.vrm) : reject(new Error("no vrm")),
            undefined, reject
          );
        });
        VRMUtils.rotateVRM0(vrm);
        try {
          const la = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
          const ra = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
          if (la) la.rotation.z = 0.5;
          if (ra) ra.rotation.z = -0.5;
        } catch { /* ok */ }
        scene.add(vrm.scene);
      } catch (e) {
        console.warn("VRM load failed:", e);
        const geo = new THREE.CapsuleGeometry(0.2, 1, 8, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0x8B5CF6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 1, 0);
        scene.add(mesh);
      }

      // KalidoKit 얼굴 추적
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let kalidokit: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let faceLandmarker: any = null;
      try {
        kalidokit = await import("kalidokit");

        // MediaPipe Vision Tasks (최신 API)
        const vision = await import("@mediapipe/tasks-vision").catch(() => null);
        if (vision) {
          const { FaceLandmarker, FilesetResolver } = vision;
          const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          );
          faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task" },
            runningMode: "VIDEO",
            numFaces: 1,
          });
        }
      } catch (e) {
        console.warn("Face tracking setup failed:", e);
      }

      let frameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const t = clock.getElapsedTime();

        // 얼굴 추적 적용
        if (faceLandmarker && videoRef.current && videoRef.current.readyState >= 2 && vrm) {
          try {
            const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());
            if (results?.faceLandmarks?.[0] && kalidokit) {
              const face = kalidokit.Face.solve(results.faceLandmarks[0], {
                runtime: "mediapipe",
                video: videoRef.current,
              });
              if (face) {
                const head = vrm.humanoid.getNormalizedBoneNode("head");
                if (head && face.head) {
                  head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, face.head.x * 0.7, 0.3);
                  head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, -face.head.y * 0.7, 0.3);
                  head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, face.head.z * 0.5, 0.3);
                }
                if (vrm.expressionManager && face.eye) {
                  vrm.expressionManager.setValue("blinkLeft", Math.max(0, Math.min(1, 1 - (face.eye.l ?? 1))));
                  vrm.expressionManager.setValue("blinkRight", Math.max(0, Math.min(1, 1 - (face.eye.r ?? 1))));
                }
                if (vrm.expressionManager && face.mouth) {
                  vrm.expressionManager.setValue("aa", Math.max(0, Math.min(1, (face.mouth.y ?? 0) * 3)));
                }
                vrm.expressionManager?.update();
              }
            }
          } catch { /* tracking frame error */ }
        }

        // 기본 숨쉬기
        if (vrm) {
          try {
            const chest = vrm.humanoid.getNormalizedBoneNode("chest");
            if (chest) chest.rotation.x = Math.sin(t * 0.8) * 0.012;
          } catch { /* ok */ }
          vrm.update(delta);
        }

        renderer.render(scene, camera);
      };
      animate();
      setStatus("ready");

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      cleanupRef.current = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleResize);
        stream.getTracks().forEach((t) => t.stop());
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        faceLandmarker?.close();
      };
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  useEffect(() => {
    return () => { cleanupRef.current?.(); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={() => { cleanupRef.current?.(); router.back(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-xl text-sm hover:bg-white/20 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
        {idol && (
          <div className="px-4 py-2 bg-white/10 backdrop-blur text-white rounded-xl text-sm font-bold">
            {idol.name}
          </div>
        )}
        {cameraOn && (
          <button
            onClick={() => { cleanupRef.current?.(); setCameraOn(false); setStatus("idle"); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur text-white rounded-xl text-sm hover:bg-red-600 transition"
          >
            <CameraOff className="w-4 h-4" />
            카메라 끄기
          </button>
        )}
      </div>

      {/* 웹캠 PIP */}
      <video
        ref={videoRef}
        className={`absolute bottom-6 right-6 w-32 h-24 rounded-xl object-cover opacity-60 z-10 scale-x-[-1] ${cameraOn ? "" : "hidden"}`}
        muted
        playsInline
      />

      {/* 3D 뷰어 */}
      <div ref={mountRef} className="flex-1 relative" />

      {/* 시작 오버레이 */}
      {status === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/70 backdrop-blur-sm">
          <div className="text-center space-y-6 max-w-sm px-6">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold mb-2">
                {idol?.name || "버추얼 아이돌"} 체험
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                카메라를 허용하면 내 표정과 고개 움직임을<br />
                버추얼 아이돌이 실시간으로 따라해요
              </p>
            </div>
            <button
              onClick={startExperience}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold text-base hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              카메라 켜고 체험하기
            </button>
            <p className="text-white/30 text-xs">카메라 데이터는 서버에 전송되지 않아요</p>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/80">
          <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
          <p className="text-white text-sm">캐릭터와 얼굴 추적을 준비하고 있어요...</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/80">
          <p className="text-white text-base mb-4">카메라 접근에 실패했어요</p>
          <button onClick={() => setStatus("idle")} className="px-6 py-3 bg-white text-black rounded-xl text-sm font-medium">
            다시 시도
          </button>
        </div>
      )}

      {status === "ready" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur text-white/80 rounded-full text-xs">
            고개를 움직이면 캐릭터가 따라해요
          </div>
        </div>
      )}
    </div>
  );
}
