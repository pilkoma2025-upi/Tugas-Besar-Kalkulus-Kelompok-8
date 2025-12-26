import React, { useState, useRef, useEffect } from 'react';
import { CalculatorMode, SubMode, SolveResponse, NavItem, IntegralBounds, FormulaInfo } from './types';
import { solveMathProblem } from './geminiService.ts';
import { validateInput } from './validationService.ts';
import MathRenderer from './MathRenderer.tsx';
import GraphPlot from './GraphPlot.tsx';
import CalculatorKeypad from './CalculatorKeypad.tsx';
import { playSound } from './audio.ts';
import { 
  Home, Calculator, Users, BookOpen, Menu, X, AlertCircle, 
  Keyboard, GraduationCap, ChevronRight, Play, Bot, Settings, Hexagon, Zap, 
  Activity, Radio, Wifi, Database, Cpu, HardDrive
} from 'lucide-react';

// --- VISUAL COMPONENTS ---

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポ1234567890';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for( let x = 0; x < columns; x++ ) {
        drops[x] = 1;
    }

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0'; // Green text
        ctx.font = fontSize + 'px monospace';

        for(let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            
            // Randomly pick color: mostly green, some white, some cyan
            const randomColor = Math.random();
            if (randomColor > 0.95) ctx.fillStyle = '#FFF';
            else if (randomColor > 0.8) ctx.fillStyle = '#22d3ee'; // Cyan
            else ctx.fillStyle = '#0F0';

            ctx.fillText(text, i*fontSize, drops[i]*fontSize);

            if(drops[i]*fontSize > canvas.height && Math.random() > 0.975)
                drops[i] = 0;

            drops[i]++;
        }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-10 pointer-events-none" />;
};

// --- ICONS ---

const AlgebraIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-cyan-300 group-hover:text-pink-300 transition-colors filter drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
    <path d="M20,20 L80,80 M80,20 L20,80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <text x="50" y="25" textAnchor="middle" fill="currentColor" fontSize="18" fontFamily="monospace" fontWeight="bold">2a</text>
    <path d="M10,50 L90,50" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const LimitIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-cyan-300 group-hover:text-pink-300 transition-colors filter drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
    <path d="M10,90 L90,90 M10,90 L10,10" stroke="currentColor" strokeWidth="2" />
    <path d="M15,80 Q40,80 50,50 T90,20" stroke="currentColor" strokeWidth="4" fill="none" />
    <path d="M10,20 L90,20" stroke="currentColor" strokeWidth="1" strokeDasharray="4,2" className="text-pink-500" />
    <text x="80" y="15" fill="currentColor" fontSize="12" fontFamily="monospace">L</text>
    <path d="M60,90 L60,50" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
    <text x="60" y="98" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="monospace">c</text>
    <path d="M65,55 L60,50 L55,55" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const DerivativeIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-cyan-300 group-hover:text-pink-300 transition-colors filter drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
    <text x="50" y="45" textAnchor="middle" fill="currentColor" fontSize="30" fontFamily="serif" fontWeight="bold" style={{ fontStyle: 'italic' }}>dy</text>
    <path d="M20,55 L80,55" stroke="currentColor" strokeWidth="4" />
    <text x="50" y="85" textAnchor="middle" fill="currentColor" fontSize="30" fontFamily="serif" fontWeight="bold" style={{ fontStyle: 'italic' }}>dx</text>
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="10,5" fill="none" className="animate-spin-slow" />
  </svg>
);

const IntegralIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-cyan-300 group-hover:text-pink-300 transition-colors filter drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
    <path d="M45,20 C55,20 55,30 50,40 L40,60 C35,70 35,80 45,80" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
    <text x="60" y="25" fill="currentColor" fontSize="14" fontFamily="monospace">b</text>
    <text x="25" y="85" fill="currentColor" fontSize="14" fontFamily="monospace">a</text>
    <path d="M55,50 Q75,40 90,50" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M55,50 L55,80 L90,80 L90,50" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

// --- DATA CONSTANTS ---

const MENU_ITEMS: NavItem[] = [
  { 
    id: 'ALGEBRA', 
    label: '1. Sistem Bilangan', 
    description: 'Operasi dasar, himpunan penyelesaian, dan trigonometri dasar.',
    icon: AlgebraIcon,
    subItems: [
      { id: 'SYS_ALGEBRA', label: 'Aljabar & Persamaan' }, 
      { id: 'SYS_TRIG', label: 'Trigonometri Dasar' }
    ] 
  },
  { 
    id: 'LIMIT', 
    label: '2. Limit Fungsi',
    description: 'Pendekatan nilai fungsi menuju titik tertentu atau tak hingga.',
    icon: LimitIcon,
    subItems: [
      { id: 'LIM_ALGEBRA', label: 'Limit Aljabar' },
      { id: 'LIM_FINITE', label: 'Limit Hingga' },
      { id: 'LIM_INFINITE', label: 'Limit Tak Hingga' },
      { id: 'LIM_TRIG', label: 'Limit Trigonometri' }
    ]
  },
  { 
    id: 'DERIVATIVE', 
    label: '3. Turunan',
    description: 'Laju perubahan sesaat dan kemiringan garis singgung kurva.',
    icon: DerivativeIcon,
    subItems: [
      { id: 'DER_ALGEBRA', label: 'Turunan Aljabar' },
      { id: 'DER_TRIG', label: 'Turunan Trigonometri' }
    ]
  },
  { 
    id: 'INTEGRAL', 
    label: '4. Integral',
    description: 'Akumulasi jumlah, luas daerah, dan volume benda putar.',
    icon: IntegralIcon,
    subItems: [
      { id: 'INT_AREA', label: 'Integral Tentu (Luas)' },
      { id: 'INT_VOLUME', label: 'Volume Benda Putar' }
    ]
  }
];

