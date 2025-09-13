import React, { useState } from 'react';
import { DistractionFactor } from '../types';
import { DISTRACTION_OPTIONS } from '../constants';

interface CheckinModalProps {
  onSubmit: (distractionCount: number, distractionFactor: DistractionFactor) => void;
  activity: string;
}

const CheckinModal: React.FC<CheckinModalProps> = ({ onSubmit, activity }) => {
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [distractionFactor, setDistractionFactor] = useState<DistractionFactor>(DistractionFactor.MindWandering);

  const handleSubmit = () => {
    onSubmit(distractionCount, distractionFactor);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl w-full max-w-lg border border-slate-700 animate-fade-in">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">집중 확인</h2>
        <p className="text-slate-400 mb-6">마지막 {activity} 시간 동안 집중은 어떠셨나요?</p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">몇 번이나 집중력을 잃으셨나요?</label>
          <div className="flex justify-between space-x-2">
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setDistractionCount(num)}
                className={`w-12 h-12 rounded-full text-lg font-bold transition-all duration-200 ${
                  distractionCount === num
                    ? 'bg-cyan-600 text-white scale-110'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3">주요 방해 요인은 무엇이었나요?</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DISTRACTION_OPTIONS.map((factor) => (
              <button
                key={factor}
                onClick={() => setDistractionFactor(factor)}
                className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                  distractionFactor === factor
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {factor}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-all"
        >
          기록하고 계속하기
        </button>
      </div>
    </div>
  );
};

export default CheckinModal;