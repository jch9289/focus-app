export enum ActivityType {
  Meditation = '수행(명상)',
  Coding = '코딩',
  Studying = '공부',
  Reading = '독서',
  Working = '업무',
  Exercising = '운동',
  Other = '기타',
}

export enum DistractionFactor {
  Phone = '휴대폰',
  SocialMedia = '소셜 미디어',
  Noise = '소음',
  MindWandering = '딴생각',
  People = '사람들',
  Other = '기타',
}

export interface FocusLog {
  id: string;
  timestamp: number;
  activity: ActivityType;
  distractionCount: number; // 0-5
  distractionFactor: DistractionFactor;
}

export interface SessionConfig {
  activity: ActivityType;
  totalDurationMinutes: number;
  checkIntervalMinutes: number;
}