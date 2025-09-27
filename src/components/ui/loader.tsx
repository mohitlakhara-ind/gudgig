
import React from 'react';

const Loader = ({ size = 65, color = '#ffffff', className = '' }) => {
  const loaderStyles = {
    '--loader-size': `${size}px`,
    '--loader-color': color,
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: `${size}px`,
        aspectRatio: '1',
        ...loaderStyles
      }}
    >
      <style jsx>{`
        @keyframes loaderAnimation {
          0% {
            inset: 0 ${size * 0.538}px ${size * 0.538}px 0;
          }
          12.5% {
            inset: 0 ${size * 0.538}px 0 0;
          }
          25% {
            inset: ${size * 0.538}px ${size * 0.538}px 0 0;
          }
          37.5% {
            inset: ${size * 0.538}px 0 0 0;
          }
          50% {
            inset: ${size * 0.538}px 0 0 ${size * 0.538}px;
          }
          62.5% {
            inset: 0 0 0 ${size * 0.538}px;
          }
          75% {
            inset: 0 0 ${size * 0.538}px ${size * 0.538}px;
          }
          87.5% {
            inset: 0 0 ${size * 0.538}px 0;
          }
          100% {
            inset: 0 ${size * 0.538}px ${size * 0.538}px 0;
          }
        }
      `}</style>
      
      {/* First circle */}
      <div 
        className="absolute rounded-full"
        style={{
          boxShadow: `0 0 0 3px inset ${color}`,
          animation: 'loaderAnimation 2.5s infinite',
          inset: `0 ${size * 0.538}px ${size * 0.538}px 0`,
        }}
      />
      
      {/* Second circle with delay */}
      <div 
        className="absolute rounded-full"
        style={{
          boxShadow: `0 0 0 3px inset ${color}`,
          animation: 'loaderAnimation 2.5s infinite',
          animationDelay: '-1.25s',
          inset: `0 ${size * 0.538}px ${size * 0.538}px 0`,
        }}
      />
    </div>
  );
};
export { Loader };