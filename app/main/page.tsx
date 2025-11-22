"use client";

import { useState, useEffect } from "react";

export default function MainPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchType, setSearchType] = useState<"post" | "profile">("post");

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 위치에 따라 상태 변경 (Two-component transition)
      if (window.scrollY > 300) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navigation Bar */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-6 backdrop-blur-md transition-all">
        {/* Left: Logo */}
        <div className="text-xl font-bold text-orange-500">Cistus</div>

        {/* Center: Nav Search Bar (Visible only when scrolled) */}
        <div
          className={`flex flex-1 items-center justify-center gap-4 transition-all duration-500 ${
            isScrolled
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-4 opacity-0"
          }`}
        >
          {/* Nav Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setSearchType("post")}
              className={`text-sm font-bold transition-colors ${
                searchType === "post" ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              글
            </button>
            <button
              onClick={() => setSearchType("profile")}
              className={`text-sm font-bold transition-colors ${
                searchType === "profile" ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              프로필
            </button>
          </div>

          <div className="w-full max-w-md">
            <input
              type="text"
              placeholder={searchType === "post" ? "글 검색" : "프로필 검색"}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200">
            {/* Profile Image Placeholder */}
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
              U
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Flow */}
      <main className="flex flex-col items-center">
        {/* Hero Section (Scrolls naturally) */}
        <div className="mt-[20vh] mb-8 flex flex-col items-center px-4">
          <h1
            className={`text-center text-5xl font-extrabold tracking-tight text-orange-500 sm:text-6xl transition-opacity duration-300 ${
              isScrolled ? "opacity-0" : "opacity-100"
            }`}
          >
            Cistus
          </h1>
        </div>

        {/* Hero Search Container */}
        <div
          className={`flex w-full flex-col items-center px-4 transition-opacity duration-300 ${
            isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="relative flex w-full max-w-2xl flex-col items-center">
            {/* Search Type Toggle */}
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setSearchType("post")}
                className={`text-lg font-bold transition-colors ${
                  searchType === "post" ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                글
              </button>
              <button
                onClick={() => setSearchType("profile")}
                className={`text-lg font-bold transition-colors ${
                  searchType === "profile" ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                프로필
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder={
                  searchType === "post"
                    ? "찾고 싶은 글을 검색해보세요"
                    : "찾고 싶은 프로필을 검색해보세요"
                }
                className="h-16 w-full rounded-2xl border-2 border-orange-100 bg-white px-6 text-lg shadow-xl shadow-orange-500/5 focus:border-orange-500 focus:outline-none"
              />
              <button className="absolute right-3 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-orange-500 px-6 font-bold text-white transition-all duration-300 hover:bg-orange-600">
                검색
              </button>
            </div>
          </div>

          {/* Tags Section */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["#React", "#NextJS", "#Frontend", "#Design", "#Career"].map(
              (tag) => (
                <button
                  key={tag}
                  className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-orange-100 hover:text-orange-600"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>

        {/* Spacer to separate posts from the hero area visually */}
        <div className="h-24"></div>

        {/* Content Sections */}
        <div className="w-full max-w-6xl space-y-12 px-6 pb-20">
          {/* Weekly Popular Posts */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-zinc-800">
              주간 인기 글
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, i) => (
                <article
                  key={i}
                  className="group min-w-[280px] cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:min-w-[320px]"
                >
                  <div className="aspect-video w-full bg-zinc-100 transition-colors group-hover:bg-orange-50"></div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                        Popular
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-zinc-900 group-hover:text-orange-500">
                      인기 게시글 {i + 1}
                    </h3>
                    <p className="line-clamp-2 text-sm text-zinc-500">
                      많은 사람들이 읽고 있는 인기 글입니다.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Recent Posts */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-zinc-800">최근 글</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, i) => (
                <article
                  key={i}
                  className="group min-w-[280px] cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:min-w-[320px]"
                >
                  <div className="aspect-video w-full bg-zinc-100 transition-colors group-hover:bg-orange-50"></div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Just now</span>
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-zinc-900 group-hover:text-orange-500">
                      최근 게시글 {i + 1}
                    </h3>
                    <p className="line-clamp-2 text-sm text-zinc-500">
                      방금 올라온 따끈따끈한 새 글입니다.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
