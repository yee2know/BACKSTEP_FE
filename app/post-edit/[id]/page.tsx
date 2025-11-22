"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../_components/Navbar";
import {
  CalendarIcon,
  UsersIcon,
  XIcon,
  SparklesIcon,
  PlusIcon,
  LinkIcon,
  ImageIcon,
  UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { TAG_DATA, AVAILABLE_TAGS } from "../../../lib/tags";
import { api, ApiResponse } from "../../../lib/api";

interface FailureData {
  tag: string;
  questions: string[];
  answers: string[];
}

interface ApiProjectDetail {
  name: string;
  user: string;
  nickname: string;
  period: string;
  personnel: number;
  intent: string;
  my_role: string;
  sale_status: string;
  is_free: string | boolean;
  price: number;
  result_url: string;
  failure_category: string[];
  failure: Record<string, string[]>[];
  growth_point: string;
}

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for the post being edited
  const [post, setPost] = useState({
    title: "",
    thumbnail: null as string | null,
    duration: "",
    likes: 0,
    author: "",
    authorId: "", // To store 'user' field from API
    role: "",
    teamSize: 0,
    tags: [] as string[],
    visibility: "free", // private, free, paid
    price: 0,
    resultLink: "",
    goal: "",
    failures: [] as FailureData[],
    lessons: "",
  });

  // Fetch existing data
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await api.get<ApiResponse<ApiProjectDetail>>(
          `/projects/${id}`
        );

        if (response.success) {
          const data = response.data;

          // Map API data to UI state
          const mappedFailures: FailureData[] = data.failure.map(
            (item: Record<string, string[]>) => {
              const tag = Object.keys(item)[0];
              const answers = item[tag];
              const questions = TAG_DATA[tag] || ["질문 1", "질문 2", "질문 3"];
              return { tag, questions, answers };
            }
          );

          const isFree = data.is_free === "true" || data.is_free === true;
          const visibility = isFree
            ? "free"
            : data.sale_status === "SALE"
            ? "paid"
            : "private";

          setPost({
            title: data.name,
            thumbnail: null,
            duration: data.period,
            likes: 0,
            author: data.nickname,
            authorId: data.user,
            role: data.my_role,
            teamSize: data.personnel,
            tags: data.failure_category,
            visibility: visibility,
            price: data.price,
            resultLink: data.result_url,
            goal: data.intent,
            failures: mappedFailures,
            lessons: data.growth_point,
          });

          // Set date states from duration string if possible
          if (data.period.includes(" - ")) {
            const [start, end] = data.period.split(" - ");
            setStartDate(start);
            setEndDate(end);
          } else if (data.period.includes(" ~ ")) {
            const [start, end] = data.period.split(" ~ ");
            setStartDate(start);
            setEndDate(end);
          }
        } else {
          alert(response.message || "글을 불러오는데 실패했습니다.");
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        alert("서버 통신 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  const [newTag, setNewTag] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagInputText, setTagInputText] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);

  // Date states
  const [startDate, setStartDate] = useState("2024.01.15");
  const [endDate, setEndDate] = useState("2024.03.20");

  // Sync dates to post.duration
  useEffect(() => {
    setPost((prev) => ({ ...prev, duration: `${startDate} ~ ${endDate}` }));
  }, [startDate, endDate]);

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
      // Mock backend request
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response: Recommend random tags, goal, and failures
      const recommendedTags = AVAILABLE_TAGS.sort(
        () => 0.5 - Math.random()
      ).slice(0, 3);

      const mockGoal =
        "AI가 분석한 프로젝트 목표: 효율적인 협업과 기술적 도전을 통해 성장하는 것을 목표로 했습니다.";

      const mockFailures = recommendedTags.map((tag: string) => ({
        tag: tag,
        questions: TAG_DATA[tag] || [
          `${tag} 관련 가장 큰 어려움은 무엇이었나요?`,
          "해결 과정은 어땠나요?",
          "배운 점은 무엇인가요?",
        ],
        answers: [
          `AI가 분석한 ${tag} 관련 실패 경험: 초기 설계 미흡으로 인한 재작업 발생.`,
          "팀원들과의 긴밀한 소통으로 해결.",
          "초기 기획의 중요성을 깨달음.",
        ],
      }));

      // Update state
      setPost((prev) => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...recommendedTags])],
        goal: mockGoal,
        failures: mockFailures,
      }));

      setIsTagModalOpen(false);
      setTagInputText("");
    } catch (error) {
      console.error("Failed to get AI recommendations", error);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleSave = async () => {
    if (!post.title || !post.goal || !post.lessons) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: post.title,
        period: `${startDate} ~ ${endDate}`,
        personnel: post.teamSize,
        intent: post.goal,
        my_role: post.role,
        sale_status: post.visibility === "paid" ? "SALE" : "NOTSALE",
        is_free: post.visibility === "free",
        price: post.price,
        result_url: post.resultLink,
        failure_category: post.tags,
        failure: post.failures.map((f) => ({ [f.tag]: f.answers })),
        growth_point: post.lessons,
      };

      console.log("Sending payload:", payload); // Debug payload

      const response = await api.patch(`/projects/${id}`, payload);

      if (response.success) {
        alert("글 수정이 완료되었습니다.");
        router.push(`/post-detail/${id}`);
      } else {
        alert(response.message || "글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to save post", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
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
                  <span className="font-bold">프로젝트 목표</span>
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
                    disabled={post.visibility === "private"}
                    placeholder={
                      post.visibility === "private"
                        ? "비공개 설정 시 링크를 입력할 수 없습니다"
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
              <div className="relative group">
                <button className="flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-zinc-400 ring-1 ring-zinc-200 transition-all group-hover:bg-zinc-50 group-hover:text-zinc-600 group-hover:ring-zinc-300">
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>태그 추가</span>
                </button>
                <select
                  value=""
                  onChange={(e) => {
                    addTag(e.target.value);
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                >
                  <option value="">태그 추가</option>
                  {AVAILABLE_TAGS.filter(
                    (tag: string) => !post.tags.includes(tag)
                  ).map((tag: string) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
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
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-8 py-3 text-base font-bold text-white transition-colors hover:bg-zinc-700"
          >
            <SaveIcon className="h-5 w-5" />
            {saving ? "저장중..." : "저장하기"}
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
