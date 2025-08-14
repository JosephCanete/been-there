import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RequestBody = {
  username?: string;
  // Stats are optional; when provided we will celebrate progress using them
  stats?: {
    total: number;
    beenThere: number;
    stayedThere: number;
    passedBy: number;
    notVisited: number;
  };
  model?: string;
};

export async function POST(req: Request) {
  try {
    const envKey = process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY;
    if (!envKey) {
      return NextResponse.json(
        {
          error:
            "HF_TOKEN or HUGGING_FACE_API_KEY is not configured on the server",
        },
        { status: 500 }
      );
    }

    const { username = "", stats, model } = (await req.json()) as RequestBody;

    const safeName = (username || "this traveler").toString();

    // Derive progress out of 80 provinces (or provided total)
    const TOTAL_PROVINCES = 80;
    const total = Number(stats?.total) || TOTAL_PROVINCES;
    const visited = Math.max(
      0,
      Math.min(
        total,
        (Number(stats?.beenThere) || 0) +
          (Number(stats?.stayedThere) || 0) +
          (Number(stats?.passedBy) || 0)
      )
    );
    const progressText =
      visited > 0
        ? `${visited} of ${total} provinces explored`
        : `making progress across all ${total} provinces`;

    const prompt = `Write a funny, uplifting social caption (max 300 chars) for a Philippines travel map for ${safeName}. Celebrate their progress: ${progressText}. Keep it casual, playful, and inspiring. Include 2-4 fun travel hashtags and 1-2 travel emojis. No quotes or markdown.`;

    // Use the Hugging Face Router (OpenAI-compatible) with router-supported models
    const modelChain: string[] = [];
    if (typeof model === "string" && model.trim())
      modelChain.push(model.trim());
    modelChain.push(
      "meta-llama/Meta-Llama-3.1-8B-Instruct",
      "Qwen/Qwen2.5-7B-Instruct",
      "google/gemma-2-2b-it",
      "mistralai/Mistral-7B-Instruct-v0.2"
    );

    async function callRouter(selectedModel: string): Promise<string> {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 25000);
      try {
        const res = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${envKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                {
                  role: "system",
                  content:
                    "You generate concise social captions. Max 300 characters. Include 2-4 relevant hashtags and 1-2 travel emojis. Be uplifting, funny, and engaging. If progress numbers are provided (e.g., 12 of 80 provinces), celebrate them clearly without sounding technical.",
                },
                { role: "user", content: prompt },
              ],
              max_tokens: 150,
              temperature: 0.7,
              top_p: 0.95,
            }),
            signal: controller.signal,
          }
        );
        const text = await res.text();
        if (!res.ok) throw new Error(`HF Router ${res.status}: ${text}`);
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Unexpected Router response format");
        }
        const content: string | undefined =
          data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new Error("No content in chat completion response");
        }
        return content.trim();
      } finally {
        clearTimeout(id);
      }
    }

    let generated: string | null = null;
    let usedModel: string | undefined;
    const errors: string[] = [];
    for (const m of modelChain) {
      try {
        const out = await callRouter(m);
        if (out) {
          generated = out;
          usedModel = m;
          break;
        }
      } catch (err: any) {
        errors.push(`${m}: ${err?.message || String(err)}`);
      }
    }

    let caption =
      (generated && generated.trim()) ||
      `${safeName} is ${progressText} — check it out! 🇵🇭 #TravelPH #Philippines #Wanderlust`;

    // Light post-processing: clean quotes and keep within length, but preserve numbers
    caption = caption.replace(/^\s*["'`]{1,3}|["'`]{1,3}\s*$/g, "").trim();
    if (caption.length > 300) caption = caption.slice(0, 297).trimEnd() + "...";

    const meta = usedModel
      ? { model: usedModel }
      : { fallback: true, tried: modelChain, errors };

    return NextResponse.json({ caption, meta });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to generate caption" },
      { status: 500 }
    );
  }
}
