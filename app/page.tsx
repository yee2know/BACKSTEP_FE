"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./_components/Navbar";

export default function MainPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchType, setSearchType] = useState<"post" | "profile">("post");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      <Navbar
        isScrolled={isScrolled}
        searchType={searchType}
        setSearchType={setSearchType}
      />

      {/* Main Content Flow */}
      <main className="flex flex-col items-center">
        {/* Hero Section (Scrolls naturally) */}
        <div className="mt-[20vh] mb-8 flex flex-col items-center px-4">
          <h1
            className={`text-center text-5xl font-extrabold tracking-tight text-orange-500 sm:text-6xl transition-opacity duration-300 ${isScrolled ? "opacity-0" : "opacity-100"
              }`}
          >
            Cistus
          </h1>
        </div>

        {/* Hero Search Container */}
        <div
          className={`flex w-full flex-col items-center px-4 transition-opacity duration-300 ${isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
          <div className="relative w-full max-w-3xl">
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-base font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <span>{searchType === "post" ? "글" : "프로필"}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-32 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-lg ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("post");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-2.5 text-left text-base font-medium transition-colors ${searchType === "post"
                        ? "bg-orange-50 text-orange-600"
                        : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                  >
                    글
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("profile");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-2.5 text-left text-base font-medium transition-colors ${searchType === "profile"
                        ? "bg-orange-50 text-orange-600"
                        : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                  >
                    프로필
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder={
                searchType === "post"
                  ? "찾고 싶은 글 내용을 검색해보세요"
                  : "찾고 싶은 프로필을 검색해보세요"
              }
              className="h-16 w-full rounded-2xl border-2 border-orange-100 bg-white pl-32 pr-32 text-lg shadow-xl shadow-orange-500/5 focus:border-orange-500 focus:outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <SearchIcon className="h-6 w-6 text-zinc-400" />
              <button className="h-10 rounded-xl bg-orange-500 px-6 font-bold text-white transition-all duration-300 hover:bg-orange-600">
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
            <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
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
            <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
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

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
