"use client";

import Link from "next/link";
import { Navbar } from "./_components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-6xl font-extrabold text-orange-500 sm:text-8xl">
          404
        </h1>
        <h2 className="mb-6 text-2xl font-bold text-zinc-800 sm:text-3xl">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mb-10 max-w-md text-zinc-500">
          요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.
          입력하신 주소가 정확한지 다시 한 번 확인해 주세요.
        </p>

        <Link
          href="/"
          className="rounded-xl bg-orange-500 px-8 py-3 text-lg font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
        >
          홈으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
