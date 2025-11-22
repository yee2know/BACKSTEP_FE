"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../_components/Navbar";

export default function PostEditPage() {
  // State for the post being edited
  const [post, setPost] = useState({
    title: "Cistus Project",
    duration: "2024.01.15 - 2024.03.20",
    likes: 128, // Likes are usually not editable by the user directly in this context, but kept for structure
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
  });

  const [newTag, setNewTag] = useState("");

  // Date states
  const [startDate, setStartDate] = useState("2024.01.15");
  const [endDate, setEndDate] = useState("2024.03.20");

  // Sync dates to post.duration
  useEffect(() => {
    setPost((prev) => ({ ...prev, duration: `${startDate} - ${endDate}` }));
  }, [startDate, endDate]);

  const visibilityOptions = [
    { id: "public", label: "모두 공개" },
    { id: "private", label: "비공개" },
    { id: "free", label: "무료" },
    { id: "paid", label: "유료" },
  ];

  const AVAILABLE_TAGS = [
    "Communication",
    "React",
    "NextJS",
    "TypeScript",
    "Schedule Management",
    "Design",
    "Backend",
    "Frontend",
    "Planning",
    "DevOps",
  ];

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleFailureChange = (index: number, field: string, value: string) => {
    const newFailures = [...post.failures];
    newFailures[index] = { ...newFailures[index], [field]: value };
    setPost((prev) => ({ ...prev, failures: newFailures }));
  };

  const addFailure = () => {
    setPost((prev) => ({
      ...prev,
      failures: [...prev.failures, { tag: "", question: "", answer: "" }],
    }));
  };

  const removeFailure = (index: number) => {
    setPost((prev) => ({
      ...prev,
      failures: prev.failures.filter((_, i) => i !== index),
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !post.tags.includes(tag)) {
      setPost((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-24 pb-20">
        {/* Header Section */}
        <header className="mb-12 border-b border-zinc-100 pb-8">
          {/* Row 1: Title, Duration */}
          <div className="mb-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-500">
                프로젝트 제목
              </label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-2xl font-extrabold text-zinc-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-500">
                진행 기간
              </label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-zinc-400" />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="YYYY.MM.DD"
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-zinc-400">-</span>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="진행중"
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Author (Read-only), Team Size */}
          <div className="mb-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-zinc-200" />
              <span className="font-medium text-zinc-900">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-zinc-600" />
              <input
                type="number"
                value={post.teamSize}
                onChange={(e) =>
                  handleInputChange("teamSize", parseInt(e.target.value) || 0)
                }
                className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none"
              />
              <span className="text-sm text-zinc-600">명</span>
            </div>
          </div>

          {/* Row 3: Tags */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-zinc-500">
              태그 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-zinc-200"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <select
                value={newTag}
                onChange={(e) => {
                  addTag(e.target.value);
                  setNewTag(""); // Reset select after adding
                }}
                className="min-w-[100px] rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">태그 추가...</option>
                {AVAILABLE_TAGS.filter((tag) => !post.tags.includes(tag)).map(
                  (tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Row 4: Visibility & Save */}
          <div className="flex items-center justify-between">
            {/* Visibility Toggle */}
            <div className="flex overflow-hidden rounded-lg border border-zinc-200 p-1">
              {visibilityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleInputChange("visibility", option.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    post.visibility === option.id
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Save Button */}
            <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-zinc-700">
              <SaveIcon className="h-4 w-4" />
              저장하기
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
            <textarea
              value={post.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              className="h-32 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-700 focus:border-orange-500 focus:outline-none"
              placeholder="프로젝트의 목표를 작성해주세요."
            />
          </section>

          {/* Topic 2: Failures */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-orange-500">
                2. 실패 경험 (태그별 회고)
              </h2>
              <button
                onClick={addFailure}
                className="rounded-lg bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-600 hover:bg-orange-200"
              >
                + 질문 추가
              </button>
            </div>
            <div className="space-y-8">
              {post.failures.map((failure, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-zinc-100 bg-zinc-50 p-6"
                >
                  <button
                    onClick={() => removeFailure(index)}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>

                  {/* Tag Selection for Failure */}
                  <div className="mb-4">
                    <label className="mb-1 block text-xs font-bold text-zinc-500">
                      관련 태그
                    </label>
                    <select
                      value={failure.tag}
                      onChange={(e) =>
                        handleFailureChange(index, "tag", e.target.value)
                      }
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">태그 선택</option>
                      {post.tags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <label className="mb-1 block text-xs font-bold text-zinc-500">
                      질문 (Question)
                    </label>
                    <input
                      type="text"
                      value={failure.question}
                      onChange={(e) =>
                        handleFailureChange(index, "question", e.target.value)
                      }
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-900 focus:border-orange-500 focus:outline-none"
                      placeholder="질문을 입력하세요"
                    />
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-zinc-500">
                      답변 (Answer)
                    </label>
                    <textarea
                      value={failure.answer}
                      onChange={(e) =>
                        handleFailureChange(index, "answer", e.target.value)
                      }
                      className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-orange-500 focus:outline-none"
                      placeholder="답변을 입력하세요"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Topic 3: Lessons */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-orange-500">
              3. 배운 점
            </h2>
            <textarea
              value={post.lessons}
              onChange={(e) => handleInputChange("lessons", e.target.value)}
              className="h-32 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-700 focus:border-orange-500 focus:outline-none"
              placeholder="이번 프로젝트를 통해 배운 점을 작성해주세요."
            />
          </section>
        </div>
      </main>
    </div>
  );
}

// Icons
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

function SaveIcon({ className }: { className?: string }) {
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
