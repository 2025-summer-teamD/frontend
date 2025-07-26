// Level/Exp 관련 유틸리티 함수들
export function getLevel(exp) {
  if (exp >= 7) return 5;
  if (exp >= 4) return 4;
  if (exp >= 2) return 3;
  if (exp >= 1) return 2;
  return 1;
}

export function getExpForNextLevel(level) {
  return [0, 1, 2, 3, 4][level] || 0;
}

export function getExpBase(level) {
  return [0, 0, 1, 2, 4][level] || 0;
} 