export async function generateRetrospective(userText: string) {
  try {
    const response = await fetch("/api/ai/retrospective", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate retrospective");
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
