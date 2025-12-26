import { SubMode } from '../types';

export const validateInput = (input: string, mode: SubMode): string | null => {
  const normalized = input.toLowerCase();

  // Basic check
  if (!normalized.trim()) return "Input tidak boleh kosong.";

  // 1. LIMIT Mode Validation
  if (mode.startsWith('LIM_')) {
    const limitKeywords = ['lim', '->', '\\to', 'mendekati', 'approaches'];
    const hasKeyword = limitKeywords.some(kw => normalized.includes(kw));
    if (!hasKeyword) {
      return "Format Limit tidak terdeteksi. Harap sertakan kata 'lim', tanda panah '->', atau '\\to' (Contoh: limit x->0 ...).";
    }
  }

  // 2. INTEGRAL Mode Validation - Relaxed to allow direct expression input
  if (mode.startsWith('INT_')) {
    // We trust the mode selection. If user inputs 'x^2', we assume they mean 'Integrate x^2'.
    // No strict keyword check needed.
  }

  // 3. DERIVATIVE Mode Validation
  if (mode.startsWith('DER_')) {
    // Check if input looks like an integral
    if (normalized.includes('\\int') || normalized.includes('∫')) {
      return "Input terlihat seperti Integral (mengandung ∫), namun Anda berada di mode Turunan. Silakan ganti mode.";
    }
    
    // Check if input looks like a limit
    // Note: We check for 'lim' AND '->' to avoid false positives on words like 'elimination'
    if ((normalized.includes('lim') && (normalized.includes('->') || normalized.includes('\\to')))) {
      return "Input terlihat seperti Limit, namun Anda berada di mode Turunan. Silakan ganti mode.";
    }
  }

  // 4. ALGEBRA System Validation
  if (mode.startsWith('SYS_')) {
    // Should not contain calculus operators to avoid confusion
    if (normalized.includes('\\int') || normalized.includes('∫')) {
      return "Input mengandung simbol Integral. Silakan gunakan menu Integral.";
    }
    if ((normalized.includes('lim') && (normalized.includes('->') || normalized.includes('\\to')))) {
       return "Input mengandung notasi Limit. Silakan gunakan menu Limit.";
    }
    // Check for d/dx or partial latex \frac{d}{dx}
    if (normalized.includes('d/dx') || normalized.includes('\\frac{d}{dx}') || normalized.includes('turunan')) {
       return "Input mengandung notasi Turunan. Silakan gunakan menu Turunan.";
    }
  }

  return null;
};