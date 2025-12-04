import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface HeartWidgetProps {
  sizeMultiplier: number; // 1 to 3
}

const HeartWidget: React.FC<HeartWidgetProps> = ({ sizeMultiplier }) => {
  const [scale, setScale] = useState(1);
  
  // Pulse animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScale(s => s === 1 ? 1.1 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate color based on size: Small = Black/Gray, Large = Red
  const getColor = (size: number) => {
      if (size <= 1.2) return 'text-gray-900 fill-gray-950 stroke-lime-500';
      if (size <= 2) return 'text-red-900 fill-red-900 stroke-red-500';
      return 'text-red-500 fill-red-500 stroke-red-200';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className="transition-all duration-1000 ease-in-out relative flex items-center justify-center"
        style={{ 
          transform: `scale(${sizeMultiplier * 0.8 * scale})`,
        }}
      >
        <Heart 
            size={64} 
            className={`transition-colors duration-1000 ${getColor(sizeMultiplier)}`}
            strokeWidth={1.5}
        />
      </div>
      <div className="mt-8 text-lime-400 font-christmas text-lg opacity-80">
        Heart Size: {sizeMultiplier.toFixed(1)}x
      </div>
    </div>
  );
};

export default HeartWidget;
