/**
 * services/aiProviders/openaiProvider.js
 * ---------------------------------------------------------------------------
 * Implementação do provedor OpenAI. A chave é lida exclusivamente de
 * process.env (via config/env.js) — nunca hardcoded neste arquivo.
 * ---------------------------------------------------------------------------
 */

const fetch = require('node-fetch');
const { env } = require('../../config/env');
const { SYSTEM_PROMPT, buildUserPrompt } = require('./prompt');

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Envia o conteúdo bruto para a OpenAI e retorna a notícia estruturada.
 * @param {string} rawContent Texto extraído do post do Telegram.
 * @returns {Promise<object>} Objeto com title, subtitle, summary, content, category, tags, slugBase.
 */
async function generateNews(rawContent) {
  const { apiKey, model } = env.ai.openai;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada no .env.');
  }

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(rawContent) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na API da OpenAI (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawJson = data.choices?.[0]?.message?.content;

  if (!rawJson) {
    throw new Error('Resposta da OpenAI veio vazia ou em formato inesperado.');
  }

  return JSON.parse(rawJson);
}

module.exports = { generateNews };
