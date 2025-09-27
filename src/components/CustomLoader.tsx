import React from 'react';

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 65,
  color = '#1FA9FF',
  className = ''
}) => {
  const keyframes = `
    @keyframes loaderAnimation-${size} {
      0% { top: 0; right: ${size * 0.538}px; bottom: ${size * 0.538}px; left: 0; }
      12.5% { top: 0; right: ${size * 0.538}px; bottom: 0; left: 0; }
      25% { top: ${size * 0.538}px; right: ${size * 0.538}px; bottom: 0; left: 0; }
      37.5% { top: ${size * 0.538}px; right: 0; bottom: 0; left: 0; }
      50% { top: ${size * 0.538}px; right: 0; bottom: 0; left: ${size * 0.538}px; }
      62.5% { top: 0; right: 0; bottom: 0; left: ${size * 0.538}px; }
      75% { top: 0; right: 0; bottom: ${size * 0.538}px; left: ${size * 0.538}px; }
      87.5% { top: 0; right: 0; bottom: ${size * 0.538}px; left: 0; }
      100% { top: 0; right: ${size * 0.538}px; bottom: ${size * 0.538}px; left: 0; }
    }
  `;

  const circleStyle: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '50px',
    boxShadow: `0 0 0 3px inset ${color}`,
    animation: `loaderAnimation-${size} 2.5s infinite`,
    top: 0,
    right: `${size * 0.538}px`,
    bottom: `${size * 0.538}px`,
    left: 0,
  };

  const circleDelayedStyle: React.CSSProperties = {
    ...circleStyle,
    animationDelay: '-1.25s',
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div style={circleStyle} />
      <div style={circleDelayedStyle} />
    </div>
  );
};

export default Loader;