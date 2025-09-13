import React, { useState } from 'react';
import { SessionConfig, ActivityType } from '../types';
import { ACTIVITY_OPTIONS, ICONS } from '../constants';
import { Card } from './ui/Card';

interface SessionSetupProps {
  onStartSession: (config: SessionConfig) => void;
}

const SessionSetup: React.FC<SessionSetupProps> = ({ onStartSession }) => {
  const [activity, setActivity] = useState<ActivityType>(ActivityType.Meditation);
  const [totalDuration, setTotalDuration] = useState(25);
  const [checkInterval, setCheckInterval] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDuration > 0 && checkInterval > 0 && checkInterval <= totalDuration) {
      onStartSession({
        activity: activity,
        totalDurationMinutes: totalDuration,
        checkIntervalMinutes: checkInterval,
      });
    } else {
      alert("시간과 간격이 유효한지 확인해주세요. 간격은 총 시간보다 길 수 없습니다.");
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">새로운 집중 세션 시작</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="activity" className="block text-sm font-medium text-slate-300 mb-2">
            활동
          </label>
          <select
            id="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityType)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="total-duration" className="block text-sm font-medium text-slate-300 mb-2">
            총 세션 시간 (분)
          </label>
          <input
            type="number"
            id="total-duration"
            min="5"
            max="240"
            value={totalDuration}
            onChange={(e) => setTotalDuration(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="check-interval" className="block text-sm font-medium text-slate-300 mb-2">
            집중 확인 간격 (분)
          </label>
          <input
            type="number"
            id="check-interval"
            min="1"
            max="15"
            value={checkInterval}
            onChange={(e) => setCheckInterval(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105"
        >
          <span className="mr-2">{ICONS.TIMER}</span>
          집중 시작
        </button>
      </form>
    </Card>
  );
};

export default SessionSetup;