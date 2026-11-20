import { Fragment } from 'react';

/**
 * Divide um texto em palavras com máscara, para a animação de entrada palavra por palavra
 * (controlada em App.tsx pelo atributo data-split). Leitores de tela leem o texto normalmente.
 */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <span data-split="">
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="split-mask">
            <span className="split-word">{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
