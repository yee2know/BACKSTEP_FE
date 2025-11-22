"use client";

import { useState, useEffect } from "react";

export default function MainPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 위치에 따라 스타일 변경 (sticky 효과와 맞추기 위해 조정)
      if (window.scrollY > 260) {
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
      <nav className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-6 backdrop-blur-md transition-all">
        {/* Left: Logo */}
        <div className="text-xl font-bold text-orange-500">Cistus</div>

        {/* Center: Placeholder */}
        <div className="flex-1"></div>

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
        {/* Hero Title Area */}
        <div className="mt-[25vh] mb-8 flex flex-col items-center px-4 transition-opacity duration-500">
          <h1
            className={`text-center text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl transition-opacity duration-300 ${
              isScrolled ? "opacity-0" : "opacity-100"
            }`}
          >
            원하는 내용을 <span className="text-orange-500">검색</span>해보세요
          </h1>
        </div>

        {/* Sticky Search Bar */}
        <div className="sticky top-3 z-50 flex w-full justify-center px-4">
          <div
            className={`relative transition-all duration-500 ease-in-out ${
              isScrolled ? "w-full max-w-md" : "w-full max-w-2xl"
            }`}
          >
            <input
              type="text"
              placeholder={
                isScrolled ? "검색어를 입력하세요" : "검색어를 입력하세요..."
              }
              className={`w-full transition-all duration-500 focus:outline-none ${
                isScrolled
                  ? "h-10 rounded-full border border-zinc-200 bg-zinc-50 px-4 text-sm shadow-sm focus:border-orange-500"
                  : "h-20 rounded-2xl border-2 border-orange-100 bg-white px-6 text-lg shadow-xl shadow-orange-500/5 focus:border-orange-500"
              }`}
            />
            {/* Search Button (Only visible in Hero mode) */}
            <button
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-orange-500 font-bold text-white transition-all duration-300 hover:bg-orange-600 ${
                isScrolled
                  ? "pointer-events-none h-8 w-8 opacity-0 px-0"
                  : "h-12 px-8 opacity-100"
              }`}
            >
              {isScrolled ? "" : "검색"}
            </button>
          </div>
        </div>

        {/* Spacer to separate posts from the hero area visually */}
        <div className="h-24"></div>

        {/* Posts Section */}
        <section className="w-full max-w-6xl px-6 pb-20">
          <h2 className="mb-8 text-2xl font-bold text-zinc-800">
            전체 글 보기
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Post Card Placeholders */}
            {Array.from({ length: 9 }).map((_, i) => (
              <article
                key={i}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="aspect-video w-full bg-zinc-100 transition-colors group-hover:bg-orange-50"></div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
                      Category
                    </span>
                    <span className="text-xs text-zinc-400">2025.11.22</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-zinc-900 group-hover:text-orange-500">
                    게시글 제목이 들어갑니다 {i + 1}
                  </h3>
                  <p className="line-clamp-2 text-sm text-zinc-500">
                    게시글의 내용이 들어가는 자리입니다. 내용이 길어지면
                    자동으로 말줄임표가 적용됩니다.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
