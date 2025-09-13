import { GoogleGenAI } from "@google/genai";
import { FocusLog } from '../types';

export async function getAIAdivce(logs: FocusLog[]): Promise<string> {
  // FIX: Removed explicit check for API_KEY. As per guidelines, the key is assumed to be configured.
  // Errors from a missing key will be handled by the try/catch block.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const summary = logs.reduce((acc, log) => {
    const activity = log.activity;
    if (!acc[activity]) {
      acc[activity] = { distractions: {}, count: 0 };
    }
    acc[activity].count++;
    const distraction = log.distractionFactor;
    acc[activity].distractions[distraction] = (acc[activity].distractions[distraction] || 0) + 1;
    return acc;
  }, {} as Record<string, { distractions: Record<string, number>, count: number }>);

  const promptData = Object.entries(summary).map(([activity, data]) => {
    const distractions = Object.entries(data.distractions)
      .sort(([, a], [, b]) => b - a)
      .map(([dist, count]) => `${dist} (${count}번)`)
      .join(', ');
    return `${activity} 활동 중, 다음 요소들 때문에 집중이 흐트러졌습니다: ${distractions}.`;
  }).join('\n');

  if (!promptData) {
    return "조언을 제공하기에 데이터가 충분하지 않습니다. 먼저 집중 세션을 완료하세요.";
  }

  const prompt = `
    다음 집중 세션 데이터를 바탕으로, 저의 집중력 향상에 도움이 될 간결하고 실행 가능한 조언을 제공해 주세요. 
    조언은 격려하는 내용의 메인 헤드라인과 3-4개의 글머리 기호로 구성해 주세요. 마크다운을 사용하여 서식을 지정해 주세요.

    나의 데이터:
    ${promptData}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    return "죄송합니다, 지금은 조언을 가져올 수 없습니다. 연결 상태나 API 키를 확인하고 다시 시도해 주세요.";
  }
}