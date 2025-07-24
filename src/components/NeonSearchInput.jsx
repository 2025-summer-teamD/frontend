import React from 'react';

export default function NeonSearchInput({ value, onChange, placeholder }) {
  return (
    <div className="flex justify-center mb-12">
      <input
        type="text"
        placeholder={placeholder || ">> SEARCH TARGET [CHARACTER_NAME] OR [DESCRIPTION] <<"}
        className="neon-input w-96"
        value={value}
        onChange={onChange}
      />
    </div>
  );
} 