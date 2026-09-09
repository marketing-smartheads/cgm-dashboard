// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithRetry(params: any, retries = 3, delay = 1000): Promise<any> {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    // Als het een 503 (Unavailable) of 429 (Rate limit) fout is en we hebben nog retries over
    if (retries > 0 && (error.status === 503 || error.status === 429 || error.message?.includes('503') || error.message?.includes('high demand'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateWithRetry(params, retries - 1, delay * 2); // Verdubbel de wachttijd (exponential backoff)
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }

    const { messages, agentRole, agentContext } = await request.json();

    const systemInstruction = `Je bent een gespecialiseerde AI Marketing Agent in het Dentadmin Performance Platform.
Rol: ${agentRole}
Context & Doel: ${agentContext}
Geef altijd professionele, strategische en direct bruikbare antwoorden in het Nederlands.`;

    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await generateWithRetry({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'Geen antwoord ontvangen.';

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('Gemini API fout:', error);
    return NextResponse.json({ error: error.message || 'Interne serverfout' }, { status: 500 });
  }
}