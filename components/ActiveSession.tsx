import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { SessionConfig, FocusLog, DistractionFactor } from '../types';
import CheckinModal from './CheckinModal';
import { Card } from './ui/Card';

interface ActiveSessionProps {
  config: SessionConfig;
  onSessionEnd: (logs: FocusLog[]) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const ActiveSession: React.FC<ActiveSessionProps> = ({ config, onSessionEnd }) => {
  const [totalTimeLeft, setTotalTimeLeft] = useState(config.totalDurationMinutes * 60);
  const [intervalTimeLeft, setIntervalTimeLeft] = useState(config.checkIntervalMinutes * 60);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<FocusLog[]>([]);

  const alarmSound = useMemo(() => {
    // FIX: The previous audio source was unreliable. Replaced with a standard, universally
    // compatible MP3 to ensure sound plays correctly across all browsers.
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3');
    audio.volume = 0.5;
    return audio;
  }, []);

  useEffect(() => {
    if (isCheckingIn) return;

    if (totalTimeLeft <= 0) {
      onSessionEnd(sessionLogs);
      return;
    }

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => prev - 1);
      setIntervalTimeLeft((prev) => {
        if (prev - 1 <= 0) {
          setIsCheckingIn(true);
          return config.checkIntervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [totalTimeLeft, config, onSessionEnd, sessionLogs, isCheckingIn]);

  useEffect(() => {
    if (isCheckingIn) {
      let playCount = 0;
      const playInterval = setInterval(() => {
        if (playCount < 3) {
          alarmSound.currentTime = 0; // Rewind to start for subsequent plays
          alarmSound.play().catch(error => {
            console.error("Error playing alarm sound. This may be due to browser autoplay restrictions.", error);
            clearInterval(playInterval); // Stop trying if it fails
          });
          playCount++;
        } else {
          clearInterval(playInterval);
        }
      }, 700); // Play sound every 700ms, 3 times.

      return () => {
        clearInterval(playInterval);
        if (!alarmSound.paused) {
          alarmSound.pause();
          alarmSound.currentTime = 0;
        }
      };
    }
  }, [isCheckingIn, alarmSound]);
  
  const handleCheckinSubmit = (distractionCount: number, distractionFactor: any) => {
    const newLog: FocusLog = {
      id: new Date().toISOString(),
      timestamp: Date.now(),
      activity: config.activity,
      distractionCount,
      distractionFactor,
    };
    setSessionLogs(prev => [...prev, newLog]);
    setIsCheckingIn(false);
  };

  const totalDurationSeconds = config.totalDurationMinutes * 60;
  const intervalDurationSeconds = config.checkIntervalMinutes * 60;
  const totalProgress = ((totalDurationSeconds - totalTimeLeft) / totalDurationSeconds) * 100;
  const intervalProgress = ((intervalDurationSeconds - intervalTimeLeft) / intervalDurationSeconds) * 100;

  const chartData = sessionLogs.map((log, index) => ({
      name: `확인 ${index + 1}`,
      '집중 방해 횟수': log.distractionCount,
  }));

  const distractionsByType = useMemo(() => {
    const data = sessionLogs.reduce((acc, log) => {
      const factor = log.distractionFactor;
      if (!acc[factor]) {
        acc[factor] = { name: factor, value: 0 };
      }
      acc[factor].value++;
      return acc;
    }, {} as Record<string, { name: DistractionFactor, value: number }>);
    return Object.values(data).sort((a, b) => b.value - a.value);
  }, [sessionLogs]);


  return (
    <div className="flex flex-col items-center justify-center p-4">
      {isCheckingIn && <CheckinModal onSubmit={handleCheckinSubmit} activity={config.activity} />}
      <div className="w-full max-w-2xl text-center">
        <p className="text-xl text-slate-400 mb-2">집중 중인 활동:</p>
        <h1 className="text-4xl font-bold text-cyan-400 mb-8">{config.activity}</h1>
        
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto mb-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle className="text-slate-700" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent"></circle>
                {/* Progress circle */}
                <circle
                    className="text-cyan-500"
                    strokeWidth="7"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (totalProgress / 100) * 283}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-bold tracking-tighter">{formatTime(totalTimeLeft)}</span>
                <span className="text-slate-400 text-base sm:text-lg">남은 시간</span>
            </div>
        </div>

        <div className="w-full">
            <p className="text-slate-300 mb-2">다음 확인까지: {formatTime(intervalTimeLeft)}</p>
            <div className="w-full bg-slate-700 rounded-full h-4">
                <div 
                    className="bg-cyan-600 h-4 rounded-full" 
                    style={{ width: `${intervalProgress}%`, transition: 'width 1s linear' }}
                ></div>
            </div>
        </div>
      </div>

      {sessionLogs.length > 0 && (
          <div className="w-full max-w-4xl mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">실시간 집중 추이</h2>
                    <Card>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis domain={[0, 5]} allowDecimals={false} stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                                    labelStyle={{ color: '#cbd5e1' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="집중 방해 횟수"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">실시간 방해 요인</h2>
                    <Card className="h-[358px]">
                        <div className="space-y-3 h-full overflow-y-auto pr-2">
                        {distractionsByType.length > 0 ? (
                            distractionsByType.map((distraction) => (
                                <div key={distraction.name} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                                <span className="font-medium text-slate-300">{distraction.name}</span>
                                <span className="font-bold text-cyan-400 text-lg">{distraction.value}회</span>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full">
                               <p className="text-slate-400">기록된 방해 요인이 없습니다.</p>
                            </div>
                        )}
                        </div>
                    </Card>
                  </div>
              </div>
          </div>
      )}

      <button 
          onClick={() => onSessionEnd(sessionLogs)}
          className="mt-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
      >
          세션 조기 종료
      </button>
    </div>
  );
};

export default ActiveSession;