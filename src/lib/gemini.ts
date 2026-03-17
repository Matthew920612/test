import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API client. In a real production app, this should be done on a secure backend!
export const ai = new GoogleGenAI({ 
  apiKey: apiKey || 'missing_api_key'
});

export const model = 'gemini-2.5-flash';

/**
 * Streams a drafted document using Markdown formatting.
 */
export async function* generateDraftStream(prompt: string) {
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Please set VITE_GEMINI_API_KEY in .env.local');
  }

  const responseStream = await ai.models.generateContentStream({
    model,
    contents: prompt,
    config: {
      systemInstruction: 'You are an expert document drafter. Write a highly professional, well-structured document based on the user request. Use markdown for styling (H1, H2, bullet points). Do not output any conversational filler.',
    }
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

/**
 * Returns a structured JSON representation of a slide deck.
 */
export async function generateSlideDraft(prompt: string) {
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Please set VITE_GEMINI_API_KEY in .env.local');
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: 'You are an expert presentation designer. Create a slide presentation. Return a JSON object with a "title" string and a "slides" array. Each slide in the array should have a "title" string and "bulletPoints" which is an array of strings.',
      responseMimeType: 'application/json',
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse slide JSON", e);
    return { title: 'Error', slides: [] };
  }
}

/**
 * Streams a conversational response from the Brain agent.
 */
export async function* generateChatResponseStream(messages: {role: string, content: string}[]) {
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Please set VITE_GEMINI_API_KEY in .env.local');
  }

  // Convert application message format to Gemini SDK format
  const formattedContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const responseStream = await ai.models.generateContentStream({
    model,
    contents: formattedContents,
    config: {
      systemInstruction: 'You are a helpful AI assistant called Brain. You exist inside a workspace GUI tool. Keep your responses concise, helpful, and friendly. Do not use markdown unless necessary for code or bullet points.',
    }
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
