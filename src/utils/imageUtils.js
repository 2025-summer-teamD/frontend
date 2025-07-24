/**
 * 이미지 로딩 실패 시 기본 이미지로 대체하는 함수
 */
export const handleImageError = (event) => {
  // placeholder 이미지나 로딩 실패 시 기본 이미지로 대체
  if (event.target.src.includes('placeholder.com') || event.target.src.includes('via.placeholder.com')) {
    event.target.src = '/api/uploads/default-character.svg';
  } else {
    // 기타 이미지 로딩 실패 시
    event.target.src = '/assets/andrew.png';
  }
};

/**
 * 이미지 URL이 유효한지 확인하는 함수
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;

  // placeholder 이미지 URL인지 확인
  if (url.includes('placeholder.com') || url.includes('via.placeholder.com')) {
    return false;
  }

  return true;
};

export const getSafeImageUrl = (url) => {
  if (!url) return '/api/image/default-character.svg';
  if (url.startsWith('blob:')) return url; // blob URL은 그대로 반환
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/uploads/')) return url;
  // 파일명만 저장된 경우
  if (!url.startsWith('/')) return `/api/uploads/${url}`;
  // 기타 케이스(상대경로 등)
  return url;
};
