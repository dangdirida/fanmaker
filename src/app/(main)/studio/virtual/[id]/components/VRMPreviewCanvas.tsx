"use client";

import { useRef, useEffect, useState, Component, type ReactNode } from "react";

// Canvas/R3F를 최상위 import하지 않고 동적으로 로드
// 이렇게 하면 Three.js가 SSR 시 전혀 로드되지 않음

interface Props {
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  gender: string;
}

// 에러 바운더리 - Canvas 크래시 방지
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

function VRMCanvasInner({ hairColor }: { hairColor: string }) {
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

        // 렌더러
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 씬
        const scene = new THREE.Scene();

        // 카메라
        const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
        camera.position.set(0, 1.1, 2.2);

        // 조명
        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(1, 3, 2);
        scene.add(dirLight);
        const backLight = new THREE.DirectionalLight(0xc4d4ff, 0.4);
        backLight.position.set(-1, 1, -1);
        scene.add(backLight);

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.0, 0);
        controls.enablePan = false;
        controls.minDistance = 1.2;
        controls.maxDistance = 3.5;
        controls.minPolarAngle = Math.PI * 0.2;
        controls.maxPolarAngle = Math.PI * 0.75;
        controls.enableDamping = true;
        controls.update();

        // VRM 로드
        const loader = new GLTFLoader();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loader.register((parser: any) => new VRMLoaderPlugin(parser));

        loader.load(
          "/models/base_female.vrm",
          (gltf) => {
            if (disposed) return;
            const vrm = gltf.userData.vrm;
            if (!vrm) { setStatus("error"); return; }

            VRMUtils.rotateVRM0(vrm);
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.removeUnnecessaryJoints(gltf.scene);

            // A-포즈
            try {
              const la = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
              const ra = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
              if (la) la.rotation.z = 0.6;
              if (ra) ra.rotation.z = -0.6;
            } catch { /* ok */ }

            vrm.scene.rotation.y = 0;
            scene.add(vrm.scene);
            vrmRef.current = vrm;
            setStatus("ready");
          },
          undefined,
          () => { if (!disposed) setStatus("error"); }
        );

        // 애니메이션 루프
        const clock = new THREE.Clock();
        const animate = () => {
          if (disposed) return;
          frameRef.current = requestAnimationFrame(animate);
          const delta = clock.getDelta();
          const t = clock.getElapsedTime();

          const vrm = vrmRef.current;
          if (vrm) {
            try {
              const chest = vrm.humanoid.getNormalizedBoneNode("chest");
              if (chest) chest.rotation.x = Math.sin(t * 0.8) * 0.015;
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

        // 리사이즈
        const onResize = () => {
          if (!container || disposed) return;
          const nw = container.clientWidth;
          const nh = container.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        // cleanup 저장
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
  }, []);

  // 머리카락 색상 변경
  useEffect(() => {
    const vrm = vrmRef.current;
    if (!vrm) return;
    import("three").then((THREE) => {
      vrm.scene.traverse((obj: InstanceType<typeof THREE.Object3D>) => {
        if (!(obj instanceof THREE.Mesh)) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mats.forEach((m: any) => {
          if (obj.name.toLowerCase().includes("hair") && m?.color) {
            m.color.set(hairColor);
          }
        });
      });
    });
  }, [hairColor]);

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
      <VRMCanvasInner hairColor={props.hairColor} />
    </CanvasErrorBoundary>
  );
}
