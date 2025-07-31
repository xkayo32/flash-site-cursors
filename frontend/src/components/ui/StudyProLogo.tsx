import React from 'react';

interface StudyProLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const StudyProLogo: React.FC<StudyProLogoProps> = ({ 
  className = '', 
  variant = 'full',
  size = 'md' 
}) => {
  const sizes = {
    sm: { width: 120, height: 40, iconSize: 32 },
    md: { width: 160, height: 50, iconSize: 40 },
    lg: { width: 200, height: 60, iconSize: 48 },
    xl: { width: 240, height: 72, iconSize: 56 }
  };

  const { width, height, iconSize } = sizes[size];

  if (variant === 'icon') {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="black" stroke="white" strokeWidth="2"/>
        
        {/* Target/Crosshair Design */}
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="3"/>
        
        {/* Inner Ring */}
        <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="2"/>
        
        {/* Crosshair Lines */}
        <line x1="50" y1="10" x2="50" y2="30" stroke="white" strokeWidth="3"/>
        <line x1="50" y1="70" x2="50" y2="90" stroke="white" strokeWidth="3"/>
        <line x1="10" y1="50" x2="30" y2="50" stroke="white" strokeWidth="3"/>
        <line x1="70" y1="50" x2="90" y2="50" stroke="white" strokeWidth="3"/>
        
        {/* Center Target */}
        <circle cx="50" cy="50" r="8" fill="#facc15" stroke="white" strokeWidth="2"/>
        
        {/* SP Letters */}
        <text
          x="50"
          y="56"
          fill="black"
          textAnchor="middle"
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            fontWeight: 900,
            letterSpacing: '0.05em'
          }}
        >
          SP
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon Part */}
      <g transform={`translate(0, ${(height - iconSize) / 2})`}>
        {/* Background Circle */}
        <circle cx={iconSize/2} cy={iconSize/2} r={iconSize/2-1} fill="black" stroke="white" strokeWidth="1.5"/>
        
        {/* Target/Crosshair Design */}
        {/* Outer Ring */}
        <circle cx={iconSize/2} cy={iconSize/2} r={iconSize*0.4} fill="none" stroke="white" strokeWidth="2"/>
        
        {/* Inner Ring */}
        <circle cx={iconSize/2} cy={iconSize/2} r={iconSize*0.25} fill="none" stroke="white" strokeWidth="1.5"/>
        
        {/* Crosshair Lines */}
        <line x1={iconSize/2} y1={iconSize*0.1} x2={iconSize/2} y2={iconSize*0.3} stroke="white" strokeWidth="2"/>
        <line x1={iconSize/2} y1={iconSize*0.7} x2={iconSize/2} y2={iconSize*0.9} stroke="white" strokeWidth="2"/>
        <line x1={iconSize*0.1} y1={iconSize/2} x2={iconSize*0.3} y2={iconSize/2} stroke="white" strokeWidth="2"/>
        <line x1={iconSize*0.7} y1={iconSize/2} x2={iconSize*0.9} y2={iconSize/2} stroke="white" strokeWidth="2"/>
        
        {/* Center Target */}
        <circle cx={iconSize/2} cy={iconSize/2} r={iconSize*0.08} fill="#facc15" stroke="white" strokeWidth="1"/>
        
        {/* SP Letters */}
        <text
          x={iconSize/2}
          y={iconSize/2 + iconSize*0.06}
          fill="black"
          textAnchor="middle"
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: `${iconSize*0.12}px`,
            fontWeight: 900,
            letterSpacing: '0.05em'
          }}
        >
          SP
        </text>
      </g>

      {/* Text Part */}
      <g transform={`translate(${iconSize + 10}, 0)`}>
        {/* STUDY */}
        <text
          x="0"
          y={height * 0.65}
          fill="white"
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: `${height * 0.55}px`,
            fontWeight: 900,
            letterSpacing: '0.08em'
          }}
        >
          STUDY
        </text>
        
        {/* PRO */}
        <text
          x={width * 0.42}
          y={height * 0.65}
          fill="#facc15"
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: `${height * 0.55}px`,
            fontWeight: 900,
            letterSpacing: '0.08em'
          }}
        >
          PRO
        </text>
        
        {/* Underline */}
        <rect
          x="0"
          y={height * 0.72}
          width={width * 0.65}
          height="2"
          fill="#facc15"
        />
      </g>
    </svg>
  );
};

export default StudyProLogo;