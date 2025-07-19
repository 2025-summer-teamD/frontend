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

/**
 * 안전한 이미지 URL을 반환하는 함수
 */
export const getSafeImageUrl = (url) => {
  return isValidImageUrl(url) ? url : '/api/uploads/default-character.svg';
}; 