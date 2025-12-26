// Simple synth for Cyberpunk UI sounds
export const playSound = (type: 'hover' | 'click' | 'success' | 'error' | 'typing') => {
  if (typeof window === 'undefined') return;
  
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  
  switch (type) {
    case 'hover':
      // High pitch short blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
      break;
      
    case 'click':
      // Lower pitch mechanical thud
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;

    case 'typing':
      // Very short click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
      break;

    case 'success':
      // Ascending major arpeggio
      const notes = [440, 554, 659]; // A4, C#5, E5
      notes.forEach((freq, i) => {
        const oscS = ctx.createOscillator();
        const gainS = ctx.createGain();
        oscS.connect(gainS);
        gainS.connect(ctx.destination);
        
        oscS.type = 'sine';
        oscS.frequency.value = freq;
        
        const start = now + (i * 0.05);
        gainS.gain.setValueAtTime(0, start);
        gainS.gain.linearRampToValueAtTime(0.05, start + 0.02);
        gainS.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        
        oscS.start(start);
        oscS.stop(start + 0.3);
      });
      break;

    case 'error':
      // Descending buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
  }
};