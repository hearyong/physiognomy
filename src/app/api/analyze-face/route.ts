import { NextRequest, NextResponse } from 'next/server';
import { FACIAL_ANALYSIS_PROMPT } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { images, mode } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: '분석할 이미지 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!mode || !['single', 'relationship', 'self'].includes(mode)) {
      return NextResponse.json(
        { error: '올바른 분석 모드(single, relationship, self)를 제공해야 합니다.' },
        { status: 400 }
      );
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 서버 환경 변수에 설정되어 있지 않습니다.' },
        { status: 500 }
      );
    }

    // Direct HTTP POST to stable v1 Gemini API endpoint (bypassing SDK wrappers)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Map base64 images into the exact inlineData format Gemini expect
    const imageParts = images.map(img => {
      const matches = img.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      return {
        inlineData: {
          data: matches ? matches[2] : img,
          mimeType: matches ? matches[1] : 'image/jpeg'
        }
      };
    });

    const promptText = `${FACIAL_ANALYSIS_PROMPT}\n\n[지시사항] 현재 분석 모드는 '${mode}'입니다. 이에 맞추어 subjects 배열과 relationship 오브젝트를 완벽히 채워 리턴하세요.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              ...imageParts
            ]
          }
        ]
      })
    });

    const debugJson = await response.json();

    if (!response.ok) {
      console.error('[RAW_GEMINI_FACE_API_ERROR]', debugJson);
      const errorMessage = debugJson.error?.message || JSON.stringify(debugJson);
      return NextResponse.json(
        { error: `Google API Error: ${errorMessage}` },
        { status: response.status }
      );
    }

    const rawText = debugJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Safe JSON parser to strip markdown wrappers
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    try {
      const parsedJson = JSON.parse(cleanText);
      return NextResponse.json(parsedJson);
    } catch (parseError) {
      console.error('Failed to parse raw text response as JSON:', rawText);
      return NextResponse.json(
        { error: 'AI가 반환한 응답 구조가 올바른 JSON 포맷이 아닙니다.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[API_ANALYZE_FACE_ERROR]', error);
    return NextResponse.json(
      { error: error?.message || '얼굴 심상 분석 도중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
