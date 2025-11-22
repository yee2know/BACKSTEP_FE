"use client";

import { useState } from "react";
import { Navbar } from "../_components/Navbar";

export default function PostDetailPage() {
  // Mock Data
  const post = {
    title: "Cistus Project",
    duration: "2024.01.15 - 2024.03.20",
    likes: 128,
    author: "Kim Developer",
    teamSize: 4,
    tags: ["Communication", "React", "Schedule Management"],
    visibility: "public", // public, private, free, paid
    goal: "To build a platform where developers can share their failures and learn from each other, turning setbacks into assets.",
    failures: [
      {
        tag: "Communication",
        question: "What was the biggest communication hurdle?",
        answer:
          "We had a disconnect between the design team and the dev team regarding the feasibility of certain animations, leading to late-stage rework.",
      },
      {
        tag: "React",
        question: "What technical challenges did you face with React?",
        answer:
          "Managing complex global state without a proper library initially caused prop drilling hell. We had to refactor to use Zustand mid-project.",
      },
      {
        tag: "Schedule Management",
        question: "How did the schedule slip?",
        answer:
          "We underestimated the time required for QA and bug fixing, resulting in a 2-week delay in the final launch.",
      },
    ],
    lessons:
      "We learned that early communication between designers and developers is crucial. Also, setting up a solid state management strategy from day one saves a lot of time. Buffer time for QA is not optional.",
  };

  const visibilityOptions = [
    { id: "public", label: "모두 공개" },
    { id: "private", label: "비공개" },
    { id: "free", label: "무료" },
    { id: "paid", label: "유료" },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-24 pb-20">
        {/* Header Section */}
        <header className="mb-12 border-b border-zinc-100 pb-8">
          {/* Row 1: Title, Duration, Like */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                {post.title}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                <CalendarIcon className="h-4 w-4" />
                <span>{post.duration}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button className="group flex flex-col items-center justify-center rounded-full p-2 transition-colors hover:bg-orange-50">
                <HeartIcon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-orange-500" />
                <span className="text-xs font-bold text-zinc-500 group-hover:text-orange-500">
                  {post.likes}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Author, Team Size */}
          <div className="mb-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-zinc-200" />{" "}
              {/* Placeholder Avatar */}
              <span className="font-medium text-zinc-900">{post.author}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <UsersIcon className="h-4 w-4" />
              <span className="text-sm">{post.teamSize}명</span>
            </div>
          </div>

          {/* Row 3: Tags */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Row 4: Visibility & Modify */}
          <div className="flex items-center justify-between">
            {/* Visibility Toggle (Display Only) */}
            <div className="flex overflow-hidden rounded-lg border border-zinc-200 p-1">
              {visibilityOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    post.visibility === option.id
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-zinc-400 bg-transparent"
                  }`}
                >
                  {option.label}
                </div>
              ))}
            </div>

            {/* Modify Button */}
            <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-zinc-700">
              <EditIcon className="h-4 w-4" />
              수정하기
            </button>
          </div>
        </header>

        {/* Content Section */}
        <div className="space-y-12">
          {/* Topic 1: Goal */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-orange-500">
              1. 프로젝트 목표
            </h2>
            <p className="leading-relaxed text-zinc-700">{post.goal}</p>
          </section>

          {/* Topic 2: Failures (Dynamic based on tags) */}
          <section>
            <h2 className="mb-6 text-xl font-bold text-orange-500">
              2. 실패 경험 (태그별 회고)
            </h2>
            <div className="space-y-8">
              {post.failures.map((failure, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-100 bg-zinc-50 p-6"
                >
                  <div className="mb-3 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                    #{failure.tag}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-zinc-900">
                    Q. {failure.question}
                  </h3>
                  <p className="text-zinc-700">{failure.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Topic 3: Lessons */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-orange-500">
              3. 배운 점
            </h2>
            <p className="leading-relaxed text-zinc-700">{post.lessons}</p>
          </section>
        </div>
      </main>
    </div>
  );
}

// Simple Icons
function CalendarIcon({ className }: { className?: string }) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
