/**
 * services/aiProviders/geminiProvider.js
 * ---------------------------------------------------------------------------
 * Implementação do provedor Google Gemini. A chave é lida exclusivamente de
 * process.env (via config/env.js) — nunca hardcoded neste arquivo.
 * ---------------------------------------------------------------------------
 */

const fetch = require('node-fetch');
const { env } = require('../../config/env');
const { SYSTEM_PROMPT, buildUserPrompt } = require('./prompt');

function buildEndpoint(model, apiKey) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

/**
 * Envia o conteúdo bruto para o Gemini e retorna a notícia estruturada.
 * @param {string} rawContent Texto extraído do post do Telegram.
 * @returns {Promise<object>} Objeto com title, subtitle, summary, content, category, tags, slugBase.
 */
async function generateNews(rawContent) {
  const { apiKey, model } = env.ai.gemini;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no .env.');
  }

  const response = await fetch(buildEndpoint(model, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(rawContent)}` }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na API do Gemini (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawJson) {
    throw new Error('Resposta do Gemini veio vazia ou em formato inesperado.');
  }

  return JSON.parse(rawJson);
}

module.exports = { generateNews };
