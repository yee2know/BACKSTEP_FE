"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const GOOGLE_LOGIN_URL = "https://ccscaps.com/api/auth/google?state=local";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentUrl = new URL(window.location.href);
    const token = currentUrl.searchParams.get("token");

    if (!token) return;

    try {
      localStorage.setItem("accessToken", token);

      currentUrl.searchParams.delete("token");
      const cleanedSearch = currentUrl.searchParams.toString();
      const cleanedUrl = `${currentUrl.origin}${currentUrl.pathname}${
        cleanedSearch ? `?${cleanedSearch}` : ""
      }${currentUrl.hash}`;

      window.history.replaceState({}, "", cleanedUrl);
      router.replace("/");
    } catch (error) {
      console.error("토큰 저장 중 오류가 발생했습니다.", error);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-orange-500 sm:text-6xl">
            CISTUS
          </h1>
        </div>

        {/* Login Button */}
        <div className="flex flex-col items-center gap-4">
          <a
            href={GOOGLE_LOGIN_URL}
            className="flex items-center justify-center gap-3 w-60 h-12 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium text-gray-700">Sign in with Google</span>
          </a>
        </div>
      </main>
    </div>
  );
}
