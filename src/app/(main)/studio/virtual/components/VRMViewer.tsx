"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Smile, Laugh, AlertCircle, Eye, RotateCcw } from "lucide-react";

interface VRMViewerProps {
  vrmUrl: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export default function VRMViewer({ vrmUrl, onCanvasReady }: VRMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vrmRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [activeExpression, setActiveExpression] = useState("neutral");

  const initScene = useCallback(async () => {
    if (!canvasRef.current || !containerRef.current) return;

    const THREE = await import("three");
    const { OrbitControls } = await import(
      "three/addons/controls/OrbitControls.js"
    );
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 렌더러
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // 씬
    const scene = new THREE.Scene();

    // 카메라
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 1.3, 2.5);

    // 조명
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 2, 3);
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-1, 1, -2);
    scene.add(backLight);

    // OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1.0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 6;
    controls.update();

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
      setLoaded(true);

      if (onCanvasReady) onCanvasReady(canvas);
    } catch (err) {
      console.error("VRM load failed:", err);
      return;
    }

    // 애니메이션 루프
    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (vrmRef.current) {
        const vrm = vrmRef.current;
        vrm.update(delta);

        // idle 숨쉬기 애니메이션
        const hips = vrm.humanoid?.getNormalizedBoneNode("hips");
        if (hips) {
          hips.position.y = Math.sin(elapsed * 1.5) * 0.003;
        }

        // 자동 눈깜빡임
        if (vrm.expressionManager) {
          const blinkCycle = elapsed % 4;
          if (blinkCycle > 3.7 && blinkCycle < 3.9) {
            vrm.expressionManager.setValue("blink", 1);
          } else {
            vrm.expressionManager.setValue("blink", 0);
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 리사이즈
    const onResize = () => {
      if (!container) return;
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
  }, [vrmUrl, onCanvasReady]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initScene().then((fn) => {
      cleanup = fn;
    });
    return () => {
      cancelAnimationFrame(frameRef.current);
      cleanup?.();
    };
  }, [initScene]);

  const setExpression = (name: string) => {
    if (!vrmRef.current?.expressionManager) return;
    const em = vrmRef.current.expressionManager;
    // 모든 표정 리셋
    ["happy", "angry", "sad", "surprised", "neutral"].forEach((exp) => {
      em.setValue(exp, 0);
    });
    em.setValue("blinkLeft", 0);
    em.setValue("blinkRight", 0);

    if (name === "happy") em.setValue("happy", 1);
    else if (name === "surprised") em.setValue("surprised", 1);
    else if (name === "wink") em.setValue("blinkLeft", 1);

    setActiveExpression(name);
  };

  const EXPRESSIONS = [
    { key: "neutral", label: "기본", icon: Smile },
    { key: "happy", label: "웃음", icon: Laugh },
    { key: "surprised", label: "깜짝", icon: AlertCircle },
    { key: "wink", label: "윙크", icon: Eye },
  ];

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200"
        style={{ height: "65vh", minHeight: 400 }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">VRM 로딩 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* 표정 버튼 */}
      {loaded && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">표정</span>
          <div className="flex gap-2">
            {EXPRESSIONS.map((exp) => {
              const Icon = exp.icon;
              return (
                <button
                  key={exp.key}
                  onClick={() => setExpression(exp.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeExpression === exp.key
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {exp.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setExpression("neutral")}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            리셋
          </button>
        </div>
      )}
    </div>
  );
}
