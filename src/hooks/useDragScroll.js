import { useEffect, useRef } from 'react';

// 드래그 스크롤 커스텀 훅
export const useDragScroll = () => {
  const containerRef = useRef(null);
  const scrollInterval = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // 드래그 스크롤 핸들러들
    const onMouseDown = (e) => {
      isDown = true;
      container.classList.add('dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      container.classList.remove('dragging');
      clearInterval(scrollInterval.current);
    };

    const onMouseUp = () => {
      isDown = false;
      container.classList.remove('dragging');
    };

    const onMouseMove = (e) => {
      // 드래그 스크롤 처리
      if (isDown) {
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
        return;
      }

      // 자동 스크롤 처리 (드래그 중이 아닐 때만)
      const { left, right } = container.getBoundingClientRect();
      const mouseX = e.clientX;

      clearInterval(scrollInterval.current);

      if (mouseX - left < 200) {
        scrollInterval.current = setInterval(() => {
          container.scrollLeft -= 1000;
        }, 10);
      } else if (right - mouseX < 200) {
        scrollInterval.current = setInterval(() => {
          container.scrollLeft += 1000;
        }, 10);
      }
    };

    // 이벤트 리스너 등록
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
      clearInterval(scrollInterval.current);
    };
  }, []);

  return containerRef;
}; 