"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      localStorage.setItem("accessToken", token);
      router.replace("/");
    } catch (error) {
      console.error("토큰 저장 중 오류가 발생했습니다.", error);
      router.replace("/login");
    }
  }, [router, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
      <p className="text-lg font-semibold text-zinc-700">
        로그인 정보를 확인하고 있어요...
      </p>
    </div>
  );
}

