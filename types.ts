export type CalculatorMode = 'INTRO' | 'MENU_SELECTION' | 'ALGEBRA' | 'LIMIT' | 'DERIVATIVE' | 'INTEGRAL';

export type SubMode = 
  | 'NONE'
  // Algebra
  | 'SYS_ALGEBRA' | 'SYS_TRIG'
  // Limit
  | 'LIM_ALGEBRA' | 'LIM_FINITE' | 'LIM_INFINITE' | 'LIM_TRIG'
  // Derivative
  | 'DER_ALGEBRA' | 'DER_TRIG'
  // Integral
  | 'INT_AREA' | 'INT_VOLUME';

export interface GraphPoint {
  x: number;
  y: number;
}

export interface Step {
  explanation: string;
  result: string;
}

export interface SolveResponse {
  latexResult: string;
  steps: Step[];
  graphPoints: GraphPoint[];
  explanation: string;
}

export interface NavItem {
  id: CalculatorMode;
  label: string;
  description?: string; // For the main menu cards
  icon?: any; // Lucide icon component
  subItems?: { id: SubMode; label: string }[];
}

export interface IntegralBounds {
  lower: string;
  upper: string;
}

export interface FormulaInfo {
  title: string;
  latex: string;
  definition: string;
  methods: string[]; // List of steps/methods
  note?: string; // Optional nice-to-know info
}