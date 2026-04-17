/**
 * TIVO — Qwen AI Client
 *
 * Usa la API de DashScope en modo compatible con OpenAI.
 * Modelo: qwen-plus (alias de Qwen3 en DashScope)
 *
 * Docs: https://www.alibabacloud.com/help/en/dashscope/latest/compatibility-of-openai-with-dashscope
 */

import OpenAI from 'openai';
import 'dotenv/config';

// ─── Cliente DashScope (OpenAI-compatible) ────────────────────────────────────

export const qwenClient = new OpenAI({
  apiKey:  process.env.DASHSCOPE_API_KEY ?? '',
  baseURL: process.env.QWEN_BASE_URL ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

export const QWEN_MODEL = process.env.QWEN_MODEL ?? 'qwen-plus';

// ─── Tipos de mensajes ────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─── Helper: llamada simple (non-streaming) ───────────────────────────────────

export async function qwenComplete(
  messages: ChatMessage[],
  options?: {
    maxTokens?: number;
    temperature?: number;
    enableThinking?: boolean;
  }
): Promise<string> {
  const { maxTokens = 1024, temperature = 0.7, enableThinking = false } = options ?? {};

  const response = await qwenClient.chat.completions.create({
    model: QWEN_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
    // Qwen3 thinking mode (si el modelo lo soporta)
    ...(enableThinking ? { extra_body: { enable_thinking: true } } : {}),
  });

  return response.choices[0]?.message?.content ?? '';
}

// ─── Helper: llamada streaming ────────────────────────────────────────────────

export async function* qwenStream(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
) {
  const { maxTokens = 1024, temperature = 0.7 } = options ?? {};

  const stream = await qwenClient.chat.completions.create({
    model: QWEN_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) yield delta;
  }
}
