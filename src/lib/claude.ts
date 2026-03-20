import Anthropic from "@anthropic-ai/sdk";
import { TimedSegment, ClipSegment } from "@/types";
import { CLIP_SYSTEM_PROMPT, buildClipPrompt } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function identifyClips(segments: TimedSegment[]): Promise<ClipSegment[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: CLIP_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildClipPrompt(segments),
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  let parsed: ClipSegment[];
  try {
    parsed = JSON.parse(text) as ClipSegment[];
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]) as ClipSegment[];
    } else {
      throw new Error("Claude returned invalid JSON. Please try again.");
    }
  }

  return parsed;
}
