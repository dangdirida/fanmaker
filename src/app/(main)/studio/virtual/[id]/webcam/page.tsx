"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Camera, CameraOff } from "lucide-react";

interface IdolData {
  id: string;
  name: string;
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  gender: string;
}

export default function WebcamExperiencePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [idol, setIdol] = useState<IdolData | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch(`/api/virtual-idols/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setIdol(d.data); });
  }, [id]);

  const startExperience = useCallback(async () => {
    if (!mountRef.current || !videoRef.current || !idol) return;
    setStatus("loading");

    try {
      // 카메라
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
      await new Promise<void>((res) => { video.oncanplay = () => res(); });

      // Three.js
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

      const container = mountRef.current!;
      const W = container.clientWidth;
      const H = container.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x1a1a2e);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 3, 8);

      const camera = new THREE.PerspectiveCamera(28, W / H, 0.1, 100);
      camera.position.set(0, 1.4, 2.0);
      camera.lookAt(0, 1.35, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 1.8));
      const key = new THREE.DirectionalLight(0xfff0e0, 1.4);
      key.position.set(1, 3, 2);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xc4d4ff, 0.5);
      fill.position.set(-2, 1, 1);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xff69b4, 0.3);
      rim.position.set(0, 2, -2);
      scene.add(rim);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1.35, 0);
      controls.enablePan = false;
      controls.minDistance = 0.8;
      controls.maxDistance = 4;
      controls.enableDamping = true;

      // VRM 로드
      const modelUrl = idol.gender === "male" ? "/models/base_male.vrm" : "/models/base_female.vrm";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let vrm: any = null;

      await new Promise<void>((resolve, reject) => {
        const loader = new GLTFLoader();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loader.register((parser: any) => new VRMLoaderPlugin(parser));
        loader.load(modelUrl, (gltf) => {
          vrm = gltf.userData.vrm;
          if (!vrm) { reject(new Error("VRM not found")); return; }
          VRMUtils.rotateVRM0(vrm);
          vrm.scene.rotation.y = Math.PI;
          vrm.scene.position.y = 0.1;
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.removeUnnecessaryJoints(gltf.scene);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vrm.scene.traverse((obj: any) => {
            if (!(obj instanceof THREE.Mesh)) return;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mats.forEach((m: any) => {
              if (!m?.name) return;
              if (m.name.includes("HairBack_00_HAIR") && m.color) m.color.set(idol.hairColor);
              if ((m.name.includes("Face_00_SKIN") || m.name.includes("Body_00_SKIN")) && m.color) m.color.set(idol.skinTone);
              if (m.name.includes("EyeIris_00_EYE") && m.color) m.color.set(idol.eyeColor);
            });
          });

          scene.add(vrm.scene);
          // SpringBone warmup
          for (let i = 0; i < 60; i++) vrm.update(1 / 60);
          resolve();
        }, undefined, reject);
      });

      // MediaPipe FaceMesh CDN
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let solveFace: ((landmarks: any, options: any) => any) | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let faceMeshInstance: any = null;

      try {
        const Kalidokit = await import("kalidokit");
        solveFace = Kalidokit.Face.solve;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await new Promise<void>((res, rej) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any).FaceMesh) { res(); return; }
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js";
          s.crossOrigin = "anonymous";
          s.onload = () => res();
          s.onerror = () => rej(new Error("FaceMesh CDN failed"));
          document.head.appendChild(s);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const FM = (window as any).FaceMesh;
        faceMeshInstance = new FM({
          locateFile: (f: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${f}`,
        });
        faceMeshInstance.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        faceMeshInstance.onResults((results: any) => {
          if (!vrm || !results.multiFaceLandmarks?.[0] || !solveFace) return;
          try {
            const face = solveFace(results.multiFaceLandmarks[0], {
              runtime: "mediapipe",
              video: videoRef.current!,
              imageSize: { width: 640, height: 480 },
              smoothBlink: true,
              blinkSettings: [0.25, 0.75],
            });
            if (!face) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!(window as any).__faceDebug) {
              console.log("FACE STRUCTURE:", JSON.stringify(face, null, 2).substring(0, 500));
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).__faceDebug = true;
            }
            const head = vrm.humanoid.getNormalizedBoneNode("head");
            const neck = vrm.humanoid.getNormalizedBoneNode("neck");
            if (head && face.head) {
              const hx = face.head?.x ?? 0;
              const hy = face.head?.y ?? 0;
              const hz = face.head?.z ?? 0;
              head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, hx * 0.8, 0.35);
              head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, -hy * 0.8, 0.35);
              head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, hz * 0.6, 0.35);
            }
            if (neck && face.head) {
              const hx = face.head?.x ?? 0;
              const hy = face.head?.y ?? 0;
              neck.rotation.x = THREE.MathUtils.lerp(neck.rotation.x, hx * 0.2, 0.3);
              neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, -hy * 0.2, 0.3);
            }
            if (vrm.expressionManager && face.eye) {
              vrm.expressionManager.setValue("blinkLeft", Math.max(0, Math.min(1, 1 - (face.eye.l ?? 1))));
              vrm.expressionManager.setValue("blinkRight", Math.max(0, Math.min(1, 1 - (face.eye.r ?? 1))));
              vrm.expressionManager.update();
            }
            if (vrm.expressionManager && face.mouth) {
              vrm.expressionManager.setValue("aa", Math.max(0, Math.min(1, (face.mouth.y ?? 0) * 2.5)));
              vrm.expressionManager.update();
            }
          } catch { /* ok */ }
        });
      } catch (e) {
        console.warn("FaceMesh load failed:", e);
      }

      // 애니메이션 루프
      let frameId = 0;
      let lastFaceMs = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        clock.getElapsedTime(); // keep clock running
        const now = performance.now();

        // 30fps 얼굴 추적
        if (faceMeshInstance && videoRef.current && videoRef.current.readyState >= 2 && now - lastFaceMs > 33) {
          lastFaceMs = now;
          faceMeshInstance.send({ image: videoRef.current }).catch(() => {});
        }

        if (vrm) {
          vrm.update(delta);
        }
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", onResize);

      setStatus("ready");

      cleanupRef.current = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        stream.getTracks().forEach((t) => t.stop());
        try { faceMeshInstance?.close(); } catch { /* ok */ }
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.includes("Permission") ? "카메라 권한을 허용해주세요" : "로드에 실패했습니다");
      setStatus("error");
    }
  }, [idol]);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
        <button onClick={() => { cleanupRef.current?.(); router.back(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm font-medium hover:bg-white/20 transition">
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </button>
        {idol && (
          <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm font-bold">
            {idol.name}
          </span>
        )}
        {status === "ready" && (
          <button onClick={() => { cleanupRef.current?.(); cleanupRef.current = null; setStatus("idle"); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-md text-white rounded-xl text-sm hover:bg-red-600 transition">
            <CameraOff className="w-4 h-4" /> 종료
          </button>
        )}
      </div>

      {/* 3D 뷰어 */}
      <div ref={mountRef} className="flex-1" />

      {/* 웹캠 PIP */}
      {status === "ready" && (
        <div className="absolute bottom-20 right-5 z-20">
          <div className="relative w-36 h-28 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
            <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline autoPlay />
            <div className="absolute bottom-1 right-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {status !== "ready" && <video ref={videoRef} className="hidden" muted playsInline />}

      {/* 시작 오버레이 */}
      {status === "idle" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center space-y-8 max-w-sm px-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Camera className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-white text-2xl font-extrabold mb-3">
                {idol?.name || "버추얼 아이돌"} 체험
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                카메라를 허용하면<br />
                내 표정과 고개 움직임을<br />
                <span className="text-purple-300 font-semibold">버추얼 아이돌이 실시간으로 따라해요</span>
              </p>
            </div>
            <button onClick={startExperience}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-base hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3">
              <Camera className="w-5 h-5" /> 카메라 켜고 체험하기
            </button>
            <p className="text-white/20 text-xs">카메라 데이터는 서버에 전송되지 않아요</p>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          <p className="text-white font-medium mt-4">캐릭터 준비 중...</p>
          <p className="text-white/40 text-sm mt-1">얼굴 추적 모델 로딩 중</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
          <div className="text-center space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <CameraOff className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white text-base font-medium">{errorMsg || "오류가 발생했습니다"}</p>
            <button onClick={() => setStatus("idle")}
              className="px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition">
              다시 시도
            </button>
          </div>
        </div>
      )}

      {status === "ready" && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white/70 rounded-full text-xs font-medium">
            고개를 움직이면 캐릭터가 따라해요 · 드래그로 시점 변경
          </div>
        </div>
      )}
    </div>
  );
}
