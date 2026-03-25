"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  idolId: string;
  name: string;
  gender: string;
  hairColor: string;
  outfitStyle?: string;
  size?: number;
}

export default function IdolThumbnail({ idolId, name, gender, hairColor, outfitStyle, size = 56 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;

    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

        const canvas = canvasRef.current!;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setSize(size * 2, size * 2);
        renderer.setClearColor(0xf8f8f8);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f8f8);

        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        camera.position.set(0, 1.55, 0.8);
        camera.lookAt(0, 1.55, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 2));
        const dir = new THREE.DirectionalLight(0xffffff, 1);
        dir.position.set(0, 2, 2);
        scene.add(dir);

        const OUTFIT_MAP_FEMALE: Record<string, string> = {
          casual: '/models/female_casual.vrm',
          cute: '/models/female_cute.vrm',
          dress: '/models/female_dress.vrm',
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
        const outfitMap = gender === 'male' ? OUTFIT_MAP_MALE : OUTFIT_MAP_FEMALE;
        const modelUrl = (outfitStyle && outfitMap[outfitStyle]) || (gender === 'male' ? '/models/base_male.vrm' : '/models/base_female.vrm');

        const loader = new GLTFLoader();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loader.register((p: any) => new VRMLoaderPlugin(p));

        loader.load(modelUrl, (gltf) => {
          if (disposed) return;
          const vrm = gltf.userData.vrm;
          if (!vrm) { setFailed(true); return; }

          VRMUtils.rotateVRM0(vrm);
          vrm.scene.rotation.y = Math.PI;
          scene.add(vrm.scene);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vrm.scene.traverse((obj: any) => {
            if (!(obj instanceof THREE.Mesh)) return;
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mats.forEach((m: any) => {
              const n = (obj.name + (m?.name || "")).toLowerCase();
              if ((n.includes("hair") || n.includes("髪")) && m?.color) {
                m.color.set(hairColor);
              }
            });
          });

          vrm.update(0);
          renderer.render(scene, camera);

          const dataUrl = canvas.toDataURL("image/png");
          if (!disposed) setCaptured(dataUrl);

          VRMUtils.deepDispose(vrm.scene);
          renderer.dispose();
        }, undefined, () => {
          if (!disposed) setFailed(true);
        });
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => { disposed = true; };
  }, [idolId, gender, hairColor, outfitStyle, size]);

  if (failed || !captured) {
    return (
      <div
        className="rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm"
        style={{ width: size, height: size }}
      >
        <span className="font-bold text-gray-700" style={{ fontSize: size * 0.35 }}>
          {name?.charAt(0) || "?"}
        </span>
        <canvas ref={canvasRef} style={{ display: "none" }} width={size * 2} height={size * 2} />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "none" }} width={size * 2} height={size * 2} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={captured}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }}
      />
    </div>
  );
}
