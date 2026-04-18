import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// =============================
// 🔐 SECURE CONFIG (استدعاء المتغيرات من Vercel)
// =============================
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MARKET_KEY = import.meta.env.VITE_MARKET_KEY;

const MASTER_PROMPT = `You are an elite investment council. 
Each investor (Buffett, Munger, Lynch, Dalio, Soros, Wood) must think independently. 
Be decisive. Return STRICT JSON only.`;

export default function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [debate, setDebate] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // =============================
  // 🧠 AI CALL (جيميناي)
  // =============================
  const callGemini = async (prompt) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    if (!data.candidates) throw new Error("API Key Issue or Limit Reached");
    return data.candidates[0].content.parts[0].text;
  };

  const analyze = async () => {
    if (!input) return;
    setLoading(true);
    try {
      // 1. جلب بيانات السوق (Twelve Data)
      const marketRes = await fetch(`https://api.twelvedata.com/quote?symbol=${input}&apikey=${MARKET_KEY}`);
      const stock = await marketRes.json();
      
      if (!stock.price) throw new Error("رمز السهم غير صحيح أو المفتاح معطل");

      // 2. موجه التحليل (Analysis Prompt)
      const analysisPrompt = `${MASTER_PROMPT} 
      Analyze ${input}. Current Price: ${stock.price}. 
      Return JSON only: {
        "buffett":{"thesis":"","verdict":""},
        "munger":{"thesis":"","verdict":""},
        "lynch":{"thesis":"","verdict":""},
        "dalio":{"thesis":"","verdict":""},
        "soros":{"thesis":"","verdict":""},
        "wood":{"thesis":"","verdict":""},
        "summary":{"final":"BUY/PASS/WATCH"}
      }`;
      
      const aiText = await callGemini(analysisPrompt);
      const cleanJson = aiText.replace(/```json|```/g, "").trim();
      const json = JSON.parse(cleanJson);

      setResults(json);
      
      // 3. نمط النقاش بالعربية (Debate Mode)
      const debatePrompt = `بناءً على هذا التحليل: ${cleanJson}، اجعل هؤلاء المستثمرين يتجادلون فيما بينهم باللغة العربية حول سهم ${input}. من منهم المخطئ؟ اجعل النقاش حاداً وذكياً بأسلوب @PowerBalance88.`;
      const debateText = await callGemini(debatePrompt);
      setDebate(debateText);

      // 4. تحديث المحفظة والتشارت
      if (json.summary?.final === "BUY") {
        setPortfolio(prev => [...prev, { symbol: input, price: stock.price }]);
        setChartData(prev => [...prev, { name: input, value: parseFloat(stock.price) }]);
      }

    } catch (e) {
      alert(`تنبيه أبا شهد: ${e.message}. تأكد من تحديث المفاتيح في Vercel وعمل Redeploy.`);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto font-sans bg-gray-50 min-h-screen" dir="rtl">
      <header className="text-center py-6">
        <h1 className="text-4xl font-black text-slate-900 mb-2">🏛️ مجلس الاستثمار الذكي</h1>
        <p className="text-lg text-slate-600">منهجية التفكير النظمي | المستشار Abdulbasett</p>
      </header>

      {/* مدخلات البحث */}
      <div className="flex gap-2 mb-8 shadow-sm">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value.toUpperCase())}
          className="border-2 border-slate-300 p-4 flex-1 rounded-lg text-left text-xl focus:border-blue-500 outline-none" 
          placeholder="أدخل رمز السهم (مثلاً NVDA)"
        />
        <button onClick={analyze} disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white px-10 rounded-lg font-bold transition-all disabled:opacity-50">
          {loading ? "جاري الاستدعاء..." : "استدعاء المجلس"}
        </button>
      </div>

      {/* نتائج تحليل المستثمرين */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(results).filter(k => k !== 'summary').map(name => (
            <div key={name} className="bg-white border-b-4 border-blue-600 p-5 shadow-md rounded-xl hover:shadow-lg transition-shadow text-right">
              <h3 className="font-bold text-2xl mb-3 capitalize text-blue-900 border-b pb-2">{name}</h3>
              <p className="text-slate-700 leading-relaxed text-sm mb-4">{results[name]?.thesis}</p>
              <div className="font-black text-lg text-blue-700 bg-blue-50 p-2 rounded text-center">{results[name]?.verdict}</div>
            </div>
          ))}
        </div>
      )}

      {/* ساحة النقاش */}
      {debate && (
        <div className="mt-10 p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-xl border-r-8 border-red-500 text-right">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🥊 ساحة النقاش (Debate Mode)</h2>
          <p className="whitespace-pre-wrap leading-relaxed opacity-90">{debate}</p>
        </div>
      )}

      {/* المحفظة والرسوم البيانية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 text-right">
          <h2 className="font-bold text-2xl mb-6 text-emerald-700 border-b pb-2">💰 محفظة PowerBalance88</h2>
          {portfolio.length === 0 ? <p className="text-slate-400">في انتظار أول فرصة شراء...</p> : 
            portfolio.map((p, i) => (
              <div key={i} className="flex justify-between items-center border-b py-3 font-mono text-lg">
                <span className="font-bold text-slate-800">{p.symbol}</span>
                <span className="text-emerald-600 font-bold">${p.price}</span>
              </div>
            ))
          }
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center">
          <h2 className="font-bold text-2xl mb-6 text-slate-800">📈 اتجاهات المحفظة (التشارت)</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


