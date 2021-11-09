import React from 'react';

const { MQ } = window; // MathQuill

interface TexButtonProps {
  tex: string,
  onClick: (e: React.MouseEvent) => void,
  className?: string
}

export default function TexButton({ tex, onClick, className }: TexButtonProps) {
  const button = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    MQ.StaticMath(button.current);
  });
  return (
    <button
      ref={button}
      className={className}
      type="button"
      onClick={onClick}
    >
      {tex}
    </button>
  );
}
