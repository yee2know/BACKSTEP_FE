"use client";

import { useState } from "react";
import { Navbar } from "../_components/Navbar";
import {
  CalendarIcon,
  UsersIcon,
  LinkIcon,
  UserIcon,
  HeartIcon,
  QuoteIcon,
  MessageCircleIcon,
  LightbulbIcon,
  LockIcon,
} from "lucide-react";

export default function PostDetailPage() {
  // Mock Data
  const post = {
    title: "Cistus Project",
    thumbnail: null as string | null, // In a real app, this would be a URL
    duration: "2024.01.15 - 2024.03.20",
    likes: 128,
    author: "Kim Developer",
    role: "Frontend Developer",
    teamSize: 4,
    tags: ["Communication", "React", "Schedule Management"],
    visibility: "paid", // private, free, paid
    price: 5000,
    resultLink: "https://github.com/example/cistus",
    goal: "To build a platform where developers can share their failures and learn from each other, turning setbacks into assets.",
    failures: [
      {
        tag: "Communication",
        question: "Communication 관련 가장 큰 어려움은 무엇이었나요?",
        answer:
          "We had a disconnect between the design team and the dev team regarding the feasibility of certain animations, leading to late-stage rework.",
      },
      {
        tag: "React",
        question: "React 관련 가장 큰 어려움은 무엇이었나요?",
        answer:
          "Managing complex global state without a proper library initially caused prop drilling hell. We had to refactor to use Zustand mid-project.",
      },
      {
        tag: "Schedule Management",
        question: "Schedule Management 관련 가장 큰 어려움은 무엇이었나요?",
        answer:
          "We underestimated the time required for QA and bug fixing, resulting in a 2-week delay in the final launch.",
      },
    ],
    lessons:
      "We learned that early communication between designers and developers is crucial. Also, setting up a solid state management strategy from day one saves a lot of time. Buffer time for QA is not optional.",
  };

  const [isUnlocked, setIsUnlocked] = useState(post.visibility !== "paid");

  const handlePurchase = async () => {
    if (
      confirm(
        `${post.price.toLocaleString()} 포인트를 사용하여 열람하시겠습니까?`
      )
    ) {
      // TODO: Call backend API to deduct points and verify purchase
      // await api.purchasePost(post.id);
      alert("구매가 완료되었습니다.");
      setIsUnlocked(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-24 pb-32">
        {/* Header Section */}
        <header className="mb-20">
          {/* 0. Thumbnail */}
          {post.thumbnail ? (
            <div className="mb-10 aspect-video w-full overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50 shadow-sm">
              <img
                src={post.thumbnail}
                alt="Thumbnail"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mb-10 aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-100/50 flex items-center justify-center">
              <span className="text-orange-300 font-bold text-2xl">
                썸네일 없음
              </span>
            </div>
          )}

          {/* 1. Title & Like */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <h1 className="text-5xl font-black tracking-tight text-zinc-900 leading-tight">
              {post.title}
            </h1>
            <button className="group flex flex-col items-center justify-center rounded-2xl bg-zinc-50 px-4 py-3 transition-all hover:bg-orange-50 hover:scale-105 active:scale-95">
              <HeartIcon className="h-7 w-7 text-zinc-400 transition-colors group-hover:text-orange-500 fill-transparent group-hover:fill-orange-500" />
              <span className="mt-1 text-xs font-bold text-zinc-500 group-hover:text-orange-600">
                {post.likes}
              </span>
            </button>
          </div>

          {/* 2. Tags */}
          <div className="mb-10 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-200"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 3. Meta Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-3xl bg-zinc-50/50 border border-zinc-100 p-8">
            <div className="space-y-6">
              {/* Role */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    역할
                  </p>
                  <p className="font-bold text-zinc-900 text-lg">{post.role}</p>
                </div>
              </div>

              {/* Team Size */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    팀 규모
                  </p>
                  <p className="font-bold text-zinc-900 text-lg">
                    {post.teamSize} 명
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Duration */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    진행 기간
                  </p>
                  <p className="font-bold text-zinc-900 text-lg">
                    {post.duration}
                  </p>
                </div>
              </div>

              {/* Result Link */}
              {post.resultLink && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-400">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      결과물
                    </p>
                    {isUnlocked ? (
                      <a
                        href={post.resultLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-bold text-orange-500 hover:text-orange-600 hover:underline decoration-2 underline-offset-4"
                      >
                        프로젝트 보러가기
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          {post.visibility === "paid"
                            ? `₩${post.price.toLocaleString()}`
                            : "무료"}
                        </span>
                      </a>
                    ) : (
                      <button
                        onClick={handlePurchase}
                        className="mt-1 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700"
                      >
                        <LockIcon className="h-3 w-3" />
                        <span>
                          {post.price.toLocaleString()}P로 결과물 확인
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="space-y-20">
          {/* Topic 1: Goal */}
          <section className="relative">
            <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-orange-500 to-orange-200 rounded-full opacity-20 md:-left-8"></div>
            <div className="flex items-center gap-3 mb-6">
              <QuoteIcon className="h-6 w-6 text-orange-500 fill-orange-500" />
              <h2 className="text-2xl font-black text-zinc-900">
                프로젝트 목표
              </h2>
            </div>
            <div className="text-xl font-medium leading-relaxed text-zinc-700 pl-2">
              "{post.goal}"
            </div>
          </section>

          {/* Topic 2: Failures */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <MessageCircleIcon className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-black text-zinc-900">
                실패 경험 & 도전
              </h2>
            </div>

            <div className="grid gap-8">
              {post.failures.map((failure, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-200"
                >
                  <div className="absolute top-0 left-0 h-full w-1.5 bg-zinc-100 group-hover:bg-orange-500 transition-colors"></div>
                  <div className="p-8 pl-10">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                        #{failure.tag}
                      </span>
                    </div>

                    <h3 className="mb-4 text-xl font-bold text-zinc-900">
                      Q. {failure.question}
                    </h3>

                    <div className="rounded-2xl bg-zinc-50 p-6 text-lg leading-relaxed text-zinc-700 group-hover:bg-orange-50/30 transition-colors">
                      {failure.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Topic 3: Lessons */}
          <section>
            <div className="rounded-3xl bg-zinc-900 p-10 text-white shadow-2xl shadow-zinc-200">
              <div className="flex items-center gap-3 mb-6">
                <LightbulbIcon className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-black text-white">배운 점</h2>
              </div>
              <div className="text-lg leading-relaxed text-zinc-300 font-medium">
                {post.lessons}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
