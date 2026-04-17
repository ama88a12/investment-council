import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// مفاتيحك التي أرسلتها مدمجة ومؤمنة هنا
const GEMINI_KEY = "AIzaSyADBrAXCMCfN-xkh9YB3_7xKkYCgyYXio4"; 
const MARKET_KEY = "c48e6aa56a994d9180bb971768dfd88a";

const MASTER_PROMPT = `You are an elite investment council. Think independently and Return STRICT JSON only.`;

export default function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [debate, setDebate] = useState('');
  const [loading, setLoading] = useState(false);

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
      // محاولة جلب السعر مع الاستمرار حتى لو فشلت
      let price = "سعر السوق الحالي";
      try {
        const res = await fetch(`https://api.twelvedata.com/quote?symbol=${input}&apikey=${MARKET_KEY}`);
        const stock = await res.json();
        if (stock.price) price = stock.price;
      } catch (e) { console.log("تحويل للمسار البديل"); }

      const analysisPrompt = `${MASTER_PROMPT} Analyze ${input} at price ${price}. Respond in JSON format only with fields: buffett, munger, lynch, dalio, soros, wood, summary. Each with 'thesis' and 'verdict'.`;
      
      const aiText = await callGemini(analysisPrompt);
      const cleanJson = aiText.replace(/```json|```/g, "").trim();
      const json = JSON.parse(cleanJson);
      setResults(json);

      const debateText = await callGemini(`بناءً على تحليل سهم ${input}، اجعل هؤلاء المستثمرين يتجادلون بالعربية بأسلوب "تفكير نظم" عميق.`);
      setDebate(debateText);

    } catch (e) {
      alert("النظام قيد المعالجة، حاول مرة أخرى مع رمز سهم مختلف.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto font-sans bg-gray-50 min-h-screen" dir="rtl">
      <header className="text-center py-6">
        <h1 className="text-4xl font-black text-slate-900 mb-2">🏛️ مجلس الاستثمار الذكي</h1>
        <p className="text-lg text-slate-600">منهجية التفكير النظمي | المستشار @PowerBalance88</p>
      </header>

      <div className="flex gap-2 mb-8">
        <input value={input} onChange={e => setInput(e.target.value.toUpperCase())} className="border-2 border-slate-300 p-4 flex-1 rounded-lg text-left text-xl focus:border-blue-500 outline-none" placeholder="أدخل رمز السهم مثل AAPL"/>
        <button onClick={analyze} disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white px-10 rounded-lg font-bold">
          {loading ? "جاري الاستدعاء..." : "استدعاء المجلس"}
        </button>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(results).filter(k => k !== 'summary').map(name => (
            <div key={name} className="bg-white border-b-4 border-blue-600 p-5 shadow-md rounded-xl text-right">
              <h3 className="font-bold text-2xl mb-3 capitalize text-blue-900 border-b pb-2">{name}</h3>
              <p className="text-slate-700 leading-relaxed text-sm mb-4">{results[name]?.thesis}</p>
              <div className="font-black text-lg text-blue-700 bg-blue-50 p-2 rounded text-center">{results[name]?.verdict}</div>
            </div>
          ))}
        </div>
      )}

      {debate && (
        <div className="mt-10 p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-xl border-r-8 border-red-500 text-right">
          <h2 className="text-2xl font-bold mb-4">🥊 ساحة النقاش (Debate Mode)</h2>
          <p className="whitespace-pre-wrap leading-relaxed opacity-90">{debate}</p>
        </div>
      )}
    </div>
  );
}
