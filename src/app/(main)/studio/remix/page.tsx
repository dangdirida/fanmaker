import Link from "next/link";
import { Clock } from "lucide-react";

export default function RemixStudioPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Clock className="w-12 h-12 text-gray-400 mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        준비 중인 기능이에요
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        더 좋은 경험으로 곧 찾아올게요.
      </p>
      <Link
        href="/feed"
        className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        팬 유니버스로 돌아가기
      </Link>
    </div>
  );
}
