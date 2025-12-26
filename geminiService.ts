import { GoogleGenAI, Type } from "@google/genai";
import { SubMode, SolveResponse, IntegralBounds } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export const solveMathProblem = async (
  expression: string, 
  mode: SubMode,
  bounds?: IntegralBounds
): Promise<SolveResponse> => {
  
  const model = "gemini-2.5-flash";

  let taskDescription = "";
  // Keeping task description generic as the prompt instruction will override with specific persona context
  switch (mode) {
    case 'SYS_ALGEBRA': taskDescription = "Sederhanakan atau selesaikan ekspresi aljabar."; break;
    case 'SYS_TRIG': taskDescription = "Sederhanakan atau selesaikan ekspresi trigonometri."; break;
    case 'LIM_ALGEBRA': taskDescription = "Cari nilai limit fungsi aljabar."; break;
    case 'LIM_FINITE': taskDescription = "Cari nilai limit mendekati nilai hingga."; break;
    case 'LIM_INFINITE': taskDescription = "Cari nilai limit mendekati tak hingga."; break;
    case 'LIM_TRIG': taskDescription = "Cari nilai limit fungsi trigonometri."; break;
    case 'DER_ALGEBRA': taskDescription = "Cari turunan dari fungsi aljabar."; break;
    case 'DER_TRIG': taskDescription = "Cari turunan dari fungsi trigonometri."; break;
    case 'INT_AREA': taskDescription = "Hitung integral tentu/tak tentu (Luas Daerah)."; break;
    case 'INT_VOLUME': taskDescription = "Hitung integral untuk Volume Benda Putar (asumsikan putaran sumbu-x kecuali spesifik)."; break;
    default: taskDescription = "Selesaikan soal matematika ini.";
  }

  let promptExpression = expression;
  let boundInstruction = "";
  
  // Add bounds to the prompt if they exist and mode is Integral
  if (mode.startsWith('INT_') && bounds && (bounds.lower || bounds.upper)) {
    promptExpression = `Integral dari ${expression}`;
    if (bounds.lower) promptExpression += ` dengan batas bawah ${bounds.lower}`;
    if (bounds.upper) promptExpression += ` dan batas atas ${bounds.upper}`;
    boundInstruction = "Ini adalah INTEGRAL TENTU. Pastikan menghitung nilai akhirnya berdasarkan batas yang diberikan.";
  }

  const prompt = `
    Anda adalah dosen/tutor Kalkulus cerdas di Departemen Pendidikan Ilmu Komputer FPMIPA UPI.
    
    TUGAS: ${taskDescription}
    SOAL INPUT: "${promptExpression}"

    INSTRUKSI PENYELESAIAN:
    1. **Bahasa**: Gunakan Bahasa Indonesia yang baku, jelas, dan edukatif untuk field 'explanation'.
    ${boundInstruction}
    
    2. **Logika Penyelesaian (PENTING)**:
       - **LIMIT**:
         a. Langkah pertama HARUS substitusi langsung.
         b. Jika hasil substitusi adalah **0/0** atau **∞/∞** (Bentuk Tak Tentu):
            - Jelaskan bahwa hasilnya adalah "Bentuk Tak Tentu".
            - GUNAKAN METODE LAIN: Faktorisasi, Kali Sekawan (Rasionalkan Akar), atau Dalil L'Hopital (Turunan).
            - Pilih metode yang paling standar diajarkan di perkuliahan dasar.
            - Tampilkan proses penyederhanaannya.
            - Lakukan substitusi ulang sampai mendapatkan hasil valid (bukan 0/0).
       - **INTEGRAL**: 
         - Jika ada batas, hitung antiturunan F(x) terlebih dahulu, lalu hitung F(b) - F(a).
         - Tampilkan teknik integrasi (substitusi, parsial) jika diperlukan.
       - **TURUNAN**: Sebutkan aturan yang digunakan (Aturan Rantai, Perkalian, Pembagian).

    3. **Format Langkah (Steps)**:
       - Pecah solusi menjadi tahapan yang sangat rinci.
       - Untuk SETIAP langkah, kembalikan objek dengan:
         - 'explanation': Penjelasan langkah dalam Bahasa Indonesia. Contoh: "Karena hasilnya 0/0, kita faktorkan pembilang", "Hitung nilai batas atas dikurangi batas bawah".
         - 'result': Hasil matematis dari langkah tersebut dalam format LaTeX yang valid.

    4. **Format LaTeX**:
       - Field 'result' dan 'latexResult' HARUS berisi kode LaTeX murni tanpa markdown code block (jangan gunakan \`\`\`).
       - Jangan gunakan tanda $ di awal/akhir untuk field 'result' dan 'latexResult', cukup kode LaTeX-nya saja.
       - Pastikan simbol matematika (integral \int, limit \lim, pecahan \frac, akar \sqrt) digunakan dengan benar.

    5. **Visualisasi Grafik (AKURAT & DETAIL)**:
       - Generate **150 titik koordinat** (x, y) untuk fungsi tersebut agar grafik terlihat mulus dan detail.
       - Range x default: -10 sampai 10. Namun, jika ada domain khusus (misal ln(x), sqrt(x)), sesuaikan range agar grafik valid.
       - Pastikan mencakup titik-titik krusial seperti perpotongan sumbu-x (akar), sumbu-y, dan titik stasioner.

    Kembalikan respon HANYA dalam format JSON yang valid sesuai schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latexResult: { type: Type.STRING },
            steps: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  explanation: { type: Type.STRING },
                  result: { type: Type.STRING }
                },
                required: ["explanation", "result"]
              }
            },
            explanation: { type: Type.STRING, description: "Ringkasan metode yang digunakan dalam Bahasa Indonesia." },
            graphPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      let cleanText = response.text;
      // Aggressively clean Markdown code blocks to ensure JSON.parse works
      cleanText = cleanText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '');
      return JSON.parse(cleanText) as SolveResponse;
    }
    
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      latexResult: "\\text{Error}",
      steps: [{ explanation: "Terjadi kesalahan saat memproses data. Silakan coba lagi.", result: "\\text{Gagal memuat}" }],
      graphPoints: [],
      explanation: "Layanan sedang sibuk atau input tidak valid."
    };
  }
};