"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Camera, CameraOff } from "lucide-react";

interface IdolData {
  id: string; name: string;
  hairColor: string; skinTone: string; eyeColor: string; gender: string;
}

export default function WebcamExperiencePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [idol, setIdol] = useState<IdolData | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadingMsg, setLoadingMsg] = useState("준비 중...");
  const [errorMsg, setErrorMsg] = useState("");
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch(`/api/virtual-idols/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setIdol(d.data); });
  }, [id]);

  const startExperience = useCallback(async () => {
    if (!mountRef.current || !videoRef.current || !idol) return;
    setStatus("loading");

    try {
      // ── 1. 카메라 ──
      setLoadingMsg("카메라 연결 중...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }, audio: false,
      });
      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      await new Promise<void>(res => {
        if (video.readyState >= 2) { res(); return; }
        video.oncanplay = () => res();
      });

      // ── 2. Three.js 씬 ──
      setLoadingMsg("3D 씬 초기화 중...");
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

      const container = mountRef.current!;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x1a1a2e);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      const camera = new THREE.PerspectiveCamera(28, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 1.45, 1.9);
      camera.lookAt(0, 1.4, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 2.0));
      const key = new THREE.DirectionalLight(0xfff0e0, 1.4);
      key.position.set(1, 3, 2); scene.add(key);
      const fill = new THREE.DirectionalLight(0xc4d4ff, 0.5);
      fill.position.set(-2, 1, 1); scene.add(fill);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1.4, 0);
      controls.enablePan = false;
      controls.minDistance = 0.8;
      controls.maxDistance = 4;
      controls.enableDamping = true;

      // ── 3. VRM 로드 ──
      setLoadingMsg("캐릭터 로딩 중...");
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
          // 색상 적용
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vrm.scene.traverse((obj: any) => {
            if (!(obj instanceof THREE.Mesh)) return;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mats.forEach((m: any) => {
              if (!m?.name || !m.color) return;
              if (m.name.includes("HairBack_00_HAIR")) m.color.set(idol.hairColor);
              if (m.name.includes("Face_00_SKIN") || m.name.includes("Body_00_SKIN")) m.color.set(idol.skinTone);
              if (m.name.includes("EyeIris_00_EYE")) m.color.set(idol.eyeColor);
            });
          });
          // 팔 내리기
          try {
            const la = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
            const ra = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
            if (la) la.rotation.z = 0.6;
            if (ra) ra.rotation.z = -0.6;
          } catch { /* ok */ }
          scene.add(vrm.scene);
          resolve();
        }, undefined, reject);
      });

      // ── 4. MediaPipe FaceMesh 로드 + 초기화 완료 대기 ──
      setLoadingMsg("얼굴 인식 모델 로딩 중...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let faceMesh: any = null;
      let faceTracking = false;

      try {
        const Kalidokit = await import("kalidokit");

        // 스크립트 로드
        await new Promise<void>((res, rej) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any).FaceMesh) { res(); return; }
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js";
          s.crossOrigin = "anonymous";
          s.onload = () => res();
          s.onerror = () => rej(new Error("FaceMesh script load failed"));
          document.head.appendChild(s);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const FM = (window as any).FaceMesh;
        faceMesh = new FM({
          locateFile: (f: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${f}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // onResults 등록
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        faceMesh.onResults((results: any) => {
          if (!vrm || !results.multiFaceLandmarks?.[0]) return;
          try {
            const face = Kalidokit.Face.solve(
              results.multiFaceLandmarks[0],
              { runtime: "mediapipe", video, imageSize: { width: 640, height: 480 }, smoothBlink: true }
            );
            if (!face?.head) return;

            const head = vrm.humanoid.getNormalizedBoneNode("head");
            const neck = vrm.humanoid.getNormalizedBoneNode("neck");
            const L = THREE.MathUtils.lerp;

            if (head) {
              head.rotation.x = L(head.rotation.x, (face.head.x ?? 0) * 0.8, 0.35);
              head.rotation.y = L(head.rotation.y, -(face.head.y ?? 0) * 0.8, 0.35);
              head.rotation.z = L(head.rotation.z, (face.head.z ?? 0) * 0.6, 0.35);
            }
            if (neck) {
              neck.rotation.x = L(neck.rotation.x, (face.head.x ?? 0) * 0.2, 0.3);
              neck.rotation.y = L(neck.rotation.y, -(face.head.y ?? 0) * 0.2, 0.3);
            }

            if (vrm.expressionManager) {
              const eL = face.eye?.l ?? 1;
              const eR = face.eye?.r ?? 1;
              vrm.expressionManager.setValue("blinkLeft", Math.max(0, Math.min(1, 1 - eL)));
              vrm.expressionManager.setValue("blinkRight", Math.max(0, Math.min(1, 1 - eR)));
              const mOpen = Math.max(0, Math.min(1, (face.mouth?.y ?? 0) * 3));
              vrm.expressionManager.setValue("aa", mOpen);
              vrm.expressionManager.update();
            }
          } catch { /* ok */ }
        });

        // ★ 핵심: initialize() 완료 후에만 send() 가능
        setLoadingMsg("얼굴 인식 초기화 중... (처음 한 번은 30초 소요)");
        await faceMesh.initialize();
        faceTracking = true;
        console.log("FaceMesh initialized!");

      } catch (e) {
        console.warn("FaceMesh failed, running without face tracking:", e);
        // 얼굴 추적 없이도 계속 실행
      }

      // ── 5. 애니메이션 루프 ──
      let frameId = 0;
      let lastFaceMs = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const t = clock.getElapsedTime();
        const now = performance.now();

        // 얼굴 추적 (초기화 완료 후만, 30fps)
        if (faceTracking && faceMesh && video.readyState >= 2 && now - lastFaceMs > 33) {
          lastFaceMs = now;
          faceMesh.send({ image: video }).catch(() => {});
        }

        // 기본 idle 애니메이션 (고개만, 가슴/spine 없음)
        if (vrm) {
          try {
            const head = vrm.humanoid.getNormalizedBoneNode("head");
            if (head && !faceTracking) {
              // 추적 없을 때만 idle 고개 움직임
              head.rotation.y = Math.sin(t * 0.3) * 0.04;
              head.rotation.x = -0.05 + Math.sin(t * 0.5) * 0.015;
            }
          } catch { /* ok */ }
          vrm.update(delta);
        }

        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);
      setStatus("ready");

      cleanupRef.current = () => {
        faceTracking = false;
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        stream.getTracks().forEach(t => t.stop());
        try { faceMesh?.close(); } catch { /* ok */ }
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.includes("Permission") || msg.includes("NotAllowed")
        ? "카메라 권한을 허용해주세요"
        : `오류: ${msg.substring(0, 80)}`);
      setStatus("error");
    }
  }, [idol]);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
        <button
          onClick={() => { cleanupRef.current?.(); router.back(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm font-medium hover:bg-white/20 transition"
        >
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </button>
        {idol && (
          <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm font-bold">
            {idol.name}
          </span>
        )}
        {status === "ready" && (
          <button
            onClick={() => { cleanupRef.current?.(); cleanupRef.current = null; setStatus("idle"); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-md text-white rounded-xl text-sm hover:bg-red-600 transition"
          >
            <CameraOff className="w-4 h-4" /> 종료
          </button>
        )}
      </div>

      {/* 3D 뷰어 */}
      <div ref={mountRef} className="flex-1" />

      {/* 카메라 비디오 - 항상 DOM에 존재, CSS로만 제어 */}
      <video
        ref={videoRef}
        className="absolute object-cover scale-x-[-1]"
        style={{
          bottom: status === "ready" ? "80px" : "-9999px",
          right: status === "ready" ? "20px" : "-9999px",
          width: status === "ready" ? "144px" : "1px",
          height: status === "ready" ? "112px" : "1px",
          opacity: status === "ready" ? 1 : 0,
          borderRadius: "12px",
          border: status === "ready" ? "2px solid rgba(255,255,255,0.2)" : "none",
          zIndex: 20,
        }}
        muted
        playsInline
        autoPlay
      />

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
                카메라를 켜면<br/>
                <span className="text-purple-300 font-semibold">내 얼굴·고개 움직임을<br/>캐릭터가 실시간으로 따라해요</span>
              </p>
            </div>
            <button
              onClick={startExperience}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-base hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3"
            >
              <Camera className="w-5 h-5" /> 카메라 켜고 체험하기
            </button>
            <p className="text-white/20 text-xs">카메라 데이터는 서버에 전송되지 않아요</p>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {status === "loading" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
          <p className="text-white font-medium">{loadingMsg}</p>
          <p className="text-white/30 text-xs mt-2">얼굴 인식 초기화는 처음 한 번만 오래 걸려요</p>
        </div>
      )}

      {/* 에러 */}
      {status === "error" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
          <div className="text-center space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <CameraOff className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white text-base font-medium">{errorMsg}</p>
            <button onClick={() => setStatus("idle")} className="px-6 py-3 bg-white text-black rounded-xl text-sm font-bold">
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 힌트 */}
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
