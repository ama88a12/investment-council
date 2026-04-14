import React, { useState } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const analyzeInvestment = async () => {
    if (!input) return alert("يرجى كتابة اسم الشركة أو الفرصة أولاً!");
    setLoading(true);
    
    const prompt = `أنت الآن "مجلس الاستثمار السري". قم بتحليل الفرصة التالية: (${input}). 
    يجب أن ترد بصيغة JSON حصراً. التزم بتقديم تحليل من وجهة نظر 6 شخصيات: (وارن بافيت، كاثي وود، تشارلي مونغر، جورج سوروس، بيتر لينش، راي داليو).
    لكل شخصية اذكر: الأطروحة، المتغير الحاسم، الخطر، والقرار النهائي (OPPORTUNITY, AVOID, WAIT).
    في النهاية قدم ملخصاً نظمياً يتضمن "القرار النهائي للمجلس".
    اجعل اللغة عربية احترافية بأسلوب @PowerBalance88.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // تنظيف النص وتحويله لـ JSON
      const cleanJson = textResponse.replace(/```json|```/g, '');
      setResults(JSON.parse(cleanJson));
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ في الاتصال بجيميناي. تأكد من صحة الـ API Key");
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
              <div key={index} className="bg-white rounded-xl shadow p-5 border border-slate-200">
                <h2 className="text-xl font-black text-blue-800 border-b pb-2 mb-3">{results[key].name || key}</h2>
                <div className="space-y-3 text-sm text-slate-700">
                  <p><strong>الأطروحة:</strong> {results[key].thesis}</p>
                  <p><strong>المتغير الحاسم:</strong> {results[key].variable}</p>
                  <p className="text-red-600"><strong>الخطر:</strong> {results[key].risk}</p>
                  <div className="pt-3 flex justify-between items-center border-t">
                    <span className="font-bold">القرار:</span>
                    <span className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-bold">{results[key].verdict}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results?.summary && (
          <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 border-b border-slate-700 pb-2">⚖️ الملخص النظمي النهائي</h2>
            <p className="text-slate-300 leading-relaxed mb-6">{results.summary.decision_logic || results.summary.description}</p>
            <div className="text-center bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
              <span className="text-blue-400 text-sm block mb-1">توصية المجلس</span>
              <span className="text-3xl font-black uppercase tracking-widest">{results.summary.final_verdict}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
