import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { text, apiKey } = await req.json()

    if (!text || !text.trim()) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    if (!apiKey && !process.env.GEMINI_API_KEY) {
      return Response.json(
        {
          error: "Gemini APIキーが設定されていません。設定パネルでAPIキーを入力してください。",
        },
        { status: 401 },
      )
    }

    const prompt = `以下のマインドマップのテキストに基づいて、関連する学術的な参考文献を5-10個提案してください。
各参考文献はAPA 7th edition形式で記載してください。

マインドマップの内容:
${text}

指示:
1. 提案する参考文献は実在する可能性のある学術論文、書籍、信頼できるウェブサイトなどにしてください
2. 各文献はAPA 7th edition形式で正確にフォーマットしてください
3. マインドマップのトピックに最も関連性の高いものを選んでください
4. 各文献は1行ずつ、番号なしで出力してください

参考文献リスト:`

    const headers: Record<string, string> = {}
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`
    }

    const { text: generatedText } = await generateText({
      model: "google/gemini-2.5-flash-image",
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Split by newlines and filter empty lines
    const references = generatedText
      .split("\n")
      .map((ref) => ref.trim())
      .filter((ref) => ref.length > 0)

    return Response.json({ references })
  } catch (error) {
    console.error("Error generating references:", error)
    return Response.json(
      {
        error: `参考文献の生成に失敗しました: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
