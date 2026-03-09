"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileAudio, FileImage, FileVideo, Loader2 } from "lucide-react";

interface FileUploaderProps {
  accept: string;
  maxMB: number;
  bucket: "audio" | "images" | "videos";
  onUpload: (url: string) => void;
  label?: string;
}

export default function FileUploader({
  accept,
  maxMB,
  bucket,
  onUpload,
  label,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      setProgress(0);

      // 시뮬레이트 진행률
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        clearInterval(progressInterval);

        if (data.success) {
          setProgress(100);
          setFileName(file.name);
          if (bucket === "images" && file.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(file));
          }
          onUpload(data.data.url);
        } else {
          setError(data.message || "업로드에 실패했습니다");
        }
      } catch {
        clearInterval(progressInterval);
        setError("업로드 중 오류가 발생했습니다");
      } finally {
        setUploading(false);
      }
    },
    [bucket, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const reset = () => {
    setPreview(null);
    setFileName(null);
    setProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const Icon = bucket === "audio" ? FileAudio : bucket === "videos" ? FileVideo : FileImage;

  return (
    <div>
      {!fileName ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#ff3d7f] bg-[#ff3d7f]/5"
              : "border-gray-700 hover:border-gray-600"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 text-[#ff3d7f] animate-spin mx-auto" />
              <div className="w-48 mx-auto bg-gray-800 rounded-full h-2">
                <div
                  className="bg-[#ff3d7f] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{progress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {label || "파일을 드래그하거나 클릭해서 선택하세요"}
              </p>
              <p className="text-xs text-gray-600 mt-1">최대 {maxMB}MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-3">
          {preview ? (
            <img src={preview} alt="" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <Icon className="w-10 h-10 text-gray-500" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{fileName}</p>
            <p className="text-xs text-green-400">업로드 완료</p>
          </div>
          <button onClick={reset} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
