'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CipherTextProps {
  text: string;
  className?: string;
  as?: any; // Changed from React.ElementType to any to allow for children
}

const CipherText: React.FC<CipherTextProps> = ({ text, className = "", as: Component = "span" }) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const scramble = () => {
    let iteration = 0;
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setDisplayText(
        text.split("").map((_, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      
      iteration += 1 / 3; 
    }, 30);
  };

  const stopScramble = () => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    setDisplayText(text);
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Component 
      className={`inline-block ${className}`}
      onMouseEnter={scramble}
      onMouseLeave={stopScramble}
    >
      {displayText}
    </Component>
  );
};

export default CipherText;
