import React from 'react';

export default function NeonBackground() {
  return (
    <>
      <div className="neon-block size1 color1" style={{left:'3vw', top:'7vh', position:'absolute', zIndex:0}}></div>
      <div className="neon-block size2 color2" style={{right:'5vw', top:'10vh', position:'absolute', zIndex:0}}></div>
      <div className="neon-block size3 color3" style={{left:'8vw', bottom:'10vh', position:'absolute', zIndex:0}}></div>
      <div className="neon-block size4 color4" style={{right:'8vw', bottom:'12vh', position:'absolute', zIndex:0}}></div>
      <div className="neon-block size5 color5" style={{left:'50vw', top:'80vh', position:'absolute', zIndex:0}}></div>
    </>
  );
} 