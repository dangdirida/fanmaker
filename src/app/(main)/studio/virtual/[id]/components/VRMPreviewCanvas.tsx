"use client";

import { useRef, useEffect, useState, Component, type ReactNode } from "react";

interface Props {
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  gender: string;
  outfitStyle?: string;
  hairLength?: string;
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyGenderMorph(vrm: any, gender: string) {
  try {
    const chest = vrm.humanoid.getNormalizedBoneNode("chest") ||
                  vrm.humanoid.getNormalizedBoneNode("upperChest");
    const neck = vrm.humanoid.getNormalizedBoneNode("neck");
    const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
    const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");
    const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
    const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
    const spine = vrm.humanoid.getNormalizedBoneNode("spine");
    const hips = vrm.humanoid.getNormalizedBoneNode("hips");

    if (gender === "male") {
      if (leftShoulder) leftShoulder.scale.set(1.15, 1.0, 1.0);
      if (rightShoulder) rightShoulder.scale.set(1.15, 1.0, 1.0);
      if (leftUpperArm) leftUpperArm.rotation.z = 0.75;
      if (rightUpperArm) rightUpperArm.rotation.z = -0.75;
      if (chest) chest.scale.set(1.1, 0.95, 1.1);
      if (spine) spine.scale.set(1.08, 1.0, 1.05);
      if (hips) hips.scale.set(1.05, 1.0, 1.0);
      if (neck) neck.scale.set(1.1, 1.0, 1.1);
    } else {
      if (leftShoulder) leftShoulder.scale.set(1.0, 1.0, 1.0);
      if (rightShoulder) rightShoulder.scale.set(1.0, 1.0, 1.0);
      if (leftUpperArm) leftUpperArm.rotation.z = 0.6;
      if (rightUpperArm) rightUpperArm.rotation.z = -0.6;
      if (chest) chest.scale.set(1.0, 1.0, 1.0);
      if (spine) spine.scale.set(1.0, 1.0, 1.0);
      if (hips) hips.scale.set(1.0, 1.0, 1.0);
      if (neck) neck.scale.set(1.0, 1.0, 1.0);
    }
  } catch (e) {
    console.warn("gender morph failed:", e);
  }
}

// 정확한 재질명으로 색상 적용
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyMatColor(vrm: any, matKey: string, color: string, THREE: any) {
  vrm.scene.traverse((obj: InstanceType<typeof THREE.Object3D>) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mats.forEach((m: any) => {
      if (m?.name?.includes(matKey) && m.color) {
        m.color.set(color);
        if (m.emissive) m.emissive.set(color).multiplyScalar(0.02);
        m.needsUpdate = true;
      }
    });
  });
}

function VRMCanvasInner({ hairColor, skinTone, eyeColor, gender }: {
  hairColor: string; skinTone: string; eyeColor: string; gender: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vrmRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;
    let disposed = false;

    (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

        if (disposed || !mountRef.current) return;

        const container = mountRef.current;
        const w = container.clientWidth;
        const h = container.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
        camera.position.set(0, 1.4, 1.8);
        camera.lookAt(0, 1.35, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(1, 3, 2);
        scene.add(dirLight);
        const backLight = new THREE.DirectionalLight(0xc4d4ff, 0.4);
        backLight.position.set(-1, 1, -1);
        scene.add(backLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.35, 0);
        controls.enablePan = false;
        controls.minDistance = 1.2;
        controls.maxDistance = 3.5;
        controls.minPolarAngle = Math.PI * 0.2;
        controls.maxPolarAngle = Math.PI * 0.75;
        controls.enableDamping = true;
        controls.update();

        const loader = new GLTFLoader();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loader.register((parser: any) => new VRMLoaderPlugin(parser));

        const modelUrl = gender === "male"
          ? "/models/base_male.vrm"
          : "/models/base_female.vrm";

        loader.load(
          modelUrl,
          (gltf) => {
            if (disposed) return;
            const vrm = gltf.userData.vrm;
            if (!vrm) { setStatus("error"); return; }

            VRMUtils.rotateVRM0(vrm);
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.removeUnnecessaryJoints(gltf.scene);

            try {
              const la = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
              const ra = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
              if (la) la.rotation.z = 0.6;
              if (ra) ra.rotation.z = -0.6;
            } catch { /* ok */ }

            vrm.scene.position.y = 0.1;
            vrm.scene.rotation.y = Math.PI;
            scene.add(vrm.scene);
            vrmRef.current = vrm;
            applyGenderMorph(vrm, gender);

            // 초기 색상 적용 (정확한 재질명)
            applyMatColor(vrm, "HairBack_00_HAIR", hairColor, THREE);
            applyMatColor(vrm, "EyeIris_00_EYE", eyeColor, THREE);
            applyMatColor(vrm, "Face_00_SKIN", skinTone, THREE);
            applyMatColor(vrm, "Body_00_SKIN", skinTone, THREE);

            setStatus("ready");
          },
          undefined,
          () => { if (!disposed) setStatus("error"); }
        );

        const clock = new THREE.Clock();
        const animate = () => {
          if (disposed) return;
          frameRef.current = requestAnimationFrame(animate);
          const delta = clock.getDelta();
          const t = clock.getElapsedTime();

          const vrm = vrmRef.current;
          if (vrm) {
            try {
              const head = vrm.humanoid.getNormalizedBoneNode("head");
              if (head) {
                head.rotation.y = Math.sin(t * 0.3) * 0.04;
                head.rotation.x = -0.05 + Math.sin(t * 0.5) * 0.015;
              }
              if (vrm.expressionManager) {
                vrm.expressionManager.setValue("blink", (t % 4) < 0.12 ? 1 : 0);
                vrm.expressionManager.update();
              }
            } catch { /* ok */ }
            vrm.update(delta);
          }

          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
          if (!container || disposed) return;
          const nw = container.clientWidth;
          const nh = container.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
        };
      } catch (err) {
        console.warn("VRM init failed:", err);
        if (!disposed) setStatus("error");
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [gender]);

  // 헤어 색상
  useEffect(() => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    import("three").then((THREE) => {
      applyMatColor(vrm, "HairBack_00_HAIR", hairColor, THREE);
    });
  }, [hairColor]);

  // 피부톤
  useEffect(() => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    import("three").then((THREE) => {
      applyMatColor(vrm, "Face_00_SKIN", skinTone, THREE);
      applyMatColor(vrm, "Body_00_SKIN", skinTone, THREE);
    });
  }, [skinTone]);

  // 눈동자 (흰자 EyeWhite 절대 건드리지 않음)
  useEffect(() => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    import("three").then((THREE) => {
      applyMatColor(vrm, "EyeIris_00_EYE", eyeColor, THREE);
    });
  }, [eyeColor]);

  // 성별 변경 시 체형 재적용
  useEffect(() => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    applyGenderMorph(vrm, gender);
  }, [gender]);

  return (
    <div ref={mountRef} className="w-full h-full relative">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-gray-400">3D 모델을 불러올 수 없습니다</p>
        </div>
      )}
    </div>
  );
}

export default function VRMPreviewCanvas(props: Props) {
  const fallback = (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
      <p className="text-xs text-gray-400">3D 뷰어를 로드할 수 없습니다</p>
    </div>
  );

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <VRMCanvasInner
        hairColor={props.hairColor}
        skinTone={props.skinTone}
        eyeColor={props.eyeColor}
        gender={props.gender}
      />
    </CanvasErrorBoundary>
  );
}
