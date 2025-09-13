import React, { useState } from 'react';
import { getAIAdivce } from '../services/geminiService';
import { FocusLog } from '../types';
import { Card } from './ui/Card';
import { ICONS } from '../constants';

interface AiAdvisorProps {
  logs: FocusLog[];
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ logs }) => {
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdvice = async () => {
    setIsLoading(true);
    const result = await getAIAdivce(logs);
    setAdvice(result);
    setIsLoading(false);
  };

  const formatAdvice = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>')
      .replace(/\* (.*?)(?=\n\*|\n\n|$)/g, '<li class="ml-5 list-disc">$1</li>');
  };
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-300">AI 어드바이저</h3>
        <button
          onClick={fetchAdvice}
          disabled={isLoading || logs.length === 0}
          className="flex items-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200"
        >
          <span className="mr-2">{ICONS.BRAIN}</span>
          {isLoading ? '생각 중...' : '조언 받기'}
        </button>
      </div>
      {advice ? (
        <div className="prose prose-invert prose-p:text-slate-300 prose-li:text-slate-300 mt-4 space-y-2" dangerouslySetInnerHTML={{ __html: formatAdvice(advice) }}></div>
      ) : (
        <p className="text-slate-400">
          {logs.length === 0 ? "맞춤형 조언을 얻으려면 세션을 완료하세요." : "성과에 기반한 팁을 보려면 '조언 받기'를 클릭하세요."}
        </p>
      )}
    </Card>
  );
};

export default AiAdvisor;