const FORMULA_INFO: Record<SubMode, FormulaInfo> = {
  'NONE': { title: '', latex: '', definition: '', methods: [] },
  'SYS_ALGEBRA': {
    title: 'Persamaan Kuadrat & Aljabar',
    latex: 'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    definition: 'Cabang matematika yang mempelajari simbol matematika dan aturan untuk memanipulasi simbol-simbol tersebut. Fokus pada pencarian variabel yang tidak diketahui.',
    methods: [
      'Identifikasi koefisien a, b, dan c.',
      'Gunakan rumus ABC jika tidak bisa difaktorkan.',
      'Sederhanakan ekspresi di dalam akar.',
      'Dapatkan dua nilai x (positif dan negatif).'
    ],
    note: 'Diskriminan (D = b² - 4ac) menentukan jenis akar persamaan.'
  },
  'SYS_TRIG': {
    title: 'Identitas Trigonometri',
    latex: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
    definition: 'Hubungan antara sudut dan sisi segitiga. Identitas dasar digunakan untuk menyederhanakan persamaan trigonometri yang kompleks.',
    methods: [
      'Ubah semua fungsi ke sin dan cos jika bingung.',
      'Gunakan identitas Pythagoras.',
      'Samakan penyebut untuk penjumlahan pecahan trigono.'
    ]
  },
  'LIM_ALGEBRA': {
    title: 'Definisi Limit',
    latex: '\\lim_{x \\to c} f(x) = L',
    definition: 'Nilai yang didekati oleh fungsi f(x) saat x mendekati c, namun x tidak harus sama dengan c.',
    methods: [
      'Substitusi Langsung: Masukkan nilai c ke x.',
      'Faktorisasi: Jika hasil 0/0, faktorkan pembilang/penyebut.',
      'Perkalian Sekawan: Jika ada bentuk akar dan hasil 0/0.'
    ]
  },
  'LIM_FINITE': {
    title: 'Limit Hingga',
    latex: '\\lim_{x \\to a} \\frac{f(x)}{g(x)}',
    definition: 'Mencari perilaku fungsi saat x mendekati suatu bilangan real tertentu.',
    methods: [
      'Cek substitusi langsung.',
      'Jika bentuk tak tentu (0/0), gunakan L\'Hopital (turunkan atas dan bawah).',
      'Atau gunakan manipulasi aljabar.'
    ]
  },
  'LIM_INFINITE': {
    title: 'Limit Tak Hingga',
    latex: '\\lim_{x \\to \\infty} \\frac{a_nx^n + ...}{b_mx^m + ...}',
    definition: 'Perilaku fungsi saat x membesar tanpa batas (positif atau negatif).',
    methods: [
      'Bagi semua suku dengan pangkat tertinggi dari penyebut.',
      'Jika pangkat pembilang = penyebut, hasil = koefisien pangkat tertinggi.',
      'Jika pangkat pembilang < penyebut, hasil = 0.',
      'Jika pangkat pembilang > penyebut, hasil = ∞.'
    ]
  },
  'LIM_TRIG': {
    title: 'Limit Trigonometri',
    latex: '\\lim_{x \\to 0} \\frac{\\sin ax}{bx} = \\frac{a}{b}',
    definition: 'Limit khusus yang melibatkan fungsi sinus, cosinus, atau tangen saat mendekati 0.',
    methods: [
      'Gunakan sifat dasar lim sin(x)/x = 1.',
      'Gunakan identitas trigonometri untuk mengubah bentuk cos menjadi sin (contoh: 1 - cos 2x = 2sin²x).',
      'Pastikan variabel mendekati 0.'
    ]
  },
  'DER_ALGEBRA': {
    title: 'Aturan Pangkat Turunan',
    latex: 'f(x) = ax^n \\implies f\'(x) = anx^{n-1}',
    definition: 'Turunan mengukur sensitivitas perubahan nilai fungsi terhadap perubahan nilai inputnya (gradien).',
    methods: [
      'Kalikan koefisien dengan pangkat.',
      'Kurangi pangkat dengan 1.',
      'Turunan konstanta adalah 0.'
    ]
  },
  'DER_TRIG': {
    title: 'Turunan Trigonometri',
    latex: '\\frac{d}{dx}(\\sin x) = \\cos x',
    definition: 'Laju perubahan fungsi trigonometri pada titik tertentu.',
    methods: [
      'Hafalkan turunan dasar (sin -> cos, cos -> -sin).',
      'Gunakan aturan rantai untuk sudut majemuk. Contoh: sin(2x) -> 2cos(2x).'
    ]
  },
  'INT_AREA': {
    title: 'Integral Tentu (Luas)',
    latex: '\\int_a^b f(x) dx = [F(x)]_a^b = F(b) - F(a)',
    definition: 'Invers dari turunan. Integral tentu digunakan untuk menghitung luas area di bawah kurva fungsi f(x) dari x=a sampai x=b.',
    methods: [
      'Cari antiturunan F(x) dari f(x).',
      'Substitusi batas atas (b) ke F(x).',
      'Substitusi batas bawah (a) ke F(x).',
      'Kurangi hasil batas atas dengan hasil batas bawah.'
    ]
  },
  'INT_VOLUME': {
    title: 'Volume Benda Putar',
    latex: 'V = \\pi \\int_a^b [f(x)]^2 dx',
    definition: 'Menghitung volume benda yang terbentuk jika suatu daerah diputar mengelilingi sumbu (biasanya sumbu x).',
    methods: [
      'Identifikasi fungsi jari-jari r = f(x).',
      'Kuadratkan fungsi tersebut.',
      'Integralkan fungsi kuadrat terhadap batas a dan b.',
      'Kalikan hasil akhirnya dengan π.'
    ]
  }
};

