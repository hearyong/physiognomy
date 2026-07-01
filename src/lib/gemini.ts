import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Helper to convert base64 image data into the inlineData format Gemini expects.
 */
export function base64ToGenerativePart(base64Str: string) {
  const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) {
    // If it's a raw base64 string without data URL prefix, assume jpeg
    return {
      inlineData: {
        data: base64Str,
        mimeType: 'image/jpeg'
      }
    };
  }
  return {
    inlineData: {
      data: matches[2],
      mimeType: matches[1]
    }
  };
}

export const FACIAL_ANALYSIS_PROMPT = `
당신은 안면 생리학, 인류학, 심리학 및 의학적 관찰 지식을 융합하여 인물의 외형적 특징을 통해 내면을 분석하는 인공지능 '헤아림(HearHim) 프로토콜' 분석 장치입니다.
전통적인 미신적이고 무속적인 '관상'이라는 단어를 배제하고, 대상의 안면 특징으로부터 기질, 건강 상태, 성격 유형을 이성적이고 논리적으로 추론하여 분석합니다.

입력된 이미지(들)를 바탕으로 분석을 진행하십시오. 반드시 한국어로 답변해야 하며, 지정된 JSON 형식으로만 응답해야 합니다.

만약 이미지가 1장인 경우(단일 분석), 1인용 결과를 출력합니다.
만약 이미지가 2장이거나 2명의 분석이 요청된 경우(관계 분석), 2인의 개별 분석과 함께 두 사람의 관계 시너지를 도출합니다. 동일한 사람의 사진 2장인 경우 '자기 이해(Self-understanding)' 모드로 전환하여 분석하십시오.

출력할 JSON 구조는 반드시 다음과 같아야 합니다:
{
  "isRelationship": true, // 관계 분석/자기 이해 여부 (1개 이미지인 경우 false)
  "mode": "single" | "relationship" | "self", // 모드 구분
  "subjects": [
    {
      "id": 1,
      "mindImage": "얼굴 특징(이마, 눈매, 안색 등)을 통해 분석한 내면의 기질 및 성격 특성에 대한 종합 서술 (인체학적/심리학적 뉘앙스, 400자 이상)",
      "health": {
        "currentCondition": "피부톤, 안색, 눈동자, 안면 부기 등을 근거로 한 현재 신체/정신적 건강 및 컨디션 요약",
        "potentialRisks": ["향후 우려되는 잠재적 건강 위험 요인 1", "잠재적 건강 위험 요인 2"],
        "improvements": ["생활 습관 및 식습관 개선 제안 1", "개선 제안 2"]
      },
      "personality": {
        "mbti": "유추된 MBTI 유형 (예: INTJ)",
        "enneagram": "유추된 에니어그램 유형 (예: 5w6)",
        "rationale": "MBTI와 에니어그램을 그렇게 판정한 안면 생리학적/행동심리학적 구체적인 판단 근거 및 성격 분석 서술 (400자 이상 구체적으로)"
      }
    }
  ],
  "relationship": {
    "synergyScore": 0~100 사이의 정수 (단일 분석 모드인 경우 null),
    "compatibilityText": "두 사람이 상호작용할 때 발생하는 소통 양식, 조화로움, 시너지에 대한 서술 (단일 분석 모드이면 null, 자기 이해 모드일 경우 자신의 두 모습 간의 통합 방향성 및 자아 성찰 서술)",
    "cautions": ["갈등 예방 혹은 극복을 위한 주의사항 1", "주의사항 2"] // 단일 분석인 경우 empty array []
  }
}

불필요한 서두나 마크다운 코드 블록 문자 (\`\`\`json ...) 없이 오직 순수한 JSON 텍스트만 출력해야 합니다.
`;

export const IMMEDIATE_DOCUMENTATION_PROMPT = `
당신은 실시간 미디어 분석 장치 '헤아림(HearHim) 프로토콜'입니다.
전달된 이미지/비디오 프레임과 함께 사용자의 분석 지시(프롬프트)에 대하여 정밀하게 분석하고 요약하여 완벽한 한국어로 답변하십시오.
어떠한 가정이나 추측을 하더라도 이미지 내의 외견상의 시각적 증거에 기반하여 전문적이고 기계적이며 신뢰감 주는 분석 HUD 말투를 유지하십시오.
`;

/**
 * Utility to strip markdown code blocks from AI JSON text before parsing.
 */
function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  return text.trim();
}

export async function analyzeFacialImages(images: string[], mode: 'single' | 'relationship' | 'self') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 서버 환경 변수에 설정되어 있지 않습니다.');
  }

  // Use gemini-3.5-flash with apiVersion v1 (responseMimeType is omitted to avoid v1 schema errors)
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
  }, { apiVersion: 'v1' });

  const imageParts = images.map(img => base64ToGenerativePart(img));
  const prompt = `${FACIAL_ANALYSIS_PROMPT}\n\n[지시사항] 현재 분석 모드는 '${mode}'입니다. 이에 맞추어 subjects 배열과 relationship 오브젝트를 완벽히 채워 리턴하세요.`;
  const contents = [prompt, ...imageParts];

  const result = await model.generateContent(contents);
  const text = result.response.text();
  try {
    const cleanedText = cleanJsonText(text);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON. Raw text was:', text);
    throw new Error('AI 분석 결과를 파싱하는데 실패했습니다. 다시 시도해 주세요.');
  }
}

export async function analyzeImmediateMedia(image: string, userPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 서버 환경 변수에 설정되어 있지 않습니다.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
  }, { apiVersion: 'v1' });

  const imagePart = base64ToGenerativePart(image);
  const prompt = `${IMMEDIATE_DOCUMENTATION_PROMPT}\n\n[사용자 분석 요청]\n${userPrompt}`;
  
  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}
