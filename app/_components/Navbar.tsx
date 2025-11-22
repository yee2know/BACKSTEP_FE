"use client";

import { usePathname } from "next/navigation";

type NavbarProps = {
  isScrolled?: boolean;
  searchType?: "post" | "profile";
  setSearchType?: (type: "post" | "profile") => void;
};

export function Navbar({
  isScrolled = false,
  searchType = "post",
  setSearchType = () => {},
}: NavbarProps) {
  const pathname = usePathname();
  const isMain = pathname === "/";
  const showSearch = isMain ? isScrolled : true;

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-100 bg-white/80 px-6 backdrop-blur-md transition-all">
      {/* Left: Logo */}
      <div className="text-xl font-bold text-orange-500">Cistus</div>

      {/* Center: Nav Search Bar (Visible only when scrolled) */}
      <div
        className={`flex flex-1 items-center justify-center gap-4 transition-all duration-500 ${
          showSearch
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder={searchType === "post" ? "글 검색" : "프로필 검색"}
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

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
  );
}
