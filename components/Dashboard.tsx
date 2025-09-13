import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FocusLog, ActivityType, DistractionFactor } from '../types';
import { Card } from './ui/Card';
import AiAdvisor from './AiAdvisor';

interface DashboardProps {
  logs: FocusLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  const todayLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs.filter(log => new Date(log.timestamp) >= today);
  }, [logs]);

  const totalFocusIntervals = useMemo(() => {
    return todayLogs.length;
  }, [todayLogs]);

  const distractionsByActivity = useMemo(() => {
    const data = todayLogs.reduce((acc, log) => {
      const activity = log.activity;
      if (!acc[activity]) {
        acc[activity] = { name: activity, distractions: 0 };
      }
      acc[activity].distractions += log.distractionCount;
      return acc;
    }, {} as Record<string, { name: ActivityType, distractions: number }>);
    return Object.values(data).sort((a, b) => b.distractions - a.distractions);
  }, [todayLogs]);

  const distractionsByType = useMemo(() => {
    const data = todayLogs.reduce((acc, log) => {
      const factor = log.distractionFactor;
      if (!acc[factor]) {
        acc[factor] = { name: factor, value: 0 };
      }
      acc[factor].value++;
      return acc;
    }, {} as Record<string, { name: DistractionFactor, value: number }>);
    return Object.values(data).sort((a, b) => b.value - a.value);
  }, [todayLogs]);

  if (logs.length === 0) {
    return <Card className="text-center"><p className="text-slate-400">아직 기록된 집중 데이터가 없습니다. 세션을 시작하여 통계를 확인하세요!</p></Card>;
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-cyan-400">오늘의 집중 요약</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <h3 className="font-bold text-lg text-slate-300 mb-2">집중 구간</h3>
            <p className="text-4xl font-bold text-cyan-500">{totalFocusIntervals}</p>
            <p className="text-slate-400">오늘 완료</p>
        </Card>
        <Card>
            <h3 className="font-bold text-lg text-slate-300 mb-2">활동별 집중 못한 총 횟수</h3>
            <div className="space-y-2 h-[88px] overflow-y-auto pr-2">
              {distractionsByActivity.filter(d => d.distractions > 0).length > 0 ? (
                  distractionsByActivity.filter(d => d.distractions > 0).map((activityData) => (
                      <div key={activityData.name} className="flex justify-between items-center text-slate-300 bg-slate-800/50 p-2 rounded">
                          <span>{activityData.name}</span>
                          <span className="font-bold text-cyan-400">{activityData.distractions}회</span>
                      </div>
                  ))
              ) : (
                  <div className="flex items-center justify-center h-full">
                      <p className="text-slate-400">기록된 방해 횟수가 없습니다.</p>
                  </div>
              )}
            </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-xl font-bold mb-4 text-slate-300">활동별 방해 요소</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distractionsByActivity}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Bar dataKey="distractions" name="방해 횟수" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-xl font-bold mb-4 text-slate-300">방해 요인별 횟수</h3>
          <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
            {distractionsByType.length > 0 ? (
              distractionsByType.map((distraction) => (
                  <div key={distraction.name} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                    <span className="font-medium text-slate-300">{distraction.name}</span>
                    <span className="font-bold text-cyan-400 text-lg">{distraction.value}회</span>
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-center h-full">
                 <p className="text-slate-400">오늘 기록된 방해 요인이 없습니다.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <AiAdvisor logs={todayLogs} />
    </div>
  );
};

export default Dashboard;