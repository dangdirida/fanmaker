"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Camera, CameraOff, PersonStanding } from "lucide-react";

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
  const [bodyVisible, setBodyVisible] = useState(true);
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

      // 전신 보기 위해 카메라 더 뒤로
      const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0.9, 3.5);
      camera.lookAt(0, 0.9, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 2.0));
      const key = new THREE.DirectionalLight(0xfff0e0, 1.4);
      key.position.set(1, 3, 2); scene.add(key);
      const fill = new THREE.DirectionalLight(0xc4d4ff, 0.5);
      fill.position.set(-2, 1, 1); scene.add(fill);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.9, 0);
      controls.enablePan = false;
      controls.minDistance = 1.0;
      controls.maxDistance = 6;
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
          vrm.scene.position.y = 0;
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.removeUnnecessaryJoints(gltf.scene);
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
          // 기본 팔 자세
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

      // kalidokit window에 저장
      const Kalidokit = await import("kalidokit");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__kalidokit = Kalidokit;

      // ── 4. FaceMesh 초기화 ──
      setLoadingMsg("얼굴 인식 모델 로딩 중...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let faceMesh: any = null;
      let faceTracking = false;

      try {
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
        faceMesh = new FM({
          locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${f}`,
        });
        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        faceMesh.onResults((results: any) => {
          if (!vrm || !results.multiFaceLandmarks?.[0]) return;
          try {
            const face = Kalidokit.Face.solve(
              results.multiFaceLandmarks[0],
              { runtime: "mediapipe", video, imageSize: { width: 640, height: 480 }, smoothBlink: true }
            );
            if (!face?.head) return;
            const L = THREE.MathUtils.lerp;
            const head = vrm.humanoid.getNormalizedBoneNode("head");
            const neck = vrm.humanoid.getNormalizedBoneNode("neck");
            if (head) {
              head.rotation.x = L(head.rotation.x, (face.head.x ?? 0) * 0.8, 0.35);
              // 거울 모드: y 부호 반전 제거
              head.rotation.y = L(head.rotation.y, (face.head.y ?? 0) * 0.8, 0.35);
              head.rotation.z = L(head.rotation.z, (face.head.z ?? 0) * 0.6, 0.35);
            }
            if (neck) {
              neck.rotation.x = L(neck.rotation.x, (face.head.x ?? 0) * 0.2, 0.3);
              neck.rotation.y = L(neck.rotation.y, (face.head.y ?? 0) * 0.2, 0.3);
            }
            if (vrm.expressionManager) {
              vrm.expressionManager.setValue("blinkLeft", Math.max(0, Math.min(1, 1 - (face.eye?.l ?? 1))));
              vrm.expressionManager.setValue("blinkRight", Math.max(0, Math.min(1, 1 - (face.eye?.r ?? 1))));
              vrm.expressionManager.setValue("aa", Math.max(0, Math.min(1, (face.mouth?.y ?? 0) * 3)));
              vrm.expressionManager.update();
            }
          } catch { /* ok */ }
        });

        setLoadingMsg("얼굴 인식 초기화 중...");
        await faceMesh.initialize();
        faceTracking = true;
        console.log("FaceMesh ready!");
      } catch (e) {
        console.warn("FaceMesh failed:", e);
      }

      // ── 5. MediaPipe Pose (전신) 초기화 ──
      setLoadingMsg("전신 인식 모델 로딩 중...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let poseInstance: any = null;
      let poseTracking = false;
      let noBodyFrames = 0; // 몸이 안 보이는 프레임 카운터

      try {
        await new Promise<void>((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any).Pose) { res(); return; }
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";
          s.crossOrigin = "anonymous";
          s.onload = () => res();
          s.onerror = () => res(); // 실패해도 계속
          document.head.appendChild(s);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const P = (window as any).Pose;
        if (P) {
          poseInstance = new P({
            locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`,
          });
          poseInstance.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          poseInstance.onResults((results: any) => {
            if (!vrm) return;

            // 몸이 인식되지 않으면 안내 메시지
            if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
              noBodyFrames++;
              if (noBodyFrames > 30) setBodyVisible(false);
              return;
            }
            noBodyFrames = 0;
            setBodyVisible(true);

            try {
              const pose = Kalidokit.Pose.solve(
                results.poseWorldLandmarks,
                results.poseLandmarks,
                { runtime: "mediapipe", video, imageSize: { width: 640, height: 480 } }
              );
              if (!pose) return;

              const L = THREE.MathUtils.lerp;
              const amt = 0.3;

              // 엉덩이/척추
              const hips = vrm.humanoid.getNormalizedBoneNode("hips");
              const spine = vrm.humanoid.getNormalizedBoneNode("spine");
              if (hips && pose.Hips?.rotation) {
                hips.rotation.x = L(hips.rotation.x, pose.Hips.rotation.x * 0.5, amt);
                hips.rotation.y = L(hips.rotation.y, pose.Hips.rotation.y * 0.5, amt);
                hips.rotation.z = L(hips.rotation.z, pose.Hips.rotation.z * 0.5, amt);
              }
              if (spine && pose.Spine) {
                spine.rotation.x = L(spine.rotation.x, (pose.Spine.x ?? 0) * 0.3, amt);
                spine.rotation.z = L(spine.rotation.z, (pose.Spine.z ?? 0) * 0.3, amt);
              }

              // 왼팔
              const lUA = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
              const lLA = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
              if (lUA && pose.LeftUpperArm) {
                lUA.rotation.x = L(lUA.rotation.x, pose.LeftUpperArm.x ?? 0, amt);
                lUA.rotation.y = L(lUA.rotation.y, pose.LeftUpperArm.y ?? 0, amt);
                lUA.rotation.z = L(lUA.rotation.z, (pose.LeftUpperArm.z ?? 0) + 0.5, amt);
              }
              if (lLA && pose.LeftLowerArm) {
                lLA.rotation.x = L(lLA.rotation.x, pose.LeftLowerArm.x ?? 0, amt);
                lLA.rotation.y = L(lLA.rotation.y, pose.LeftLowerArm.y ?? 0, amt);
                lLA.rotation.z = L(lLA.rotation.z, pose.LeftLowerArm.z ?? 0, amt);
              }

              // 오른팔
              const rUA = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
              const rLA = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
              if (rUA && pose.RightUpperArm) {
                rUA.rotation.x = L(rUA.rotation.x, pose.RightUpperArm.x ?? 0, amt);
                rUA.rotation.y = L(rUA.rotation.y, pose.RightUpperArm.y ?? 0, amt);
                rUA.rotation.z = L(rUA.rotation.z, (pose.RightUpperArm.z ?? 0) - 0.5, amt);
              }
              if (rLA && pose.RightLowerArm) {
                rLA.rotation.x = L(rLA.rotation.x, pose.RightLowerArm.x ?? 0, amt);
                rLA.rotation.y = L(rLA.rotation.y, pose.RightLowerArm.y ?? 0, amt);
                rLA.rotation.z = L(rLA.rotation.z, pose.RightLowerArm.z ?? 0, amt);
              }
            } catch { /* ok */ }
          });

          setLoadingMsg("전신 인식 초기화 중...");
          await poseInstance.initialize();
          poseTracking = true;
          console.log("Pose ready!");
        }
      } catch (e) {
        console.warn("Pose failed:", e);
      }

      // ── 6. 애니메이션 루프 ──
      let frameId = 0;
      let lastFaceMs = 0;
      let lastPoseMs = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const t = clock.getElapsedTime();
        const now = performance.now();

        // 얼굴 추적 30fps
        if (faceTracking && faceMesh && video.readyState >= 2 && now - lastFaceMs > 33) {
          lastFaceMs = now;
          faceMesh.send({ image: video }).catch(() => {});
        }

        // 전신 추적 20fps (얼굴보다 낮게)
        if (poseTracking && poseInstance && video.readyState >= 2 && now - lastPoseMs > 50) {
          lastPoseMs = now;
          poseInstance.send({ image: video }).catch(() => {});
        }

        if (vrm) {
          // 추적 없을 때만 idle 고개
          if (!faceTracking) {
            try {
              const head = vrm.humanoid.getNormalizedBoneNode("head");
              if (head) {
                head.rotation.y = Math.sin(t * 0.3) * 0.04;
                head.rotation.x = -0.05 + Math.sin(t * 0.5) * 0.015;
              }
            } catch { /* ok */ }
          }
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
        poseTracking = false;
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        stream.getTracks().forEach(t => t.stop());
        try { faceMesh?.close(); } catch { /* ok */ }
        try { poseInstance?.close(); } catch { /* ok */ }
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
            onClick={() => { cleanupRef.current?.(); cleanupRef.current = null; setStatus("idle"); setBodyVisible(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-md text-white rounded-xl text-sm hover:bg-red-600 transition"
          >
            <CameraOff className="w-4 h-4" /> 종료
          </button>
        )}
      </div>

      {/* 3D 뷰어 */}
      <div ref={mountRef} className="flex-1" />

      {/* 몸이 안 보일 때 안내 */}
      {status === "ready" && !bodyVisible && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 px-5 py-3 bg-yellow-500/90 backdrop-blur-md text-black rounded-2xl shadow-lg animate-bounce">
            <PersonStanding className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm font-bold">
              카메라에서 더 멀리 떨어져주세요<br />
              <span className="font-normal text-xs">상반신 전체가 보여야 몸 인식이 돼요</span>
            </div>
          </div>
        </div>
      )}

      {/* 카메라 비디오 PIP */}
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
        muted playsInline autoPlay
      />

      {/* 시작 오버레이 */}
      {status === "idle" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center space-y-6 max-w-sm px-6">
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
                카메라에 <span className="text-yellow-300 font-semibold">전신이 보이도록</span> 거리를 맞추면<br/>
                <span className="text-purple-300 font-semibold">얼굴 + 팔 + 몸 전체</span>를 캐릭터가 따라해요
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-left space-y-1.5">
              <p className="text-white/50 text-xs">✓ 고개 돌리기 · 끄덕이기</p>
              <p className="text-white/50 text-xs">✓ 눈 깜빡임 · 입 벌리기</p>
              <p className="text-white/50 text-xs">✓ 팔 올리기 · 몸 기울이기</p>
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
          <p className="text-white/30 text-xs mt-2">처음 실행 시 모델 다운로드로 1~2분 소요될 수 있어요</p>
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
      {status === "ready" && bodyVisible && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white/70 rounded-full text-xs font-medium">
            얼굴·팔·몸이 따라해요 · 드래그로 시점 변경
          </div>
        </div>
      )}
    </div>
  );
}