const MEMBERS = [
  { name: 'Elsa Tiara Octaviani', nim: 'NIM. 2501975' },
  { name: 'M. Yunus Haqial Azmi', nim: 'NIM. 2507885' },
  { name: 'Muhammad Azmy Al-Manafi', nim: 'NIM. 2508123' },
  { name: 'Putri Fajriah Oktaviani', nim: 'NIM. 2501702' },
  { name: 'Randika Andriawan', nim: 'NIM. 2501691' },
];

// --- APP COMPONENT ---

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('INTRO');
  const [subMode, setSubMode] = useState<SubMode>('NONE');
  const [viewState, setViewState] = useState<'INTRO' | 'MENU_SELECTION' | 'FORMULA' | 'CALCULATOR'>('INTRO');
  
  const [input, setInput] = useState('');
  const [integralBounds, setIntegralBounds] = useState<IntegralBounds>({ lower: '', upper: '' });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);

  // Random Data Generator for HUD
  const [hudData, setHudData] = useState({ cpu: 0, ram: 0, net: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      setHudData({
        cpu: Math.floor(Math.random() * 40) + 10,
        ram: Math.floor(Math.random() * 30) + 20,
        net: Math.floor(Math.random() * 900) + 100
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  // -- Event Handlers with Sound --

  const handleAction = (cb: () => void, sound: 'click' | 'hover' = 'click') => {
    playSound(sound);
    cb();
  };

  const enterMainMenu = () => handleAction(() => {
    setCurrentMode('MENU_SELECTION');
    setViewState('MENU_SELECTION');
  });

  const handleModeSelect = (mode: CalculatorMode, sub: SubMode) => handleAction(() => {
    setCurrentMode(mode);
    setSubMode(sub);
    setResult(null);
    setInput('');
    setIntegralBounds({ lower: '', upper: '' });
    setError(null);
    setMobileMenuOpen(false);
    
    setViewState('FORMULA');
  });

  const startCalculator = () => handleAction(() => {
    setViewState('CALCULATOR');
    setShowKeypad(true);
  });

  const handleKeypadInsert = (value: string) => {
    playSound('typing');
    if (error) setError(null);
    const el = inputRef.current;
    if (!el) {
      setInput(prev => prev + value);
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = input;
    const newText = text.substring(0, start) + value + text.substring(end);
    
    setInput(newText);
    
    setTimeout(() => {
      el.focus();
      const newCursorPos = start + value.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBackspace = () => {
    playSound('click');
    if (error) setError(null);
    const el = inputRef.current;
    if (!el) return;

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    
    if (start === end && start > 0) {
      const newText = input.substring(0, start - 1) + input.substring(end);
      setInput(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start - 1, start - 1);
      }, 0);
    } else if (start !== end) {
      const newText = input.substring(0, start) + input.substring(end);
      setInput(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start);
      }, 0);
    }
  };

  const handleSolve = async () => {
    playSound('click');
    setError(null);
    setResult(null);

    if (!input.trim()) {
      setError("Mohon masukkan soal terlebih dahulu.");
      playSound('error');
      return;
    }

    const validationMsg = validateInput(input, subMode);
    if (validationMsg) {
      setError(validationMsg);
      playSound('error');
      return;
    }

    setLoading(true);
    // Pass integral bounds if in Integral mode
    const bounds = currentMode === 'INTEGRAL' ? integralBounds : undefined;
    
    const response = await solveMathProblem(input, subMode, bounds);
    setResult(response);
    setLoading(false);
    playSound('success');
  };

  const getIntegralPreview = () => {
    if (currentMode !== 'INTEGRAL') return '';
    const lower = integralBounds.lower || 'a';
    const upper = integralBounds.upper || 'b';
    const val = input.trim() || 'f(x)';
    
    if (subMode === 'INT_VOLUME') {
      return `V = \\pi \\int_{${lower}}^{${upper}} \\left[ ${val} \\right]^2 \\, dx`;
    }
    return `\\int_{${lower}}^{${upper}} ${val} \\, dx`;
  };

  // --- RENDERERS ---

  const renderBackgroundDecorations = () => (
    <>
      <MatrixRain />
      
      {/* Floating Cyber Drones/Shapes */}
      <div className="fixed top-20 left-10 opacity-30 pointer-events-none float-anim z-0">
        <Bot className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
      </div>
      <div className="fixed bottom-20 right-10 opacity-20 pointer-events-none float-anim-delayed z-0">
        <Settings className="w-32 h-32 text-purple-500 animate-spin-slow" style={{animationDuration: '20s'}} />
      </div>
      <div className="fixed top-1/2 right-20 opacity-20 pointer-events-none float-anim-reverse z-0">
        <Hexagon className="w-16 h-16 text-pink-500 fill-pink-500/10" />
      </div>
      <div className="fixed bottom-1/3 left-1/4 opacity-10 pointer-events-none z-0">
         <div className="w-40 h-40 border-4 border-dashed border-yellow-400 rounded-full animate-pulse"></div>
      </div>
    </>
  );

  const renderHUD = () => (
    <div className="fixed inset-0 pointer-events-none z-50 hidden lg:block">
      {/* Top Left HUD */}
      <div className="absolute top-24 left-6 w-48 font-mono text-[10px] text-cyan-500/60 flex flex-col gap-2">
        <div className="flex justify-between border-b border-cyan-500/30 pb-1">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3"/> CPU_LOAD</span>
          <span>{hudData.cpu}%</span>
        </div>
        <div className="w-full h-1 bg-cyan-900/30">
          <div className="h-full bg-cyan-500/50" style={{width: `${hudData.cpu}%`}}></div>
        </div>
        
        <div className="flex justify-between border-b border-cyan-500/30 pb-1 pt-2">
          <span className="flex items-center gap-1"><HardDrive className="w-3 h-3"/> MEM_ALLOC</span>
          <span>{hudData.ram}TB</span>
        </div>
        <div className="w-full h-1 bg-cyan-900/30">
          <div className="h-full bg-purple-500/50" style={{width: `${hudData.ram}%`}}></div>
        </div>
      </div>

      {/* Bottom Left HUD */}
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-pink-500/60">
         <div className="flex items-center gap-2 mb-1">
           <Activity className="w-3 h-3" /> SYSTEM_DIAGNOSTICS
         </div>
         <div className="border border-pink-500/30 p-2 bg-pink-900/10">
            <p>KERNEL: OK</p>
            <p>GEN_AI: CONNECTED</p>
            <p>LATENCY: 12ms</p>
         </div>
      </div>

      {/* Right Side Ticker */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1 h-12 bg-gray-800 rounded-full overflow-hidden relative border border-gray-700">
             <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500 to-transparent animate-scan" style={{animationDelay: `${i * 0.5}s`}}></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-white pt-24 pb-12 relative z-10">
      <div className="text-center space-y-6">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 glitch-text" data-text="CYBERCALC">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            CYBERCALC
          </span>
        </h1>
        <div className="flex items-center justify-center gap-3 text-cyan-300 font-mono tracking-[0.5em] text-sm md:text-xl uppercase opacity-80 mb-8">
           <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
           Calculus Computation Engine
           <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
        </div>
        <p className="text-xl md:text-2xl text-gray-300 font-mono max-w-2xl mx-auto">
          Intelligent Calculus System.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <button onClick={enterMainMenu} onMouseEnter={() => playSound('hover')} className="text-left bg-black/80 backdrop-blur-sm border-2 border-purple-600 p-8 rounded-none shadow-[4px_4px_0px_#a855f7] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#a855f7] transition-all duration-200 group">
          <div className="flex items-center gap-4 mb-4 border-b-2 border-dashed border-purple-800 pb-4">
            <BookOpen className="text-purple-400 w-8 h-8 group-hover:text-pink-400 transition-colors" />
            <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Tujuan Sistem</h2>
          </div>
          <p className="text-gray-300 leading-relaxed font-mono text-lg">
            Aplikasi ini dirancang untuk memfasilitasi mahasiswa <span className="text-cyan-400 font-bold bg-cyan-900/30 px-1">Pend. Ilmu Komputer</span> dalam memahami konsep Kalkulus.
          </p>
        </button>

        <div className="bg-black/80 backdrop-blur-sm border-2 border-cyan-500 p-8 rounded-none shadow-[4px_4px_0px_#22d3ee] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#22d3ee] transition-all duration-200 group">
          <div className="flex items-center gap-4 mb-4 border-b-2 border-dashed border-cyan-800 pb-4">
            <Users className="text-cyan-400 w-8 h-8 group-hover:text-yellow-400 transition-colors" />
            <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Dedikasi</h2>
          </div>
          <p className="text-gray-300 leading-relaxed font-mono italic text-lg">
            "Kami persembahkan karya ini untuk Bapak Drs. H. Eka Fitrajaya Rahman, M.T sebagai dosen pengampu mata kuliah Kalkulus Pendidikan Ilmu Komputer A 2025."
          </p>
        </div>
      </div>

      <div className="pt-10">
        <h3 className="text-2xl text-center text-white mb-8 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4">
          <GraduationCap className="w-8 h-8 text-pink-400" />
          Tim Pengembang - Kelompok 8
        </h3>
        <div className="flex flex-wrap justify-center gap-6">
          {MEMBERS.map((member, i) => (
            <div key={i} className="px-6 py-4 bg-slate-900/90 border border-purple-500/50 hover:bg-purple-900/40 hover:border-cyan-400 transition-all text-center w-56 shadow-[0_0_15px_rgba(168,85,247,0.2)] group cursor-default skew-x-[-12deg]">
              <div className="skew-x-[12deg]">
                <div className="text-white font-bold text-lg mb-1 group-hover:text-cyan-300 transition-colors font-mono">{member.name}</div>
                <div className="text-purple-400 text-sm tracking-wide">{member.nim}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center pt-12 pb-20">
        <button 
          onClick={enterMainMenu}
          onMouseEnter={() => playSound('hover')}
          className="relative inline-flex items-center justify-center px-12 py-6 overflow-hidden font-bold text-white transition-all duration-200 bg-transparent border-4 border-cyan-400 hover:bg-cyan-900/30 group focus:outline-none"
        >
          <span className="absolute w-full h-full -mt-1 rounded opacity-30 bg-gradient-to-b from-transparent via-transparent to-cyan-400"></span>
          <span className="relative text-2xl tracking-[0.3em] flex items-center gap-4 group-hover:text-cyan-200 transition-colors">
             <Keyboard className="w-8 h-8" /> AKSES SISTEM
          </span>
        </button>
      </div>
    </div>
  );

  const renderMenuSelection = () => (
    <div className="max-w-6xl mx-auto pt-24 pb-12 px-4 relative z-10">
      <div className="text-center mb-16">
         <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-widest flex items-center justify-center gap-4">
           <Menu className="w-10 h-10 text-pink-500" /> Cyber Deck Menu
         </h2>
         <p className="text-cyan-400 font-mono mt-4 tracking-wider">SILAKAN PILIH MODUL KALKULUS ANDA</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon || Database;
          return (
            <div key={item.id} className="bg-black/60 border border-purple-500/50 p-6 relative group hover:bg-purple-900/20 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500 group-hover:border-cyan-400 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500 group-hover:border-cyan-400 transition-colors"></div>
              
              <div className="flex items-start gap-6">
                <div className="p-4 bg-slate-900 border border-purple-500 group-hover:border-pink-500 transition-colors rounded-none shadow-[0_0_15px_rgba(168,85,247,0.3)] min-w-[5rem] flex items-center justify-center">
                  <Icon />
                </div>
                <div className="flex-1">
                   <h3 className="text-2xl font-bold text-white uppercase mb-2 group-hover:text-cyan-200">{item.label}</h3>
                   <p className="text-gray-400 font-mono text-sm leading-relaxed mb-4">{item.description}</p>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                     {item.subItems?.map(sub => (
                       <button 
                         key={sub.id}
                         onClick={() => handleModeSelect(item.id, sub.id)}
                         onMouseEnter={() => playSound('hover')}
                         className="text-left px-3 py-2 bg-white/5 hover:bg-cyan-600/30 border-l-2 border-gray-600 hover:border-cyan-400 text-sm text-gray-300 hover:text-white transition-all font-mono flex items-center justify-between group/btn"
                       >
                         {sub.label}
                         <ChevronRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFormulaPreview = () => {
    const info = FORMULA_INFO[subMode] || { title: '', latex: '', definition: '', methods: [] };
    
    return (
      <div className="min-h-[70vh] flex items-center justify-center pt-24 pb-10 px-4 relative z-10">
        <div className="max-w-4xl w-full relative">
          
          <button onClick={enterMainMenu} className="absolute -top-12 left-0 text-cyan-400 hover:text-white flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
            <ChevronRight className="rotate-180 w-4 h-4" /> Kembali ke Menu
          </button>

          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg blur opacity-40 animate-pulse"></div>
          
          <div className="relative bg-[#0a0a0a] border-2 border-white/10 rounded-lg shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-slate-900/90 p-8 border-b border-purple-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                   <span className="w-3 h-3 bg-pink-500 rounded-full animate-ping"></span>
                   <span className="text-pink-500 font-mono tracking-[0.2em] uppercase text-xs font-bold">Theory_Database_Loaded</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider">{info.title}</h2>
              </div>
              <div className="bg-black/50 px-4 py-2 border border-cyan-900 rounded text-cyan-400 font-mono text-sm">
                CODE: {subMode}
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              {/* LaTeX Display */}
              <div className="bg-black/40 border-2 border-dashed border-purple-500/30 rounded-xl p-6 md:p-10 text-center shadow-inner relative group">
                <div className="absolute top-2 right-2 text-[10px] text-purple-700 font-mono uppercase">Render Engine: KaTeX</div>
                <div className="overflow-x-auto overflow-y-hidden py-2">
                   <MathRenderer latex={info.latex} displayMode={true} className="text-2xl md:text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Definition */}
                <div className="space-y-3">
                   <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm border-b border-cyan-900 pb-2 flex items-center gap-2">
                     <BookOpen className="w-4 h-4" /> Definisi
                   </h3>
                   <p className="text-gray-300 font-mono leading-relaxed text-lg">
                     {info.definition}
                   </p>
                </div>

                {/* Methods */}
                <div className="space-y-3">
                   <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-sm border-b border-yellow-900 pb-2 flex items-center gap-2">
                     <Zap className="w-4 h-4" /> Algoritma Penyelesaian
                   </h3>
                   <ul className="space-y-2">
                     {info.methods?.map((step, idx) => (
                       <li key={idx} className="flex gap-3 text-gray-300 font-mono text-sm">
                         <span className="text-yellow-600 font-bold">[{idx+1}]</span>
                         {step}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>

              {/* Notes */}
              {info.note && (
                <div className="bg-pink-900/10 border-l-4 border-pink-500 p-4 flex gap-4 items-start mt-4">
                  <AlertCircle className="w-6 h-6 text-pink-500 flex-shrink-0" />
                  <div>
                    <strong className="text-pink-400 uppercase text-xs tracking-wider block mb-1">Catatan Sistem</strong>
                    <p className="text-gray-300 font-mono text-sm">{info.note}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-slate-900/90 p-6 border-t border-purple-900 flex justify-center">
              <button 
                onClick={startCalculator}
                onMouseEnter={() => playSound('hover')}
                className="group relative px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xl uppercase tracking-widest transition-all clip-path-polygon shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] flex items-center gap-3"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
              >
                AKTIFKAN KALKULATOR <Play className="w-5 h-5 fill-current" />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderCalculator = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pt-24 pb-12 relative z-10 px-4">
      {/* Sidebar Menu (Desktop) */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 p-5 rounded-none shadow-[0_0_20px_rgba(168,85,247,0.1)]">
          <h3 className="text-xl text-white font-black mb-6 flex items-center gap-3 border-b border-purple-500/30 pb-4 tracking-widest font-mono">
            <Menu className="w-5 h-5 text-cyan-400" /> NAVIGATION
          </h3>
          <div className="space-y-3">
            <button 
              onClick={enterMainMenu}
              onMouseEnter={() => playSound('hover')}
              className="w-full text-left px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-cyan-950/30 border-l-2 border-transparent hover:border-cyan-400 transition-all font-bold flex items-center gap-2 font-mono"
            >
              <Home className="w-4 h-4" /> MAIN_MENU
            </button>
            {MENU_ITEMS.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="px-4 py-2 font-black text-purple-400 uppercase text-xs tracking-widest mt-4">{item.label}</div>
                <div className="space-y-1">
                  {item.subItems?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleModeSelect(item.id, sub.id)}
                      onMouseEnter={() => playSound('hover')}
                      className={`w-full text-left px-4 py-2 text-sm transition-all duration-200 font-mono ${
                        subMode === sub.id 
                          ? 'bg-purple-600/20 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                          : 'text-gray-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (Input & Result) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-black/80 border border-purple-500 p-6 relative overflow-hidden min-h-[600px] shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
          {/* Cyberpunk Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
          
          <div className="mb-6 flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-2xl text-white font-black mb-1 flex items-center gap-3 uppercase tracking-wider">
                <Calculator className="w-6 h-6 text-cyan-400" />
                Computation_Module
              </h2>
              <div className="flex gap-2 text-xs font-mono mt-1">
                 <span className="text-purple-400 px-2 py-0.5 bg-purple-900/20 border border-purple-500/50 rounded">{MENU_ITEMS.find(m => m.id === currentMode)?.label}</span>
                 <span className="text-cyan-400 px-2 py-0.5 bg-cyan-900/20 border border-cyan-500/50 rounded">
                    {MENU_ITEMS.find(m => m.id === currentMode)?.subItems?.find(s => s.id === subMode)?.label}
                 </span>
              </div>
            </div>
            <button 
              onClick={() => {
                playSound('click');
                setShowKeypad(!showKeypad);
              }}
              className={`p-2 rounded border transition-all ${showKeypad ? 'bg-cyan-900/30 border-cyan-400 text-cyan-300' : 'bg-transparent border-gray-700 text-gray-500'}`}
              title="Toggle Keypad"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="sticky top-0 z-20 bg-[#050505]/95 pb-4 border-b border-purple-900/50">
              <label className="block text-cyan-400 mb-2 font-mono text-xs tracking-[0.2em] uppercase">Input_Sequence</label>
              
              <div className="flex gap-2 items-center">
                {currentMode === 'INTEGRAL' && (
                  <div className="flex flex-col gap-1 -mt-1">
                     <input 
                       type="text" 
                       placeholder="b" 
                       value={integralBounds.upper}
                       onChange={(e) => setIntegralBounds({...integralBounds, upper: e.target.value})}
                       className="w-10 h-8 bg-slate-900 border border-purple-500 text-center text-xs text-white focus:border-cyan-400 focus:outline-none"
                     />
                     <span className="text-purple-500 text-center text-lg leading-none">∫</span>
                     <input 
                       type="text" 
                       placeholder="a" 
                       value={integralBounds.lower}
                       onChange={(e) => setIntegralBounds({...integralBounds, lower: e.target.value})}
                       className="w-10 h-8 bg-slate-900 border border-purple-500 text-center text-xs text-white focus:border-cyan-400 focus:outline-none"
                     />
                  </div>
                )}
                
                <div className="relative w-full">
                  {/* Live Math Preview */}
                  {input && (
                     <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-black/80 border border-gray-700 rounded text-sm text-cyan-200 pointer-events-none whitespace-nowrap overflow-hidden max-w-full">
                        <MathRenderer latex={input} />
                     </div>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter mathematical expression..."
                    className={`w-full bg-slate-900/80 border-2 ${error ? 'border-red-500 animate-pulse' : 'border-purple-500 focus:border-cyan-400'} text-white p-4 text-xl focus:outline-none font-mono transition-all mb-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]`}
                    onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
                  />
                </div>
              </div>

              {/* INTEGRAL PREVIEW */}
              {currentMode === 'INTEGRAL' && (
                <div className="mt-4 mb-2 p-4 bg-cyan-950/20 border border-cyan-500/30 rounded flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Decor */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400"></div>

                  <span className="text-cyan-400 text-[10px] tracking-[0.3em] font-mono mb-2 uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                    Integral_Preview
                  </span>
                  
                  <div className="py-3 px-8 bg-black/60 border border-dashed border-cyan-900 rounded mb-4 min-w-[200px] text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                     <MathRenderer latex={getIntegralPreview()} className="text-2xl text-white" displayMode={true} />
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mb-2 p-3 bg-red-950/80 border-l-4 border-red-500 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                     <span className="text-red-200 text-sm font-mono">{error}</span>
                  </div>
                </div>
              )}

              {/* Keypad */}
              {showKeypad && (
                <div className="animate-fade-in-up mt-4">
                  <CalculatorKeypad 
                    onInsert={handleKeypadInsert} 
                    onClear={() => {
                        playSound('click');
                        setInput(''); 
                        setError(null); 
                        setIntegralBounds({lower:'', upper:''});
                    }} 
                    onBackspace={handleBackspace} 
                    onSolve={handleSolve}
                  />
                </div>
              )}
            </div>

            {loading && (
              <div className="py-20 text-center">
                <div className="inline-block relative">
                   <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                   <div className="w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin absolute top-2 left-2 animation-delay-150"></div>
                </div>
                <p className="mt-6 text-cyan-400 font-mono tracking-widest text-lg font-bold animate-pulse">PROCESSING DATA...</p>
              </div>
            )}
            
            {result && !loading && (
              <div className="space-y-8 animate-fade-in-up pb-8">
                {/* Answer Box */}
                <div className="bg-gradient-to-r from-slate-900 to-black p-6 border-l-4 border-cyan-400 shadow-[0_5px_15px_rgba(34,211,238,0.15)]">
                  <h3 className="text-cyan-400 text-xs mb-3 uppercase tracking-[0.2em] font-black">Final_Output</h3>
                  <div className="overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-purple-600">
                    <MathRenderer latex={result.latexResult} className="text-3xl text-white" displayMode />
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-white/5 p-6 border border-white/10 backdrop-blur-sm">
                  <h3 className="text-purple-300 text-xs mb-6 uppercase tracking-[0.2em] font-black border-b border-white/10 pb-2">Computation_Steps</h3>
                  <div className="space-y-8">
                    {result.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-5 relative group">
                        {/* Connecting Line */}
                        {idx !== result.steps.length - 1 && (
                          <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-purple-900/50 -bottom-8"></div>
                        )}
                        
                        <div className="flex-shrink-0 w-8 h-8 bg-black border border-purple-500 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm z-10 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                          {idx + 1}
                        </div>
                        <div className="w-full pt-1">
                           <div className="text-gray-300 font-medium mb-3 text-sm leading-relaxed font-mono">
                             {step.explanation}
                           </div>
                           <div className="bg-black/60 p-4 border border-purple-500/20 overflow-x-auto hover:border-purple-500/60 transition-colors">
                              <MathRenderer latex={step.result} className="text-lg text-white" />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-blue-950/20 p-5 border border-blue-500/30 text-blue-200 text-sm flex gap-3 items-start font-mono">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                  <div>
                    <strong className="block text-blue-400 mb-1 uppercase text-xs tracking-wider">AI_Summary</strong>
                    {result.explanation}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graph Column (Desktop) */}
      <div className="lg:col-span-4 space-y-6">
         {result && !loading ? (
             <div className="bg-black/80 border border-purple-500 p-5 sticky top-28 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <h3 className="text-white text-xs mb-4 uppercase tracking-wider font-bold flex items-center gap-2 border-b border-purple-800 pb-3 font-mono">
                   <div className="w-2 h-2 bg-cyan-400 animate-pulse"></div>
                   Graph_Visualization
                </h3>
                <GraphPlot data={result.graphPoints} />
             </div>
         ) : (
            <div className="hidden lg:flex flex-col bg-white/5 border border-dashed border-white/20 p-8 items-center justify-center h-64 text-gray-500 sticky top-28 backdrop-blur-sm">
              <div className="w-16 h-16 border-2 border-gray-700 flex items-center justify-center mb-4 text-gray-700">
                 <Calculator className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-gray-500 font-mono">WAITING_FOR_DATA</p>
            </div>
         )}
      </div>

    </div>
  );

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden relative">
      
      {/* Background Decorations */}
      {renderBackgroundDecorations()}
      {renderHUD()}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 p-4 md:px-8 md:py-4 flex justify-between items-center z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <button 
          onClick={() => {
              handleAction(() => {
                setCurrentMode('INTRO'); 
                setViewState('INTRO');
              });
          }}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 bg-black flex items-center justify-center border border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] group-hover:bg-cyan-900/50 transition-all">
            <Home className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-left font-mono">
            <div className="text-white font-bold text-lg tracking-widest leading-none group-hover:text-cyan-300 transition-colors">CYBER<span className="text-purple-400">CALC</span></div>
          </div>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r border-gray-700 pr-6 mr-2">
             {/* UPI & FPMIPA LOGOS (Using placeholders or SVG equivalents if external images fail, but structure is here) */}
             <img src="https://upload.wikimedia.org/wikipedia/id/thumb/0/09/Logo_Almamater_UPI.svg/1024px-Logo_Almamater_UPI.svg.png" alt="UPI Logo" className="h-8 md:h-10 w-auto filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
             <div className="text-[10px] md:text-xs font-bold leading-tight text-right hidden sm:block font-mono">
                <div className="text-cyan-400">DEPT. PENDIDIKAN ILMU KOMPUTER</div>
                <div className="text-white">FPMIPA UPI</div>
             </div>
          </div>

          <div className="hidden md:block text-right">
             <div className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase">System Status</div>
             <div className="text-xs text-green-400 font-mono flex items-center justify-end gap-1">
               ONLINE <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             </div>
          </div>
        </div>
      </header>
      
      {viewState === 'INTRO' && renderIntro()}
      {viewState === 'MENU_SELECTION' && renderMenuSelection()}
      {viewState === 'FORMULA' && renderFormulaPreview()}
      {viewState === 'CALCULATOR' && renderCalculator()}

      {/* Mobile Menu */}
      {currentMode !== 'INTRO' && (
        <button 
          onClick={() => {
              playSound('click');
              setMobileMenuOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 lg:hidden bg-purple-600 text-white p-4 rounded-none border border-white/20 shadow-[4px_4px_0_#000]"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

       {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl lg:hidden flex flex-col p-6 animate-fade-in font-mono">
          <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-widest"><Menu /> SYSTEM MENU</h2>
            <button onClick={() => {
                playSound('click');
                setMobileMenuOpen(false);
            }} className="text-red-400 hover:text-white">
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 space-y-6">
             <button 
                onClick={() => {
                    handleAction(() => {
                        setCurrentMode('INTRO'); 
                        setViewState('INTRO'); 
                        setMobileMenuOpen(false);
                    });
                }}
                className="w-full text-left text-xl font-bold text-white hover:text-cyan-400 flex items-center gap-3"
              >
                <Home className="w-5 h-5 text-purple-500" /> HOME_BASE
              </button>
              <button 
                onClick={() => {
                    enterMainMenu();
                    setMobileMenuOpen(false);
                }}
                className="w-full text-left text-xl font-bold text-white hover:text-cyan-400 flex items-center gap-3"
              >
                <Menu className="w-5 h-5 text-pink-500" /> MENU SELECTION
              </button>
             {MENU_ITEMS.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="text-cyan-400 font-black uppercase tracking-[0.2em] text-xs">{item.label}</div>
                <div className="pl-4 space-y-2 border-l border-purple-900 ml-1">
                  {item.subItems?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleModeSelect(item.id, sub.id)}
                      className={`block w-full text-left py-2 ${subMode === sub.id ? 'text-white font-bold bg-white/10 pl-2' : 'text-gray-500'} transition-all`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-600 text-xs relative z-10 pb-8 font-mono border-t border-white/5 pt-8">
        <p>&copy; {new Date().getFullYear()} CYBERCALC. Pend. Ilmu Komputer Universitas Pendidikan Indonesia.</p>
      </footer>
    </div>
  );
};

export default App;