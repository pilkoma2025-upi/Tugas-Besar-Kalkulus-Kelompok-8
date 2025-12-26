import React, { useEffect, useState } from 'react';

interface MathRendererProps {
  latex: string;
  className?: string;
  displayMode?: boolean;
}

declare global {
  interface Window {
    katex?: any;
  }
}

const MathRenderer: React.FC<MathRendererProps> = ({
  latex,
  className = '',
  displayMode = false,
}) => {
  const [html, setHtml] = useState('');
  const [ready, setReady] = useState(false);

  /* ===== LOAD KATEX ===== */
  useEffect(() => {
    if (window.katex) {
      setReady(true);
      return;
    }

    // CSS
    if (!document.querySelector('link[href*="katex.min.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }

    // JS
    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';

    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  /* ===== RENDER LATEX ===== */
  useEffect(() => {
    if (!latex || !ready || !window.katex) {
      setHtml('');
      return;
    }

    try {
      let expr = latex
        .replace(/```latex/gi, '')
        .replace(/```/g, '')
        .trim()
        .replace(/^\$+|\$+$/g, '');

      if (expr.startsWith('\\[') && expr.endsWith('\\]')) {
        expr = expr.slice(2, -2);
      }

      const rendered = window.katex.renderToString(expr, {
        displayMode,
        throwOnError: false,
        strict: false,
      });

      setHtml(rendered);
    } catch {
      setHtml(`<span class="text-red-400">${latex}</span>`);
    }
  }, [latex, displayMode, ready]);

  return (
    <span
      className={`katex ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathRenderer;