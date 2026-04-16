// ==============================================
// 🚀 Investment Council SaaS (FINAL - OpenAI + Market Data Integrated)
// ==============================================

import React, { useState } from 'react';
import OpenAI from "openai";
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

// =============================
// 🔐 KEYS (set in Vercel env)
// =============================
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,
  dangerouslyAllowBrowser: true // ⚠️ move to backend later
});

const MARKET_KEY = import.meta.env.VITE_MARKET_KEY;

// =============================
// 🧠 MASTER PROMPT
// =============================
const MASTER_PROMPT = `You are an elite investment council.
Each investor must think independently.
Be decisive. Disagree. No vague answers.
Return STRICT JSON only.`;

// =============================
// 📡 MARKET DATA
// =============================
const fetchStock = async (symbol) => {
  const res = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${MARKET_KEY}`);
  return await res.json();
};

export default function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [debate, setDebate] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // =============================
  // 🧠 AI ANALYSIS (OpenAI)
  // =============================
  const analyzeWithAI = async (stock, symbol) => {
    const prompt = `
${MASTER_PROMPT}

REAL DATA:
Symbol: ${symbol}
Price: ${stock.price}
PE: ${stock.pe}
Volume: ${stock.volume}

Return JSON:
{
  buffett:{thesis:"",risk:"",verdict:""},
  munger:{thesis:"",risk:"",verdict:""},
  lynch:{thesis:"",risk:"",verdict:""},
  dalio:{thesis:"",risk:"",verdict:""},
  soros:{thesis:"",risk:"",verdict:""},
  wood:{thesis:"",risk:"",verdict:""},
  summary:{final:"BUY/PASS/WATCH"}
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are hedge fund level investors." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  };

  // =============================
  // 🥊 DEBATE MODE
  // =============================
  const runDebate = async (data) => {
    const prompt = `
Investors now debate each other.
Who is wrong? Who is right?
Be sharp.

Data:
${JSON.stringify(data)}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    setDebate(response.choices[0].message.content);
  };

  // =============================
  // 💰 PORTFOLIO ENGINE
  // =============================
  const handlePortfolio = (data, stock) => {
    const votes = Object.values(data).filter(v => v?.verdict)
      .reduce((a, r) => {
        a[r.verdict] = (a[r.verdict] || 0) + 1;
        return a;
      }, {});

    if (votes.OPPORTUNITY >= 4) {
      const trade = {
        symbol: input,
        price: parseFloat(stock.price),
        date: new Date().toLocaleDateString()
      };

      setPortfolio(prev => [...prev, trade]);
      setChartData(prev => [...prev, { name: trade.symbol, value: trade.price }]);
    }
  };

  // =============================
  // 🚀 MAIN ANALYZE
  // =============================
  const analyze = async () => {
    if (!input) return;
    setLoading(true);

    try {
      const stock = await fetchStock(input);
      const aiText = await analyzeWithAI(stock, input);

      const json = JSON.parse(aiText.match(/\{[\s\S]*\}/)[0]);

      setResults(json);
      setHistory(prev => [...prev, { symbol: input, decision: json.summary?.final }]);

      runDebate(json);
      handlePortfolio(json, stock);

    } catch (e) {
      alert("Error in AI or Market API");
    }

    setLoading(false);
  };

  // =============================
  // 🎨 UI
  // =============================
  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold">🏛️ Investment Council AI PRO</h1>

      <div className="flex gap-2 my-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border p-3 flex-1"
          placeholder="TSLA / AAPL / BTC ..."
        />
        <button onClick={analyze} className="bg-black text-white px-6">
          {loading ? "..." : "Analyze"}
        </button>
      </div>

      {/* RESULTS */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(results).filter(k => k !== 'summary').map(k => (
            <div key={k} className="border p-4 rounded">
              <h3 className="font-bold">{k}</h3>
              <p>{results[k].thesis}</p>
              <p className="text-red-500">{results[k].risk}</p>
              <span>{results[k].verdict}</span>
            </div>
          ))}
        </div>
      )}

      {/* DEBATE */}
      {debate && (
        <div className="mt-6 bg-black text-white p-4 rounded">
          <h2>🥊 Debate Mode</h2>
          <p>{debate}</p>
        </div>
      )}

      {/* PORTFOLIO */}
      <div className="mt-6">
        <h2 className="font-bold">💰 Portfolio</h2>
        {portfolio.map((p, i) => (
          <div key={i}>{p.symbol} @ {p.price}</div>
        ))}
      </div>

      {/* CHART */}
      <LineChart width={400} height={200} data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" />
      </LineChart>

      {/* HISTORY */}
      <div className="mt-6">
        <h2>📊 History</h2>
        {history.map((h, i) => (
          <div key={i}>{h.symbol} → {h.decision}</div>
        ))}
      </div>
    </div>
  );
}
