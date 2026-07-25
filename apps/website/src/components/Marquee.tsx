import React from 'react';
import { motion } from 'motion/react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
  pauseOnHover?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({
  children,
  speed = 40,
  direction = 'left',
  className = '',
  pauseOnHover = true,
}) => {
  return (
    <div className={`overflow-hidden flex flex-row ${className}`}>
      <motion.div
        className="flex flex-row flex-nowrap whitespace-nowrap min-w-full"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
        }}
        {...(pauseOnHover && {
          whileHover: { animationPlayState: 'paused' as any },
        })}
      >
        <div className="flex flex-row flex-nowrap shrink-0">
          {children}
        </div>
        <div className="flex flex-row flex-nowrap shrink-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Marquee;
