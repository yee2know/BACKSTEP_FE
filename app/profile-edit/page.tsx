"use client";

import { useState } from "react";
import { Navbar } from "../_components/Navbar";

export default function ProfileEditPage() {
  const [user, setUser] = useState({
    nickname: "Cistus User",
    email: "user@example.com",
    bio: "안녕하세요! 프론트엔드 개발에 관심이 많은 개발자입니다.\nReact와 Next.js를 주로 사용하며, 사용자 경험을 개선하는 UI 디자인에 흥미가 있습니다.\n꾸준히 기록하고 성장하는 개발자가 되고 싶습니다.",
  });

  const handleInputChange = (field: string, value: any) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 pt-24 pb-20">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-zinc-900">프로필 수정</h1>
          <p className="mt-2 text-zinc-500">
            나를 가장 잘 나타내는 프로필을 만들어보세요.
          </p>
        </div>

        <div className="space-y-10">
          {/* Profile Image Section */}
          <section className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-zinc-100 shadow-lg transition-all group-hover:border-orange-200">
                <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-4xl font-bold text-zinc-300 group-hover:bg-orange-50 group-hover:text-orange-300">
                  U
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <CameraIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <button className="mt-4 text-sm font-bold text-orange-500 hover:text-orange-600 hover:underline">
              이미지 변경
            </button>
          </section>

          {/* Basic Info Section */}
          <section className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                닉네임
              </label>
              <input
                type="text"
                value={user.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                이메일
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-500"
              />
              <p className="mt-1 text-xs text-zinc-400">
                이메일은 변경할 수 없습니다.
              </p>
            </div>
          </section>

          {/* Bio Section */}
          <section>
            <label className="mb-2 block text-sm font-bold text-zinc-700">
              자기소개
            </label>
            <textarea
              value={user.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="h-40 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="자신을 자유롭게 소개해주세요."
            />
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-zinc-100">
            <button className="flex-1 rounded-xl border border-zinc-200 bg-white py-4 font-bold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
              취소
            </button>
            <button className="flex-1 rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 hover:-translate-y-0.5">
              저장하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
