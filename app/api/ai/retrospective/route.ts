import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { TAG_DATA, AVAILABLE_TAGS } from "../../../../lib/tags";

const API_KEY =
  process.env.gemini_api_key || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: Request) {
  try {
    const { userText } = await request.json();

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API Key is missing" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct the prompt
    let questionsPrompt = "";
    Object.entries(TAG_DATA).forEach(([tag, questions]) => {
      questionsPrompt += `"${tag}" 태그에 대한 질문:\n1. ${questions[0]}\n2. ${questions[1]}\n3. ${questions[2]}\n\n`;
    });

    const prompt = `
아래 긴 글을 보고 다음 태그들 중에서 태그를 5개 이하로 추천하고,
추천된 태그에 대해 미리 정의된 질문 3개에 대한 답변을 적어줘.

[가능한 태그 목록]
${JSON.stringify(AVAILABLE_TAGS)}

[태그별 질문 목록]
${questionsPrompt}

[긴 글]
${userText}

응답은 반드시 다음과 같은 JSON 형식이어야 해. 마크다운 코드 블록 없이 순수 JSON만 반환해줘.
{
    "tags" : ["추천된 태그1", "추천된 태그2", ...],
    "추천된 태그1" : {
        "질문1" : "생성된 답변1",
        "질문2" : "생성된 답변2",
        "질문3" : "생성된 답변3"
    },
    ...
}

예시는 다음과 같아.

입력 예시

아래 긴 글을 보고 {
  "available_tags": [
    "팀원 불화·의사소통 문제",
    "참여도 불균형 (버스 타기)",
    ...
  ]
} 중에서 태그를 추천하고
...

우리 팀은 4명으로 학교 동아리 홍보 웹사이트를 만들기로 했어요... (중략)

응답 예시

{
  "tags": [
    "팀원 이탈·중도 포기",
    "기술 역량 부족",
    "과도한 기능 욕심 (Scope Creep)",
    "마감 지연 (관리 미흡)",
    "팀원 불화·의사소통 문제"
  ],
  "팀원 이탈·중도 포기": {
    "팀원이 이탈하게 된 가장 큰 이유는 무엇이었나요? (개인 사정, 불화, 흥미 상실 등)": "중간고사 준비 때문인 것 같아요. 처음부터 프로젝트보다 학업을 더 우선시했던 것 같고, 우리도 그걸 배려하지 못했습니다.",
    "이탈 발생 시점은 프로젝트의 어느 단계였으며, 그 충격은 얼마나 컸나요?": "프로젝트 시작 2주차쯤이었어요. 아직 초반이라 역할 분배도 제대로 안 된 시점이어서 당황스러웠지만, 다행히 구현 단계는 아니어서 치명적이진 않았습니다.",
    "남은 팀원들은 이탈 가능성을 인지하고 있었는지, 그랬다면 빈자리를 채우기 위해 어떤 대책을 세웠는지 알려주세요.": "전혀 몰랐어요. 갑자기 연락이 안 되길래 당황했고, 특별한 대책 없이 그냥 3명이서 나눠서 했습니다."
  },
  ...
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(jsonString);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
