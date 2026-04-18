import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// =============================
// 🔐 CONFIG & KEYS (Vercel Env)
// =============================
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MARKET_KEY = import.meta.env.VITE_MARKET_KEY; 
const NEWS_KEY = import.meta.env.VITE_NEWS_KEY;     

export default function StrategicInvestorTerminal() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    results: null,
    techScore: null,
    historyComparison: null
  });

  // 📈 دالة حساب المؤشرات الفنية (RSI & MA)
  const calculateTechnicals = (prices) => {
    if (!prices || prices.length < 14) return { rsi: "N/A", trend: "Unknown", ma50: "N/A" };
    
    let gains = 0, losses = 0;
    for (let i = 1; i <= 14; i++) {
      const diff = prices[prices.length - i] - prices[prices.length - i - 1];
      if (diff >= 0) gains += diff; else losses -= diff;
    }
    const rs = gains / (losses || 1);
    const rsi = (100 - (100 / (1 + rs))).toFixed(2);
    const ma = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    
    return { rsi, ma50: ma, trend: prices[prices.length - 1] > ma ? 'Bullish' : 'Bearish' };
  };

  const analyzeStrategy = async () => {
    if (!input) return;
    setLoading(true);
    try {
      // 1. جلب البيانات من 3 مصادر مختلفة
      const [historyRes, newsRes, quoteRes] = await Promise.all([
        fetch(`https://api.twelvedata.com/time_series?symbol=${input}&interval=1month&outputsize=48&apikey=${MARKET_KEY}`),
        fetch(`https://newsapi.org/v2/everything?q=${input}&pageSize=3&apiKey=${NEWS_KEY}`),
        fetch(`https://api.twelvedata.com/quote?symbol=${input}&apikey=${MARKET_KEY}`)
      ]);

      const historyData = await historyRes.json();
      const newsData = await newsRes.json();
      const quote = await quoteRes.json();

      // التحقق من صحة الرمز
      if (!quote.price || !historyData.values) {
        throw new Error("لم يتم العثور على بيانات لهذا الرمز. تأكد من صحته.");
      }

      // 2. معالجة البيانات الفنية
      const priceList = historyData.values.map(v => parseFloat(v.close)).reverse();
      const tech = calculateTechnicals(priceList);

      // 3. قراءة السجل السابق لـ Abdulbasett
      const savedLog = localStorage.getItem(`investor_log_${input}`);
      const historyComparison = savedLog ? JSON.parse(savedLog) : null;

      // 4. إعداد الموجه (Prompt) للذكاء الاصطناعي
      const investorPrompt = `
        Strategic Analysis for Abdulbasett.
        Asset: ${input} | Current Price: ${quote.price}
        Technical: RSI ${tech.rsi}, Trend ${tech.trend}.
        Recent News: ${newsData.articles?.map(a => a.title).join(' | ') || 'No specific recent news.'}
        
        Using "Strategic Investor Thinking", provide a JSON response:
        {
          "council": {"buffett": "", "soros": "", "wood": "", "dalio": ""},
          "market_logic": "تحليل موجز لمنطق السوق بالعربية",
          "final_verdict": "BUY/SELL/HOLD",
          "strategic_timing": "لماذا هذا التوقيت بالتحديد؟ بالعربية"
        }`;

      // 5. استدعاء جيميناي مع معالجة الأخطاء
      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: investorPrompt }] }] })
      });

      const aiData = await aiResponse.json();
      if (!aiData.candidates) throw new Error("مشكلة في الوصول لمجلس الحكماء (API Key)");

      const rawText = aiData.candidates[0].content.parts[0].text;
      const cleanJson = rawText.match(/\{[\s\S]*\}/)[0]; // استخراج الـ JSON فقط بحذر
      const jsonResult = JSON.parse(cleanJson);

      // 6. التخزين الذكي
      localStorage.setItem(`investor_log_${input}`, JSON.stringify({ 
        date: new Date().toISOString(), 
        verdict: jsonResult.final_verdict,
        price: quote.price 
      }));

      setData({
        results: jsonResult,
        techScore: tech,
        historyComparison: historyComparison
      });

    } catch (e) {
      console.error("Error Detail:", e);
      alert(`تنبيه للمستشار Abdulbasett: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm">
        <div className="text-center md:text-right">
          <h1 className="text-2xl font-black text-blue-700">STRATEGIC INVESTOR TERMINAL</h1>
          <p className="text-slate-500 text-sm">تفكير المستثمر الاستراتيجي | المستشار Abdulbasett</p>
        </div>
        <div className="mt-4 md:mt-0 font-mono text-xs bg-slate-100 px-4 py-2 rounded-full text-slate-500">
          ID: ABDULBASETT_SECURE_AUTH
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex gap-2 mb-10">
          <input 
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            className="flex-1 p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-xl font-bold"
            placeholder="رمز السهم (مثلاً: AAPL)"
          />
          <button 
            onClick={analyzeStrategy} 
            disabled={loading}
            className="bg-slate-900 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "جاري التحليل..." : "تحليل الاستراتيجية"}
          </button>
        </div>

        {data.results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-widest">المؤشر التقني</h3>
                <div className="flex justify-between items-end">
                  <span className="text-5xl font-black">{data.techScore.rsi}</span>
                  <span className={`font-bold ${data.techScore.trend === 'Bullish' ? 'text-emerald-500' : 'text-red-500'}`}>{data.techScore.trend}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">المتوسط المتحرك (MA50): ${data.techScore.ma50}</p>
              </div>

              {data.historyComparison && (
                <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
                  <h3 className="text-blue-200 text-xs font-bold uppercase mb-2">ذاكرة Abdulbasett</h3>
                  <p className="text-sm opacity-90">آخر زيارة لهذا السهم كانت بتوصية:</p>
                  <p className="text-2xl font-black">{data.historyComparison.verdict}</p>
                  <p className="text-xs mt-4 font-mono opacity-60">تاريخ: {new Date(data.historyComparison.date).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-black text-slate-800">التوقيت الاستراتيجي</h2>
                  <span className="bg-slate-900 text-white px-4 py-1 rounded-lg font-bold">{data.results.final_verdict}</span>
                </div>
                <p className="text-lg leading-relaxed text-slate-600 mb-8 pr-4 border-r-4 border-blue-500">{data.results.strategic_timing}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(data.results.council).map(([name, text]) => (
                    <div key={name} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-blue-600 capitalize mb-1">{name}</h4>
                      <p className="text-xs text-slate-500 leading-tight">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl">
                <h3 className="text-blue-400 font-bold mb-2">منطق السوق</h3>
                <p className="text-sm leading-relaxed opacity-80">{data.results.market_logic}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
