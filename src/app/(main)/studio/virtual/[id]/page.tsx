"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import StepIndicator from "./components/StepIndicator";
import Step1_Identity from "./components/Step1_Identity";
import Step2_Appearance from "./components/Step2_Appearance";
import Step3_Voice from "./components/Step3_Voice";
import Step4_Publish from "./components/Step4_Publish";
import LivePreviewPanel from "./components/LivePreviewPanel";

type VirtualIdol = {
  id: string;
  name: string;
  concept: string | null;
  personality: string | null;
  voiceType: string;
  voiceDesc: string | null;
  positions: string[];
  genres: string[];
  gender: string;
  stylePreset: string;
  hairColor: string;
  hairLength: string;
  skinTone: string;
  eyeColor: string;
  outfitStyle: string;
  accessories: string[];
  baseModel: string;
  isDraft: boolean;
  step: number;
};

export default function VirtualIdolWizardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [idol, setIdol] = useState<VirtualIdol | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // 데이터 로드
  useEffect(() => {
    fetch(`/api/virtual-idols/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setIdol(d.data);
          setCurrentStep(d.data.step || 1);
        } else {
          router.replace("/studio/virtual");
        }
      })
      .catch(() => router.replace("/studio/virtual"))
      .finally(() => setLoading(false));
  }, [id, router]);

  // 자동저장 (debounce 1.5초)
  const autoSave = useCallback(
    (data: VirtualIdol) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSaving("saving");
        try {
          const res = await fetch(`/api/virtual-idols/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            setSaving("saved");
            setTimeout(() => setSaving("idle"), 2000);
          } else {
            setSaving("error");
          }
        } catch {
          setSaving("error");
        }
      }, 1500);
    },
    [id]
  );

  const handleUpdate = useCallback(
    (partial: Partial<VirtualIdol>) => {
      setIdol((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...partial };
        autoSave(next);
        return next;
      });
    },
    [autoSave]
  );

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      handleUpdate({ step });
    },
    [handleUpdate]
  );

  if (loading || !idol) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const completedSteps = Array.from({ length: currentStep }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 좌측: Step 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {currentStep === 1 && (
            <Step1_Identity
              idol={idol}
              onUpdate={handleUpdate}
              onNext={() => goToStep(2)}
            />
          )}
          {currentStep === 2 && (
            <Step2_Appearance
              idol={idol}
              onUpdate={handleUpdate}
              onPrev={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          )}
          {currentStep === 3 && (
            <Step3_Voice
              idol={idol}
              onUpdate={handleUpdate}
              onPrev={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />
          )}
          {currentStep === 4 && (
            <Step4_Publish idol={idol} onPrev={() => goToStep(3)} />
          )}
        </div>

        {/* 우측: 라이브 프리뷰 */}
        <div className="lg:w-[340px] flex-shrink-0">
          <LivePreviewPanel idol={idol} saving={saving} />
        </div>
      </div>
    </div>
  );
}
