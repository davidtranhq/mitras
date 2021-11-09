import React from 'react';

const { MQ } = window; // MathQuill

export interface MathInputProps {
  latex: string, // LaTeX string of the current MathInput
  latexToInsert: string, // LaTeX to insert into the MathInput at the current cursor
  onChange: (latex: string) => void,
  onFocus: () => void,
}

export default function MathInput({
  latex,
  latexToInsert,
  onChange,
  onFocus,
}: MathInputProps) {
  const input = React.useRef<HTMLDivElement>(null); // input to be transformed to MQ input
  const mathInput = React.useRef<any>(null); // MQ input created from `inputRef`

  // initialize the input as a MathQuill input
  React.useEffect(() => {
    mathInput.current = MQ.MathField(input.current, {
      handlers: {
        edit: (mathField: any) => onChange(mathField.latex()),
      },
    });
  }, [onChange]);

  // Insert `latexToInsert`
  React.useEffect(() => {
    if (!mathInput.current) {
      return;
    }
    mathInput.current.write(latexToInsert);
  }, [latexToInsert]);

  React.useEffect(() => {
    const mathField = mathInput.current;
    if (mathField && mathField.latex() !== latex) {
      mathField.latex(latex);
    }
  }, [latex]);

  return (
    <div
      className="expression-input"
      ref={input}
      onFocus={onFocus}
    />
  );
}
