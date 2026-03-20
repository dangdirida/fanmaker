"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";

interface VRMPublishProps {
  vrmUrl: string;
  vrmFile: File | null;
  artistId?: string;
}

export default function VRMPublish({ vrmUrl, vrmFile, artistId }: VRMPublishProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // 프리뷰 캔버스에서 스크린샷 생성
  const generateThumbnail = useCallback(async () => {
    if (!canvasContainerRef.current) return;

    const THREE = await import("three");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(640, 480);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    const camera = new THREE.PerspectiveCamera(30, 640 / 480, 0.1, 100);
    camera.position.set(0, 1.3, 2.5);
    camera.lookAt(0, 1.0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 2, 3);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    try {
      const gltf = await loader.loadAsync(vrmUrl);
      const vrm = gltf.userData.vrm;
      if (!vrm) return;
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      vrm.scene.rotation.y = Math.PI;
      scene.add(vrm.scene);
      vrm.update(0);

      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL("image/png");
      setThumbnailUrl(dataUrl);
    } catch {
      // 썸네일 생성 실패 시 무시
    }

    renderer.dispose();
  }, [vrmUrl]);

  // 첫 렌더 시 썸네일 생성
  useState(() => {
    generateThumbnail();
  });

  const handlePublish = async () => {
    if (!title.trim()) return;
    setPublishing(true);

    try {
      const fileUrls: string[] = [];

      // VRM 파일 업로드 (Supabase storage)
      if (vrmFile) {
        const formData = new FormData();
        formData.append("file", vrmFile);
        formData.append("bucket", "vrm");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          fileUrls.push(uploadData.data.url);
        }
      }

      // 게시물 생성
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: "VIRTUAL",
          artistId: artistId || null,
          thumbnailUrl: thumbnailUrl || null,
          contentData: { vrmUrl: fileUrls[0] || vrmUrl },
          fileUrls,
          tags: ["VRM", "버추얼아이돌", "3D"],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublished(true);
      }
    } catch {
      alert("게시에 실패했습니다.");
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Send className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">게시 완료!</h3>
        <p className="text-gray-500 text-sm">
          피드에서 확인할 수 있습니다
        </p>
        <a
          href="/feed"
          className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          피드로 이동
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div ref={canvasContainerRef} className="hidden" />

      {/* 썸네일 프리뷰 */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <p className="text-xs text-gray-500 font-medium mb-3">썸네일 미리보기</p>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="썸네일"
            className="w-full rounded-xl"
          />
        ) : (
          <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* 제목 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          제목 *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="나만의 버추얼 아이돌을 소개하세요"
          maxLength={100}
          className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="캐릭터의 특징, 세계관, 컨셉 등을 자유롭게 작성하세요"
          rows={4}
          className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none transition-colors"
        />
      </div>

      {/* 게시 버튼 */}
      <button
        onClick={handlePublish}
        disabled={!title.trim() || publishing}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
      >
        {publishing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {publishing ? "게시 중..." : "피드에 게시"}
      </button>
    </div>
  );
}
