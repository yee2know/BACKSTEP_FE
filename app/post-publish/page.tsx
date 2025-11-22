"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../_components/Navbar";
import {
  CalendarIcon,
  UsersIcon,
  XIcon,
  SparklesIcon,
  PlusIcon,
  LinkIcon,
  ImageIcon,
  UserIcon,
  ChevronDownIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { api, ApiResponse } from "../../lib/api";
import { TAG_DATA, AVAILABLE_TAGS } from "../../lib/tags";
import { generateRetrospective } from "../../lib/gemini";

export default function PostPublishPage() {
  // State for the new post
  const [post, setPost] = useState({
    title: "",
    thumbnail: null as string | null,
    duration: "",
    author: "Kim Developer",
    role: "",
    teamSize: 1,
    tags: [] as string[],
    visibility: "free", // private, free, paid
    price: 0,
    resultLink: "",
    goal: "",
    failures: [] as { tag: string; questions: string[]; answers: string[] }[],
    lessons: "",
  });

  const [newTag, setNewTag] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagInputText, setTagInputText] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // Date states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sync dates to post.duration
  useEffect(() => {
    setPost((prev) => ({ ...prev, duration: `${startDate} - ${endDate}` }));
  }, [startDate, endDate]);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isTagDropdownOpen && !target.closest(".tag-dropdown-container")) {
        setIsTagDropdownOpen(false);
      }
    };

    if (isTagDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  const visibilityOptions = [
    { id: "private", label: "비공개" },
    { id: "free", label: "무료공개" },
    { id: "paid", label: "유료공개" },
  ];

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleFailureChange = (
    failureIndex: number,
    answerIndex: number,
    value: string
  ) => {
    const newFailures = [...post.failures];
    const newAnswers = [...newFailures[failureIndex].answers];
    newAnswers[answerIndex] = value;
    newFailures[failureIndex] = {
      ...newFailures[failureIndex],
      answers: newAnswers,
    };
    setPost((prev) => ({ ...prev, failures: newFailures }));
  };

  const removeFailure = (index: number) => {
    setPost((prev) => ({
      ...prev,
      failures: prev.failures.filter((_, i) => i !== index),
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !post.tags.includes(tag)) {
      const questions = TAG_DATA[tag] || [
        `${tag} 관련 가장 큰 어려움은 무엇이었나요?`,
        "해결 과정은 어땠나요?",
        "배운 점은 무엇인가요?",
      ];

      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        failures: [
          ...prev.failures,
          {
            tag: tag,
            questions: questions,
            answers: ["", "", ""],
          },
        ],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
      failures: prev.failures.filter((f) => f.tag !== tagToRemove),
    }));
  };

  const handleAIAutoFill = async () => {
    if (!tagInputText.trim()) return;

    setIsRecommending(true);
    try {
      const aiData = await generateRetrospective(tagInputText);

      const newFailures = aiData.tags.map((tag: string) => {
        const qa = aiData[tag] || {};
        const questions = Object.keys(qa);
        const answers = Object.values(qa) as string[];

        // Fallback if questions/answers are missing or don't match expected format
        if (questions.length === 0) {
          const defaultQuestions = TAG_DATA[tag] || ["질문1", "질문2", "질문3"];
          return {
            tag,
            questions: defaultQuestions,
            answers: ["", "", ""],
          };
        }

        return {
          tag,
          questions,
          answers,
        };
      });

      // Update state
      setPost((prev) => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...aiData.tags])],
        // goal: mockGoal, // Removed as it's not in the new AI response
        failures: newFailures,
      }));

      setIsTagModalOpen(false);
      setTagInputText("");
    } catch (error) {
      console.error("Failed to get AI recommendations", error);
      alert("AI 회고 생성 중 오류가 발생했습니다.");
    } finally {
      setIsRecommending(false);
    }
  };

  const handlePublish = async () => {
    // Validation
    if (post.visibility !== "private" && !post.resultLink.trim()) {
      alert("무료/유료 공개 시 결과물 링크는 필수입니다.");
      return;
    }

    if (
      post.resultLink.trim() &&
      !/^https?:\/\//.test(post.resultLink.trim())
    ) {
      alert(
        "링크는 'http://' 또는 'https://'로 시작하는 전체 URL이어야 합니다."
      );
      return;
    }

    const body = {
      name: post.title,
      period: post.duration,
      personnel: post.teamSize,
      intent: post.goal,
      my_role: post.role,
      sale_status:
        post.visibility === "paid"
          ? "ONSALE"
          : post.visibility === "free"
          ? "FREE"
          : "NOTSALE",
      is_free: post.visibility === "free",
      price: post.price,
      result_url: post.resultLink,
      failure_category: post.tags,
      failure: post.failures.map((f) => ({
        [f.tag]: f.answers,
      })),
      growth_point: post.lessons,
    };

    try {
      const data = await api.post<ApiResponse>("/projects", body);

      if (data.success) {
        alert(data.message || "게시글이 성공적으로 등록되었습니다.");
        window.location.href = "/";
      } else {
        alert(`오류 발생: ${data.message} (Code: ${data.code})`);
      }
    } catch (error) {
      console.error("Publish error:", error);
      if (error instanceof Error && error.message !== "Unauthorized") {
        alert("게시 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      {/* AI Auto-Fill Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-orange-100 p-2">
                  <SparklesIcon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900">
                  AI 프로젝트 회고 작성
                </h3>
              </div>
              <button
                onClick={() => setIsTagModalOpen(false)}
                className="rounded-full p-2 hover:bg-zinc-100"
              >
                <XIcon className="h-6 w-6 text-zinc-500" />
              </button>
            </div>

            <div className="mb-6 space-y-2 rounded-xl bg-orange-50 p-4 text-sm text-orange-800">
              <p className="font-bold">
                💡 AI가 다음 내용을 자동으로 작성해드립니다:
              </p>
              <ul className="list-inside list-disc space-y-1 ml-2">
                <li>
                  프로젝트 성격에 맞는{" "}
                  <span className="font-bold">태그 추천</span>
                </li>
                <li>
                  핵심 내용을 요약한{" "}
                  <span className="font-bold">프로젝트 설명</span>
                </li>
                <li>
                  태그별{" "}
                  <span className="font-bold">실패 경험 및 회고 질문</span>
                </li>
              </ul>
            </div>

            <textarea
              value={tagInputText}
              onChange={(e) => setTagInputText(e.target.value)}
              placeholder="프로젝트에서 겪었던 경험, 어려움, 배운 점 등을 자유롭게 작성해주세요. 자세히 적을수록 더 정확한 회고가 생성됩니다..."
              className="mb-8 h-60 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-base leading-relaxed focus:border-orange-500 focus:outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsTagModalOpen(false)}
                className="rounded-xl px-6 py-3 text-base font-bold text-zinc-500 hover:bg-zinc-100"
              >
                취소
              </button>
              <button
                onClick={handleAIAutoFill}
                disabled={!tagInputText.trim() || isRecommending}
                className={`flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-base font-bold text-white transition-all ${
                  !tagInputText.trim() || isRecommending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                }`}
              >
                {isRecommending ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    AI가 회고를 분석하고 작성중입니다...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    AI로 회고 자동 작성하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-6 pt-24 pb-20">
        {/* Header Section */}
        <header className="mb-16 mx-auto max-w-4xl">
          {/* 0. Thumbnail Upload */}
          <div className="mb-8">
            <div className="group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-orange-500 hover:bg-orange-50">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleInputChange("thumbnail", reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {post.thumbnail ? (
                <img
                  src={post.thumbnail}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400 transition-colors group-hover:text-orange-500">
                  <ImageIcon className="h-12 w-12" />
                  <span className="text-sm font-bold">
                    대표 사진을 업로드하세요
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 1. Title */}
          <div className="mb-8">
            <input
              type="text"
              value={post.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="프로젝트 제목을 입력하세요"
              className="w-full bg-transparent text-4xl font-black tracking-tight text-zinc-900 placeholder:text-zinc-200 focus:outline-none"
            />
          </div>

          {/* 2. Meta Info & Visibility Control Bar */}
          <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-zinc-50 p-6 md:flex-row md:items-start md:justify-between">
            {/* Left: Meta Info (Role, Team, Duration) */}
            <div className="space-y-4">
              {/* Role */}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>나의 역할</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={post.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    placeholder="역할을 입력하세요"
                    className="w-40 border-b border-zinc-300 bg-transparent text-center font-bold text-zinc-900 placeholder:text-zinc-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Team Size */}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  <span>참여 인원</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={post.teamSize}
                    onChange={(e) =>
                      handleInputChange(
                        "teamSize",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-10 border-b border-zinc-300 bg-transparent text-center font-bold text-zinc-900 focus:border-orange-500 focus:outline-none"
                  />
                  <span>명</span>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>진행 기간</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="YYYY.MM.DD"
                    className="w-24 border-b border-zinc-300 bg-transparent text-center font-medium text-zinc-900 placeholder:text-zinc-300 focus:border-orange-500 focus:outline-none"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="진행중"
                    className="w-24 border-b border-zinc-300 bg-transparent text-center font-medium text-zinc-900 placeholder:text-zinc-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: Visibility */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-zinc-100">
                {visibilityOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleInputChange("visibility", option.id)}
                    className={`relative px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                      post.visibility === option.id
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    {post.visibility === option.id && (
                      <motion.div
                        layoutId="visibility-indicator"
                        className="absolute inset-0 rounded-md bg-zinc-900"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10">{option.label}</span>
                  </button>
                ))}
              </div>
              {post.visibility === "paid" && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <input
                    type="number"
                    value={post.price}
                    onChange={(e) =>
                      handleInputChange("price", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-20 border-b border-zinc-300 bg-transparent text-right font-bold text-zinc-900 focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-sm font-bold text-zinc-500">원</span>
                </div>
              )}

              {/* Result Link Input */}
              <div className="mt-2 flex w-full flex-col items-end gap-1">
                <div className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-zinc-100 transition-all focus-within:ring-orange-500">
                  <LinkIcon className="h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={post.resultLink}
                    onChange={(e) =>
                      handleInputChange("resultLink", e.target.value)
                    }
                    placeholder={
                      post.visibility === "private"
                        ? "결과물 링크 (선택사항)"
                        : "결과물 링크 (https://...)"
                    }
                    className="w-full bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-300 focus:outline-none disabled:cursor-not-allowed disabled:text-zinc-400"
                  />
                </div>
                {post.visibility === "paid" && (
                  <span className="text-xs font-bold text-orange-500">
                    * 구매자에게만 공개됩니다
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. AI Button */}
          <button
            onClick={() => setIsTagModalOpen(true)}
            className="group relative mb-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-br from-orange-500 to-orange-600 py-3 text-base font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01] hover:shadow-orange-500/30"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            <span>AI로 회고 자동 작성하기</span>
          </button>

          {/* 4. Tags */}
          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold text-zinc-700">태그</span>
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-200"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-zinc-300"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="relative tag-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-base font-bold text-zinc-600 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 hover:shadow-md hover:ring-zinc-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>태그 추가</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                      isTagDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isTagDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-lg ring-1 ring-black/5 z-10">
                    {AVAILABLE_TAGS.filter((tag) => !post.tags.includes(tag))
                      .length > 0 ? (
                      AVAILABLE_TAGS.filter(
                        (tag) => !post.tags.includes(tag)
                      ).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            addTag(tag);
                            setIsTagDropdownOpen(false);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
                        >
                          {tag}
                        </button>
                      ))
                    ) : (
                      <div className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-400">
                        추가할 태그가 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="space-y-12">
          {/* Topic 1: Goal */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-orange-500">
              1. 프로젝트 설명
            </h2>
            <textarea
              value={post.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              className="h-32 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-700 focus:border-orange-500 focus:outline-none"
              placeholder="프로젝트의 설명을 작성해주세요."
            />
          </section>

          {/* Topic 2: Failures */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-orange-500">
                2. 실패 경험 (태그별 회고)
              </h2>
            </div>
            <div className="space-y-8">
              {post.failures.map((failure, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-zinc-100 bg-zinc-50 p-6"
                >
                  {/* Tag Selection for Failure (Read-only) */}
                  <div className="mb-4">
                    <label className="mb-1 block text-xs font-bold text-zinc-500">
                      관련 태그
                    </label>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-bold text-zinc-700">
                      {failure.tag}
                    </div>
                  </div>

                  {/* Questions and Answers */}
                  <div className="space-y-6">
                    {failure.questions.map((question, qIndex) => (
                      <div key={qIndex}>
                        {/* Question */}
                        <div className="mb-2">
                          <label className="mb-1 block text-xs font-bold text-zinc-500">
                            질문 {qIndex + 1}
                          </label>
                          <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-500">
                            {question}
                          </div>
                        </div>

                        {/* Answer */}
                        <div>
                          <label className="mb-1 block text-xs font-bold text-zinc-500">
                            답변
                          </label>
                          <textarea
                            value={failure.answers[qIndex]}
                            onChange={(e) =>
                              handleFailureChange(index, qIndex, e.target.value)
                            }
                            className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-orange-500 focus:outline-none"
                            placeholder="답변을 입력하세요"
                          />
                        </div>
                      </div>
                    ))}
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

        {/* Save Button (Moved to Bottom) */}
        <div className="mt-12 flex justify-end border-t border-zinc-100 pt-8">
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-8 py-3 text-base font-bold text-white transition-colors hover:bg-zinc-700"
          >
            <SaveIcon className="h-5 w-5" />
            게시하기
          </button>
        </div>
      </main>
    </div>
  );
}

// Icons
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
