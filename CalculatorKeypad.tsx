import React from 'react';

interface CalculatorKeypadProps {
  onInsert: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onSolve: () => void;
}

const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({ onInsert, onClear, onBackspace, onSolve }) => {
  
  const btnClass = "h-12 bg-slate-800 hover:bg-slate-700 active:bg-purple-900 border border-slate-600 rounded text-cyan-300 font-mono text-lg transition-colors shadow-[0_2px_0_#1e293b] active:shadow-none active:translate-y-[2px]";
  const opClass = "h-12 bg-purple-900/40 hover:bg-purple-800/60 active:bg-purple-900 border border-purple-500 rounded text-white font-bold transition-colors shadow-[0_2px_0_#4c1d95] active:shadow-none active:translate-y-[2px]";
  const actionClass = "h-12 bg-cyan-900/40 hover:bg-cyan-800/60 active:bg-cyan-900 border border-cyan-500 rounded text-white font-bold transition-colors shadow-[0_2px_0_#155e75] active:shadow-none active:translate-y-[2px]";
  const solveClass = "h-12 bg-green-600 hover:bg-green-500 active:bg-green-700 border border-green-400 rounded text-white font-bold text-lg tracking-wider transition-colors shadow-[0_2px_0_#166534] active:shadow-none active:translate-y-[2px]";

  const groups = [
    // Row 1: Variables & Basic Controls
    [
      { label: 'x', val: 'x', cls: btnClass },
      { label: 'y', val: 'y', cls: btnClass },
      { label: '(', val: '(', cls: btnClass },
      { label: ')', val: ')', cls: btnClass },
      { label: 'AC', action: 'clear', cls: "h-12 bg-red-900/40 hover:bg-red-800 border border-red-500 text-red-200 rounded font-bold" },
    ],
    // Row 2: Functions
    [
      { label: 'sin', val: '\\sin(', cls: btnClass },
      { label: 'cos', val: '\\cos(', cls: btnClass },
      { label: 'tan', val: '\\tan(', cls: btnClass },
      { label: '^', val: '^', cls: btnClass },
      { label: '⌫', action: 'back', cls: "h-12 bg-slate-700 border border-slate-500 text-gray-200 rounded" },
    ],
    // Row 3: Calculus & Advanced
    [
      { label: '∫', val: '\\int ', cls: opClass },
      { label: 'lim', val: '\\lim_{x \\to a} ', cls: opClass },
      { label: 'd/dx', val: '\\frac{d}{dx}', cls: opClass },
      { label: '√', val: '\\sqrt{}', cls: btnClass },
      { label: '÷', val: '/', cls: btnClass },
    ],
    // Row 4: Numbers 7-9
    [
      { label: '7', val: '7', cls: btnClass },
      { label: '8', val: '8', cls: btnClass },
      { label: '9', val: '9', cls: btnClass },
      { label: 'π', val: '\\pi', cls: btnClass },
      { label: '×', val: '*', cls: btnClass },
    ],
    // Row 5: Numbers 4-6
    [
      { label: '4', val: '4', cls: btnClass },
      { label: '5', val: '5', cls: btnClass },
      { label: '6', val: '6', cls: btnClass },
      { label: 'e', val: 'e', cls: btnClass },
      { label: '-', val: '-', cls: btnClass },
    ],
    // Row 6: Numbers 1-3 & Solve
    [
      { label: '1', val: '1', cls: btnClass },
      { label: '2', val: '2', cls: btnClass },
      { label: '3', val: '3', cls: btnClass },
      { label: '.', val: '.', cls: btnClass },
      { label: '+', val: '+', cls: btnClass },
    ],
    // Row 7: 0 and Big Solve
    [
      { label: '0', val: '0', cls: btnClass },
      { label: '∞', val: '\\infty', cls: btnClass },
      { label: '=', val: '=', cls: actionClass },
      { label: 'HITUNG', action: 'solve', cls: `col-span-2 ${solveClass}` },
    ]
  ];

  return (
    <div className="bg-black/80 p-4 rounded-lg border-2 border-slate-700 shadow-2xl mt-4 max-w-md mx-auto lg:max-w-full">
      <div className="grid gap-2">
        {groups.map((row, rIdx) => (
          <div key={rIdx} className={`grid grid-cols-5 gap-2`}>
            {row.map((btn, bIdx) => (
              <button
                key={bIdx}
                onClick={() => {
                  if (btn.action === 'clear') onClear();
                  else if (btn.action === 'back') onBackspace();
                  else if (btn.action === 'solve') onSolve();
                  else if (btn.val) onInsert(btn.val);
                }}
                className={btn.cls}
              >
                {btn.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorKeypad;