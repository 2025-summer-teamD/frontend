// Toggle.jsx (새 파일 생성)
import React from 'react';
import './Toggle.css'; // 여기에 CSS 파일을 import 합니다.

const Toggle = ({ label, checked, onChange, className }) => {
  return (
    <label className={`toggle-switch-container ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="toggle-switch-input"
      />
      <span className="toggle-switch-slider"></span>
      <span className="toggle-switch-label">{label}</span>
    </label>
  );
};

export default Toggle;
