import { NextResponse } from "next/server";
import { analyzeTracks, type TrackInput, type AnalysisResult } from "../../../lib/analyzer";

// 可选的 AI 增强分析。
// 需要配置环境变量：
//   AI_API_KEY  - API 密钥（必填才能启用 AI）
//   AI_BASE_URL - OpenAI 兼容接口地址（默认 https://api.openai.com/v1）
//   AI_MODEL    - 模型名（默认 gpt-4o-mini，可填豆包模型如 doubao-1-5-pro-32k）
//
// 未配置 AI_API_KEY 时，使用规则引擎生成报告，功能完整可用。

async function aiEnhance(
  tracks: TrackInput[],
  base: AnalysisResult
): Promise<{ story: string; deepDive: string } | null> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  // 取前100首歌的摘要发给AI，避免token过长
  const sample = tracks.slice(0, 100).map(t => `${t.artists} - ${t.name}`).join("\n");
  const stats = [
    `音乐人格：${base.archetype}`,
    `MBTI倾向：${base.mbti.type}`,
    `大五人格：开放性${base.bigFive.openness} 尽责性${base.bigFive.conscientiousness} 外向性${base.bigFive.extraversion} 宜人性${base.bigFive.agreeableness} 神经质${base.bigFive.neuroticism}`,
    `风格分布：${Object.entries(base.genres).slice(0, 5).map(([k, v]) => `${k} ${(v / base.total * 100).toFixed(0)}%`).join(", ")}`,
    `情绪分布：${Object.entries(base.moods).slice(0, 5).map(([k, v]) => `${k} ${(v / base.total * 100).toFixed(0)}%`).join(", ")}`,
    `语言分布：${Object.entries(base.languages).map(([k, v]) => `${k} ${(v / base.total * 100).toFixed(0)}%`).join(", ")}`,
    `高频歌手：${base.topArtists.slice(0, 5).map(a => `${a.name}(${a.count})`).join(", ")}`,
  ].join("\n");

  const prompt = `你是一位音乐心理学分析师。根据以下用户的歌单数据，写两段分析：

1. "音乐故事"（150-200字，第二人称，有深度有共鸣，适合发小红书，不要用markdown）
2. "深度解读"（200-250字，分析用户的性格特点、情感模式、审美倾向，给出1-2条生活建议，第二人称，不要用markdown）

要求：
- 语言自然真诚，不要套话
- 结合具体数据，不要泛泛而谈
- 保留"娱乐与自我探索，不构成心理评估"的态度
- 不要使用emoji

歌单统计：
${stats}

歌曲样本（前100首）：
${sample}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    // 简单分割两段
    const parts = content.split(/\n\n+/).filter(Boolean);
    return {
      story: parts[0] ?? "",
      deepDive: parts[1] ?? parts[0] ?? "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: { tracks?: TrackInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误。" }, { status: 400 });
  }

  const tracks = body.tracks;
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return NextResponse.json(
      { error: "请提供至少一首歌曲。" },
      { status: 400 }
    );
  }

  // 清洗
  const clean: TrackInput[] = tracks
    .filter(t => t && typeof t.name === "string" && typeof t.artists === "string")
    .map(t => ({
      name: t.name.trim(),
      artists: t.artists.trim(),
      album: typeof t.album === "string" ? t.album.trim() : "",
      duration: typeof t.duration === "number" ? t.duration : 0,
      addedAt: typeof t.addedAt === "number" ? t.addedAt : undefined,
    }))
    .filter(t => t.name && t.artists);

  if (clean.length === 0) {
    return NextResponse.json(
      { error: "没有有效的歌曲数据。" },
      { status: 400 }
    );
  }

  // 规则引擎分析
  const result = analyzeTracks(clean);

  // 可选 AI 增强
  const ai = await aiEnhance(clean, result);
  if (ai) {
    result.aiStory = ai.story;
    result.aiDeepDive = ai.deepDive;
    result.aiEnabled = true;
  } else {
    result.aiEnabled = false;
  }

  return NextResponse.json(result);
}
