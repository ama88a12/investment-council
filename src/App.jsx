import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

// =============================
// 🔐 KEYS & CONFIG
// =============================
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MARKET_KEY = import.meta.env.VITE_MARKET_KEY;

const MASTER_PROMPT = `You are an elite investment council. Disagree. Be sharp. Return STRICT JSON only.`;

export default function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [debate, setDebate] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // =============================
  // 🧠 AI CALL (Direct Fetch - No Library Needed)
  // =============================
  const callGemini = async (prompt) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const analyze = async () => {
    if (!input) return;
    setLoading(true);
    try {
      // 1. Fetch Market Data
      const marketRes = await fetch(`https://api.twelvedata.com/quote?symbol=${input}&apikey=${MARKET_KEY}`);
      const stock = await marketRes.json();

      // 2. Analysis Prompt
      const analysisPrompt = `${MASTER_PROMPT} Analyze ${input} (Price: ${stock.price}). Return JSON: { "buffett":{"thesis":"","verdict":""}, "munger":{"thesis":"","verdict":""}, "lynch":{"thesis":"","verdict":""}, "summary":{"final":""} }`;
      
      const aiText = await callGemini(analysisPrompt);
      const cleanJson = aiText.replace(/```json|```/g, "").trim();
      const json = JSON.parse(cleanJson);

      setResults(json);
      setHistory(prev => [...prev, { symbol: input, decision: json.summary?.final }]);
      
      // 3. Trade Action
      if (json.summary?.final === "BUY") {
        setPortfolio(prev => [...prev, { symbol: input, price: stock.price }]);
        setChartData(prev => [...prev, { name: input, value: parseFloat(stock.price) }]);
      }

    } catch (e) {
      alert("تأكد من صحة المفاتيح في Vercel");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans" dir="rtl">
      <h1 className="text-3xl font-bold text-center mb-2">🏛️ مجلس الاستشارين الذكي</h1>
      <p className="text-center text-gray-500 mb-6">بمنهجية التفكير النظمي - للباحث Abdulbasett</p>

      <div className="flex gap-2 mb-8">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value.toUpperCase())}
          className="border-2 border-black p-3 flex-1 rounded text-left" 
          placeholder="أدخل رمز الشركة (مثل AAPL)"
        />
        <button onClick={analyze} className="bg-blue-600 text-white px-8 rounded font-bold">
          {loading ? "جاري الاستدعاء..." : "استدعاء المجلس"}
        </button>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['buffett', 'munger', 'lynch'].map(name => (
            <div key={name} className="border-t-4 border-blue-500 p-4 bg-white shadow-lg rounded">
              <h3 className="font-bold text-xl mb-2 capitalize">{name}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{results[name]?.thesis}</p>
              <div className="mt-4 font-black text-blue-800">{results[name]?.verdict}</div>
            </div>
          ))}
        </div>
      )}

      {portfolio.length > 0 && (
        <div className="mt-10 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-4">💰 محفظة Abdulbasett المقترحة</h2>
          {portfolio.map((p, i) => (
            <div key={i} className="flex justify-between border-b py-2 font-mono">
              <span>{p.symbol}</span>
              <span>${p.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
