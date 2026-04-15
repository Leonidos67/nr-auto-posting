import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const YouTubeIcon: React.FC<IconProps> = ({ 
  className = "w-6 h-6",
  size = 24,
}) => {
  const imageUrl = `https://img.icons8.com/?size=100&id=19318&format=png&color=000000`;

  return (
    <img 
      src={imageUrl}
      alt="YouTube"
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
  );
};