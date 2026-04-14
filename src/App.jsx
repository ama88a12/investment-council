import React, { useState } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const analyzeInvestment = async () => {
    if (!input) return alert("يرجى كتابة اسم الشركة أو الفرصة أولاً!");
    setLoading(true);
    setResults(null);
    
    const prompt = `أنت الآن "مجلس الاستثمار السري". قم بتحليل الفرصة التالية: (${input}). 
    يجب أن ترد بصيغة JSON حصراً وبدون أي مقدمات أو خاتمة خارج الـ JSON.
    الهيكل المطلوب للـ JSON:
    {
      "buffett": {"name": "وارن بافيت", "thesis": "...", "variable": "...", "risk": "...", "verdict": "..."},
      "wood": {"name": "كاثي وود", "thesis": "...", "variable": "...", "risk": "...", "verdict": "..."},
      "munger": {"name": "تشارلي مونغر", "thesis": "...", "variable": "...", "risk": "...", "verdict": "..."},
      "soros": {"name": "جورج سوروس", "thesis": "...", "variable": "...", "risk": "...", "verdict": "..."},
      "lynch": {"name": "بيتر لينش", "thesis": "...", "variable": "...", "risk": "...", "verdict": "..."},
      "dalio": {"name": "راي داليو", "thesis": "...", "variable": "...", "risk": "...", "verdict": "..."},
      "summary": {"decision_logic": "...", "final_verdict": "..."}
    }
    اجعل اللغة عربية احترافية بأسلوب @PowerBalance88 وتفكير نظمي عالي المستوى.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]) {
         throw new Error("لا يوجد رد من النموذج - تأكد من صلاحية المفتاح");
      }

      let textResponse = data.candidates[0].content.parts[0].text;
      
      // استخراج الـ JSON فقط في حال وجود نص زائد
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResults(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("تنسيق البيانات غير صحيح");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("عذراً أبا شهد، حدث خطأ. تأكد من إعدادات Vercel أو جرب مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-600">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">🏛️ مجلس الاستثمار السري</h1>
          <p className="text-slate-500 mb-6">بمنهجية التفكير النظمي الخاص بحساب @PowerBalance88</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="اكتب اسم الشركة (مثلاً: أرامكو، تسلا، بتكوين)..."
            />
            <button 
              onClick={analyzeInvestment}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold transition-all disabled:bg-slate-400"
            >
              {loading ? 'جاري الاستشارة...' : 'استدعاء المجلس'}
            </button>
          </div>
        </div>

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(results).filter(k => k !== 'summary').map((key, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-5 border border-slate-200 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-black text-blue-800 border-b pb-2 mb-3">{results[key].name}</h2>
                <div className="space-y-3 text-sm text-slate-700">
                  <p><strong>الأطروحة:</strong> {results[key].thesis}</p>
                  <p><strong>المتغير الحاسم:</strong> {results[key].variable}</p>
                  <p className="text-red-600"><strong>الخطر:</strong> {results[key].risk}</p>
                  <div className="pt-3 flex justify-between items-center border-t">
                    <span className="font-bold">القرار:</span>
                    <span className={`px-3 py-1 rounded text-xs font-bold text-white ${results[key].verdict.includes('AVOID') ? 'bg-red-600' : 'bg-green-700'}`}>
                      {results[key].verdict}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results?.summary && (
          <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 border-b border-slate-700 pb-2">⚖️ الملخص النظمي النهائي</h2>
            <p className="text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">{results.summary.decision_logic}</p>
            <div className="text-center bg-blue-900/30 p-6 rounded-lg border border-blue-500/50">
              <span className="text-blue-400 text-sm block mb-1">توصية المجلس الجماعية</span>
              <span className="text-4xl font-black uppercase tracking-widest text-yellow-500">{results.summary.final_verdict}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
