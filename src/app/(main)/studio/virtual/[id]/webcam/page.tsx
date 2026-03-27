"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Camera, CameraOff, PersonStanding } from "lucide-react";

interface IdolData {
  id: string; name: string;
  hairColor: string; skinTone: string; eyeColor: string; gender: string; outfitStyle?: string;
}

// 손가락 굽힘 각도 계산
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcCurl(lm: any[], a: number, b: number, c: number): number {
  try {
    const v1 = { x: lm[b].x - lm[a].x, y: lm[b].y - lm[a].y, z: (lm[b].z ?? 0) - (lm[a].z ?? 0) };
    const v2 = { x: lm[c].x - lm[b].x, y: lm[c].y - lm[b].y, z: (lm[c].z ?? 0) - (lm[b].z ?? 0) };
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const m1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
    const m2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);
    if (m1 === 0 || m2 === 0) return 0;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2))));
    return Math.max(0, angle - 0.1);
  } catch { return 0; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFingerCurls(vrm: any, lm: any[], side: "L" | "R", THREE: any) {
  const L = THREE.MathUtils.lerp;
  const amt = 0.4;
  const prefix = side === "L" ? "left" : "right";
  const jp = `J_Bip_${side}_`;

  const fingers = [
    { name: "Thumb",  bones: ["Thumb1","Thumb2","Thumb3"],  mcp:1,  pip:2,  dip:3,  tip:4  },
    { name: "Index",  bones: ["Index1","Index2","Index3"],  mcp:5,  pip:6,  dip:7,  tip:8  },
    { name: "Middle", bones: ["Middle1","Middle2","Middle3"],mcp:9,  pip:10, dip:11, tip:12 },
    { name: "Ring",   bones: ["Ring1","Ring2","Ring3"],     mcp:13, pip:14, dip:15, tip:16 },
    { name: "Little", bones: ["Little1","Little2","Little3"],mcp:17,pip:18, dip:19, tip:20 },
  ];

  for (const finger of fingers) {
    const curl1 = calcCurl(lm, finger.mcp, finger.pip, finger.dip);
    const curl2 = calcCurl(lm, finger.pip, finger.dip, finger.tip);

    for (let i = 0; i < 3; i++) {
      try {
        // VRM humanoid bone 이름
        const boneNameMap: Record<string, string> = {
          "Thumb1": `${prefix}ThumbProximal`,
          "Thumb2": `${prefix}ThumbIntermediate`,
          "Thumb3": `${prefix}ThumbDistal`,
          "Index1": `${prefix}IndexProximal`,
          "Index2": `${prefix}IndexIntermediate`,
          "Index3": `${prefix}IndexDistal`,
          "Middle1": `${prefix}MiddleProximal`,
          "Middle2": `${prefix}MiddleIntermediate`,
          "Middle3": `${prefix}MiddleDistal`,
          "Ring1": `${prefix}RingProximal`,
          "Ring2": `${prefix}RingIntermediate`,
          "Ring3": `${prefix}RingDistal`,
          "Little1": `${prefix}LittleProximal`,
          "Little2": `${prefix}LittleIntermediate`,
          "Little3": `${prefix}LittleDistal`,
        };

        const boneName = boneNameMap[finger.bones[i]];
        if (!boneName) continue;

        // humanoid API로 먼저 시도
        let bone = null;
        try {
          bone = vrm.humanoid.getNormalizedBoneNode(boneName);
        } catch { /* ok */ }

        // 없으면 raw bone name으로 시도
        if (!bone) {
          vrm.scene.traverse((obj: any) => {
            if (obj.name === `${jp}${finger.bones[i]}`) bone = obj;
          });
        }

        if (!bone) continue;

        const curl = i === 0 ? curl1 : curl2;
        const maxCurl = finger.name === "Thumb" ? 0.8 : 1.4;
        const targetX = Math.min(curl * 1.2, maxCurl);

        if (finger.name === "Thumb" && i === 0) {
          // 엄지 첫 관절은 Z축으로 벌어짐
          bone.rotation.z = L(bone.rotation.z, side === "L" ? -curl * 0.5 : curl * 0.5, amt);
          bone.rotation.x = L(bone.rotation.x, targetX * 0.3, amt);
        } else {
          bone.rotation.x = L(bone.rotation.x, targetX, amt);
        }
      } catch { /* ok */ }
    }
  }
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

      const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0.8, 4.5);
      camera.lookAt(0, 0.8, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 2.0));
      const key = new THREE.DirectionalLight(0xfff0e0, 1.4);
      key.position.set(1, 3, 2); scene.add(key);
      const fill = new THREE.DirectionalLight(0xc4d4ff, 0.5);
      fill.position.set(-2, 1, 1); scene.add(fill);

      const gridHelper = new THREE.GridHelper(4, 20, 0x444466, 0x333355);
      gridHelper.position.y = -0.01;
      scene.add(gridHelper);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.8, 0);
      controls.enablePan = false;
      controls.minDistance = 1.0;
      controls.maxDistance = 6;
      controls.enableDamping = true;

      setLoadingMsg("캐릭터 로딩 중...");
      const OUTFIT_MAP_FEMALE: Record<string, string> = {
        casual: '/models/female_casual.vrm',
        cute: '/models/female_cute.vrm',
        dress: '/models/female_dress.vrm',
        sports: '/models/female_sports.vrm',
        flower: '/models/female_flower.vrm',
        white: '/models/female_white.vrm',
      };
      const OUTFIT_MAP_MALE: Record<string, string> = {
        casual: '/models/male_casual.vrm',
        cute: '/models/male_cute.vrm',
        dress: '/models/male_dress.vrm',
        sports: '/models/male_sports.vrm',
        white: '/models/male_white.vrm',
      };
      const outfitMap = idol.gender === 'male' ? OUTFIT_MAP_MALE : OUTFIT_MAP_FEMALE;
      const modelUrl = (idol.outfitStyle && outfitMap[idol.outfitStyle]) || (idol.gender === 'male' ? '/models/base_male.vrm' : '/models/base_female.vrm');
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

      const Kalidokit = await import("kalidokit");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__kalidokit = Kalidokit;

      let shoulderBaselineY = -1;
      let baselineFrames = 0;
      let baselineSum = 0;
      let currentJumpY = 0;
      const JUMP_THRESHOLD = 0.08;
      let hipsBaselineY = -1;
      let hipsBaselineFrames = 0;
      let hipsBaselineSum = 0;

      // ── FaceMesh ──
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
      } catch (e) {
        console.warn("FaceMesh failed:", e);
      }

      // ── Pose ──
      setLoadingMsg("전신 인식 모델 로딩 중...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let poseInstance: any = null;
      let poseTracking = false;
      let noBodyFrames = 0;

      try {
        await new Promise<void>((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any).Pose) { res(); return; }
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";
          s.crossOrigin = "anonymous";
          s.onload = () => res();
          s.onerror = () => res();
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
            if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
              noBodyFrames++;
              if (noBodyFrames > 30) setBodyVisible(false);
              return;
            }
            noBodyFrames = 0;
            setBodyVisible(true);

            try {
              const landmarks = results.poseLandmarks;
              const worldLandmarks = results.poseWorldLandmarks;
              const leftWristVisible = landmarks?.[15]?.visibility > 0.5;
              const rightWristVisible = landmarks?.[16]?.visibility > 0.5;
              const leftShoulderVisible = landmarks?.[11]?.visibility > 0.5;
              const rightShoulderVisible = landmarks?.[12]?.visibility > 0.5;
              const leftAnkleVisible = landmarks?.[27]?.visibility > 0.3;
              const rightAnkleVisible = landmarks?.[28]?.visibility > 0.3;
              const leftArmVisible = leftWristVisible && leftShoulderVisible;
              const rightArmVisible = rightWristVisible && rightShoulderVisible;

              const pose = Kalidokit.Pose.solve(
                results.poseWorldLandmarks,
                results.poseLandmarks,
                { runtime: "mediapipe", video, imageSize: { width: 640, height: 480 } }
              );
              if (!pose) return;

              const L = THREE.MathUtils.lerp;
              const amt = 0.3;

              // 점프 감지
              const lShoulderY = worldLandmarks?.[11]?.y ?? 0;
              const rShoulderY = worldLandmarks?.[12]?.y ?? 0;
              const avgShoulderY = (lShoulderY + rShoulderY) / 2;
              const hipWorldY = worldLandmarks?.[23]?.y ?? 0;

              if (shoulderBaselineY < 0 && baselineFrames < 30) {
                baselineSum += avgShoulderY;
                baselineFrames++;
                if (baselineFrames === 30) shoulderBaselineY = baselineSum / 30;
              }
              if (hipsBaselineY < 0 && hipsBaselineFrames < 30) {
                hipsBaselineSum += hipWorldY;
                hipsBaselineFrames++;
                if (hipsBaselineFrames === 30) hipsBaselineY = hipsBaselineSum / 30;
              }

              if (shoulderBaselineY > 0) {
                const jumpDelta = shoulderBaselineY - avgShoulderY;
                if (jumpDelta > JUMP_THRESHOLD) {
                  currentJumpY = L(currentJumpY, Math.min(jumpDelta * 2.0, 0.8), 0.25);
                } else {
                  currentJumpY = L(currentJumpY, 0, 0.15);
                }
                vrm.scene.position.y = currentJumpY;
              }

              if (hipsBaselineY > 0 && currentJumpY < 0.05) {
                const crouchDelta = hipWorldY - hipsBaselineY;
                if (crouchDelta > 0.05) {
                  vrm.scene.position.y = L(vrm.scene.position.y, Math.max(-crouchDelta * 1.2, -0.5), 0.2);
                }
              }

              const hips = vrm.humanoid.getNormalizedBoneNode("hips");
              const spine = vrm.humanoid.getNormalizedBoneNode("spine");
              const chest = vrm.humanoid.getNormalizedBoneNode("chest");
              if (hips && pose.Hips?.rotation) {
                hips.rotation.x = L(hips.rotation.x, pose.Hips.rotation.x * 0.6, amt);
                hips.rotation.y = L(hips.rotation.y, pose.Hips.rotation.y * 0.6, amt);
                hips.rotation.z = L(hips.rotation.z, pose.Hips.rotation.z * 0.6, amt);
              }
              if (spine && pose.Spine) {
                spine.rotation.x = L(spine.rotation.x, (pose.Spine.x ?? 0) * 0.5, amt);
                spine.rotation.y = L(spine.rotation.y, (pose.Spine.y ?? 0) * 0.3, amt);
                spine.rotation.z = L(spine.rotation.z, (pose.Spine.z ?? 0) * 0.5, amt);
              }
              if (chest && pose.Spine) {
                chest.rotation.x = L(chest.rotation.x, (pose.Spine.x ?? 0) * 0.3, amt);
                chest.rotation.z = L(chest.rotation.z, (pose.Spine.z ?? 0) * 0.2, amt);
              }

              const lUA = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
              const lLA = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
              if (!leftArmVisible) {
                if (lUA) { lUA.rotation.x = L(lUA.rotation.x, 0, 0.15); lUA.rotation.y = L(lUA.rotation.y, 0, 0.15); lUA.rotation.z = L(lUA.rotation.z, 0.3, 0.15); }
                if (lLA) { lLA.rotation.x = L(lLA.rotation.x, 0, 0.15); lLA.rotation.y = L(lLA.rotation.y, 0, 0.15); lLA.rotation.z = L(lLA.rotation.z, 0, 0.15); }
              } else {
                if (lUA && pose.LeftUpperArm) { lUA.rotation.x = L(lUA.rotation.x, pose.LeftUpperArm.x ?? 0, amt); lUA.rotation.y = L(lUA.rotation.y, pose.LeftUpperArm.y ?? 0, amt); lUA.rotation.z = L(lUA.rotation.z, (pose.LeftUpperArm.z ?? 0) + 0.5, amt); }
                if (lLA && pose.LeftLowerArm) { lLA.rotation.x = L(lLA.rotation.x, pose.LeftLowerArm.x ?? 0, amt); lLA.rotation.y = L(lLA.rotation.y, pose.LeftLowerArm.y ?? 0, amt); lLA.rotation.z = L(lLA.rotation.z, pose.LeftLowerArm.z ?? 0, amt); }
              }

              const rUA = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
              const rLA = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
              if (!rightArmVisible) {
                if (rUA) { rUA.rotation.x = L(rUA.rotation.x, 0, 0.15); rUA.rotation.y = L(rUA.rotation.y, 0, 0.15); rUA.rotation.z = L(rUA.rotation.z, -0.3, 0.15); }
                if (rLA) { rLA.rotation.x = L(rLA.rotation.x, 0, 0.15); rLA.rotation.y = L(rLA.rotation.y, 0, 0.15); rLA.rotation.z = L(rLA.rotation.z, 0, 0.15); }
              } else {
                if (rUA && pose.RightUpperArm) { rUA.rotation.x = L(rUA.rotation.x, pose.RightUpperArm.x ?? 0, amt); rUA.rotation.y = L(rUA.rotation.y, pose.RightUpperArm.y ?? 0, amt); rUA.rotation.z = L(rUA.rotation.z, (pose.RightUpperArm.z ?? 0) - 0.5, amt); }
                if (rLA && pose.RightLowerArm) { rLA.rotation.x = L(rLA.rotation.x, pose.RightLowerArm.x ?? 0, amt); rLA.rotation.y = L(rLA.rotation.y, pose.RightLowerArm.y ?? 0, amt); rLA.rotation.z = L(rLA.rotation.z, pose.RightLowerArm.z ?? 0, amt); }
              }

              const lUL = vrm.humanoid.getNormalizedBoneNode("leftUpperLeg");
              const lLL = vrm.humanoid.getNormalizedBoneNode("leftLowerLeg");
              const rUL = vrm.humanoid.getNormalizedBoneNode("rightUpperLeg");
              const rLL = vrm.humanoid.getNormalizedBoneNode("rightLowerLeg");
              const lFoot = vrm.humanoid.getNormalizedBoneNode("leftFoot");
              const rFoot = vrm.humanoid.getNormalizedBoneNode("rightFoot");
              const lToe = vrm.humanoid.getNormalizedBoneNode("leftToes");
              const rToe = vrm.humanoid.getNormalizedBoneNode("rightToes");

              if (lUL && pose.LeftUpperLeg) { lUL.rotation.x = L(lUL.rotation.x, (pose.LeftUpperLeg.x ?? 0) * 0.9, amt); lUL.rotation.y = L(lUL.rotation.y, (pose.LeftUpperLeg.y ?? 0) * 0.6, amt); lUL.rotation.z = L(lUL.rotation.z, (pose.LeftUpperLeg.z ?? 0) * 0.6, amt); }
              if (lLL && pose.LeftLowerLeg) { lLL.rotation.x = L(lLL.rotation.x, Math.min(0, (pose.LeftLowerLeg.x ?? 0) * 1.1), amt); lLL.rotation.z = L(lLL.rotation.z, (pose.LeftLowerLeg.z ?? 0) * 0.3, amt); }
              if (rUL && pose.RightUpperLeg) { rUL.rotation.x = L(rUL.rotation.x, (pose.RightUpperLeg.x ?? 0) * 0.9, amt); rUL.rotation.y = L(rUL.rotation.y, (pose.RightUpperLeg.y ?? 0) * 0.6, amt); rUL.rotation.z = L(rUL.rotation.z, (pose.RightUpperLeg.z ?? 0) * 0.6, amt); }
              if (rLL && pose.RightLowerLeg) { rLL.rotation.x = L(rLL.rotation.x, Math.min(0, (pose.RightLowerLeg.x ?? 0) * 1.1), amt); rLL.rotation.z = L(rLL.rotation.z, (pose.RightLowerLeg.z ?? 0) * 0.3, amt); }

              const isJumping = currentJumpY > 0.05;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const poseAny = pose as any;
              if (lFoot) {
                if (isJumping && leftAnkleVisible) { lFoot.rotation.x = L(lFoot.rotation.x, (poseAny.LeftFoot?.x ?? 0) * 0.8 + 0.3, amt); lFoot.rotation.y = L(lFoot.rotation.y, poseAny.LeftFoot?.y ?? 0, amt); }
                else { const ka = lLL ? lLL.rotation.x : 0; const la = lUL ? lUL.rotation.x : 0; lFoot.rotation.x = L(lFoot.rotation.x, -(ka + la) * 0.5, amt * 1.5); lFoot.rotation.y = L(lFoot.rotation.y, 0, amt); }
              }
              if (rFoot) {
                if (isJumping && rightAnkleVisible) { rFoot.rotation.x = L(rFoot.rotation.x, (poseAny.RightFoot?.x ?? 0) * 0.8 + 0.3, amt); rFoot.rotation.y = L(rFoot.rotation.y, poseAny.RightFoot?.y ?? 0, amt); }
                else { const ka = rLL ? rLL.rotation.x : 0; const la = rUL ? rUL.rotation.x : 0; rFoot.rotation.x = L(rFoot.rotation.x, -(ka + la) * 0.5, amt * 1.5); rFoot.rotation.y = L(rFoot.rotation.y, 0, amt); }
              }
              if (lToe) lToe.rotation.x = L(lToe.rotation.x, isJumping ? 0.3 : 0, amt);
              if (rToe) rToe.rotation.x = L(rToe.rotation.x, isJumping ? 0.3 : 0, amt);

            } catch { /* ok */ }
          });
          setLoadingMsg("전신 인식 초기화 중...");
          await poseInstance.initialize();
          poseTracking = true;
        }
      } catch (e) {
        console.warn("Pose failed:", e);
      }

      // ── Hands ──
      setLoadingMsg("손가락 인식 모델 로딩 중...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let handsInstance: any = null;
      let handsTracking = false;

      try {
        // CDN에서 직접 로드 (npm dynamic import 대신)
        await new Promise<void>((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469404/hands.js';
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.head.appendChild(s);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        const H = w.Hands || w.hands?.Hands || w.mediapipe?.Hands;
        if (H) {
          handsInstance = new H({
            locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469404/${f}`,
          });
          handsInstance.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5,
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handsInstance.onResults((results: any) => {
            if (!vrm || !results.multiHandLandmarks) return;
            try {
              for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const lm = results.multiHandLandmarks[i];
                // MediaPipe는 거울 모드: "Left" = 화면 오른쪽 = 캐릭터 왼손
                const handedness = results.multiHandedness[i]?.label ?? "Right";
                // 거울 반전 보정
                const side: "L" | "R" = handedness === "Left" ? "R" : "L";
                applyFingerCurls(vrm, lm, side, THREE);
              }
            } catch { /* ok */ }
          });

          setLoadingMsg("손가락 인식 초기화 중...");
          await handsInstance.initialize();
          handsTracking = true;
        }
      } catch (e) {
        console.warn("Hands failed:", e);
      }

      // ── 애니메이션 루프 ──
      let frameId = 0;
      let lastFaceMs = 0;
      let lastPoseMs = 0;
      let lastHandsMs = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const t = clock.getElapsedTime();
        const now = performance.now();

        if (faceTracking && faceMesh && video.readyState >= 2 && now - lastFaceMs > 33) {
          lastFaceMs = now;
          faceMesh.send({ image: video }).catch(() => {});
        }
        if (poseTracking && poseInstance && video.readyState >= 2 && now - lastPoseMs > 50) {
          lastPoseMs = now;
          poseInstance.send({ image: video }).catch(() => {});
        }
        // 손가락은 15fps (성능 최적화)
        if (handsTracking && handsInstance && video.readyState >= 2 && now - lastHandsMs > 66) {
          lastHandsMs = now;
          handsInstance.send({ image: video }).catch(() => {});
        }

        if (vrm) {
          if (!faceTracking) {
            try {
              const head = vrm.humanoid.getNormalizedBoneNode("head");
              if (head) { head.rotation.y = Math.sin(t * 0.3) * 0.04; head.rotation.x = -0.05 + Math.sin(t * 0.5) * 0.015; }
            } catch { /* ok */ }
          }
          vrm.update(delta);
        }
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        const nw = container.clientWidth; const nh = container.clientHeight;
        camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);
      setStatus("ready");

      cleanupRef.current = () => {
        faceTracking = false; poseTracking = false; handsTracking = false;
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        stream.getTracks().forEach(t => t.stop());
        try { faceMesh?.close(); } catch { /* ok */ }
        try { poseInstance?.close(); } catch { /* ok */ }
        try { handsInstance?.close(); } catch { /* ok */ }
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.includes("Permission") || msg.includes("NotAllowed") ? "카메라 권한을 허용해주세요" : `오류: ${msg.substring(0, 80)}`);
      setStatus("error");
    }
  }, [idol]);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4">
        <button onClick={() => { cleanupRef.current?.(); router.back(); }} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm font-medium hover:bg-white/20 transition">
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </button>
        {idol && <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm font-bold">{idol.name}</span>}
        {status === "ready" && (
          <button onClick={() => { cleanupRef.current?.(); cleanupRef.current = null; setStatus("idle"); setBodyVisible(true); }} className="flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-md text-white rounded-xl text-sm hover:bg-red-600 transition">
            <CameraOff className="w-4 h-4" /> 종료
          </button>
        )}
      </div>

      <div ref={mountRef} className="flex-1" />

      {status === "ready" && !bodyVisible && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 px-5 py-3 bg-yellow-500/90 backdrop-blur-md text-black rounded-2xl shadow-lg animate-bounce">
            <PersonStanding className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm font-bold">카메라에서 더 멀리 떨어져주세요<br /><span className="font-normal text-xs">전신이 보여야 발까지 인식돼요</span></div>
          </div>
        </div>
      )}

      <video ref={videoRef} className="absolute object-cover scale-x-[-1]"
        style={{ bottom: status === "ready" ? "80px" : "-9999px", right: status === "ready" ? "20px" : "-9999px", width: status === "ready" ? "144px" : "1px", height: status === "ready" ? "112px" : "1px", opacity: status === "ready" ? 1 : 0, borderRadius: "12px", border: status === "ready" ? "2px solid rgba(255,255,255,0.2)" : "none", zIndex: 20 }}
        muted playsInline autoPlay
      />

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
              <h2 className="text-white text-2xl font-extrabold mb-3">{idol?.name || "버추얼 아이돌"} 체험</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                카메라에 <span className="text-yellow-300 font-semibold">전신이 보이도록</span> 거리를 맞추면<br/>
                <span className="text-purple-300 font-semibold">손가락 하나하나까지</span> 따라해요
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-left space-y-1.5">
              <p className="text-white/50 text-xs">👤 고개 · 눈 깜빡임 · 입</p>
              <p className="text-white/50 text-xs">💪 팔 · 몸 · 허리 굽히기</p>
              <p className="text-white/50 text-xs">🦵 다리 · 발 · 점프</p>
              <p className="text-white/50 text-xs">🖐 손가락 관절 30개 개별 인식</p>
            </div>
            <button onClick={startExperience} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-base hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3">
              <Camera className="w-5 h-5" /> 카메라 켜고 체험하기
            </button>
            <p className="text-white/20 text-xs">카메라 데이터는 서버에 전송되지 않아요</p>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
          <p className="text-white font-medium">{loadingMsg}</p>
          <p className="text-white/30 text-xs mt-2">처음 실행 시 모델 다운로드로 1~2분 소요될 수 있어요</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
          <div className="text-center space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <CameraOff className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white text-base font-medium">{errorMsg}</p>
            <button onClick={() => setStatus("idle")} className="px-6 py-3 bg-white text-black rounded-xl text-sm font-bold">다시 시도</button>
          </div>
        </div>
      )}

      {status === "ready" && bodyVisible && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white/70 rounded-full text-xs font-medium">
            손가락 · 발 · 점프 · 허리 굽히기 인식 · 드래그로 시점 변경
          </div>
        </div>
      )}
    </div>
  );
}
