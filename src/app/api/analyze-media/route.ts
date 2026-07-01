import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: '분석할 미디어 프레임(이미지)이 존재하지 않습니다.' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'AI에게 전달할 분석 프롬프트 질문이 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 서버 환경 변수에 설정되어 있지 않습니다.' },
        { status: 500 }
      );
    }

    // Direct HTTP POST request to stable v1 Gemini API endpoint (bypassing SDK wrappers)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    // Extract base64 image chunks safely
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : image;
    const mimeType = matches ? matches[1] : 'image/jpeg';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
            ],
          },
        ],
      }),
    });

    const debugJson = await response.json();

    if (!response.ok) {
      console.error('[RAW_GEMINI_API_ERROR]', debugJson);
      // Return the raw Google API error message directly to the client UI for clear diagnosis
      const errorMessage = debugJson.error?.message || JSON.stringify(debugJson);
      return NextResponse.json(
        { error: `Google API Error: ${errorMessage}` },
        { status: response.status }
      );
    }

    const answer = debugJson.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 응답 데이터 구조가 비어 있습니다.';
    return NextResponse.json({ answer });

  } catch (error: any) {
    console.error('[API_ANALYZE_MEDIA_ERROR]', error);
    return NextResponse.json(
      { error: error?.message || '실시간 미디어 분석 도중 서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
