import React, { useState } from 'react';

const InvestmentCouncil = () => {
  const [idea, setIdea] = useState('شراء أسهم في شركة ناشئة تعمل في مجال الذكاء الاصطناعي لتوليد الفيديو...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true);

  // بيانات افتراضية للعرض (Mock Data) 
  const councilResults = {
    investors: [
      {
        id: 'buffett', name: 'وارن بافيت', title: 'حكيم القيمة', color: 'bg-amber-50 border-amber-200', text: 'text-amber-900',
        opening: 'إذا لم أتمكن من فهم كيف ستجني الشركة المال بعد 10 سنوات، فلن أستثمر فيها اليوم.',
        thesis: 'تكنولوجيا معقدة جداً وتتغير بسرعة. لا يوجد خندق اقتصادي واضح يحميها من المنافسين الكبار.',
        variable: 'القدرة على تحقيق تدفقات نقدية حرة ومستدامة بعيداً عن حرق رأس المال.',
        risk: 'تقادم التكنولوجيا السريع وظهور منافس مجاني أو مفتوح المصدر.',
        verdict: 'AVOID'
      },
      {
        id: 'wood', name: 'كاثي وود', title: 'ملكة الابتكار', color: 'bg-pink-50 border-pink-200', text: 'text-pink-900',
        opening: 'نحن نقف على حافة ثورة ستعيد تشكيل صناعة الترفيه والإنتاج بالكامل.',
        thesis: 'هذا الابتكار المدمر سيلغي تكاليف الإنتاج التقليدية، والسوق المستهدف هائل ويتوسع.',
        variable: 'سرعة تبني المبدعين لهذه الأداة وانخفاض تكلفة الحوسبة.',
        risk: 'التشريعات الحكومية وقوانين حقوق الملكية الفكرية.',
        verdict: 'OPPORTUNITY'
      },
      {
        id: 'munger', name: 'تشارلي مونغر', title: 'المهندس العقلاني', color: 'bg-slate-50 border-slate-200', text: 'text-slate-900',
        opening: 'الاستثمار في شيء لا تفهمه فقط لأن الآخرين يتحمسون له هو وصفة للغباء المالي.',
        thesis: 'هناك حالة من الدليل الاجتماعي تدفع التقييمات للجنون. الحوافز الحالية تشجع على تضخيم الآمال.',
        variable: 'القدرة التسعيرية الحقيقية عندما يزول الضجيج الإعلامي.',
        risk: 'المنافسة الشرسة التي تدمر هوامش الربح للجميع.',
        verdict: 'AVOID'
      },
      {
        id: 'soros', name: 'جورج سوروس', title: 'المضارب الانعكاسي', color: 'bg-red-50 border-red-200', text: 'text-red-900',
        opening: 'الأسواق لا تسير بناءً على الحقائق، بل بناءً على تصورات المستثمرين لتلك الحقائق.',
        thesis: 'هناك فقاعة واضحة مدفوعة بسردية الذكاء الاصطناعي. يمكننا الركوب مع هذا الاتجاه طالما السيولة تتدفق.',
        variable: 'حجم تدفق الأموال الغبية إلى هذا القطاع لتغذية السردية.',
        risk: 'انفجار الفقاعة قبل الخروج، أو تغيير مفاجئ في السردية العامة.',
        verdict: 'OPPORTUNITY'
      },
      {
        id: 'lynch', name: 'بيتر لينش', title: 'أسطورة النمو', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900',
        opening: 'القصة مثيرة جداً، ولكن هل هي بسيطة بما يكفي ليشتريها الشخص العادي؟',
        thesis: 'نحن أمام شركة سريعة النمو ولكنها في قطاع ساخن جداً ومزدحم، التقييم قد يكون مبالغاً فيه.',
        variable: 'استمرار نمو الإيرادات بنسبة لا تقل عن 40٪ سنوياً لتبرير السعر.',
        risk: 'أن تتحول التكنولوجيا إلى سلعة عادية لا تتميز بها شركة عن أخرى.',
        verdict: 'WAIT'
      },
      {
        id: 'dalio', name: 'راي داليو', title: 'مفكر النظم الكلية', color: 'bg-blue-50 border-blue-200', text: 'text-blue-900',
        opening: 'يجب أن ننظر إلى هذا الأصل ضمن الآلة الاقتصادية الأكبر ودورة الديون الحالية.',
        thesis: 'السيولة تتقلص والبيئة الحالية للفائدة المرتفعة تضغط على الشركات التي لا تحقق أرباحاً حالية.',
        variable: 'اتجاه معدلات الفائدة وتوفر رأس المال الاستثماري الرخيص.',
        risk: 'ركود اقتصادي كلي يجفف منابع التمويل لهذه الشركات الناشئة.',
        verdict: 'WAIT'
      }
    ],
    summary: {
      intersections: 'هناك صدام بين النظرة المستقبلية (كاثي وود/سوروس) والنظرة المتحفظة للقيمة (بافيت/مونغر). التكنولوجيا حقيقية لكن التقييمات تعكس آمالاً مفرطة.',
      strongest: 'حجة مونغر وداليو هي الأقوى حالياً؛ البيئة الاقتصادية الكلية لا تدعم المخاطرة في شركات بدون خندق تنافسي واضح.',
      decision: 'WATCH'
    }
  };

  const getVerdictStyle = (verdict) => {
    const styles = {
      'OPPORTUNITY': 'bg-green-600 text-white',
      'AVOID': 'bg-red-600 text-white',
      'WAIT': 'bg-yellow-500 text-white',
      'WATCH': 'bg-yellow-600 text-white',
      'BUY': 'bg-emerald-600 text-white',
      'PASS': 'bg-rose-600 text-white'
    };
    return styles[verdict] || 'bg-gray-600 text-white';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">🏛️ مجلس الاستثمار السري</h1>
          <textarea 
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full h-24 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="أدخل الفرصة الاستثمارية هنا..."
          />
          <div className="mt-4 flex justify-end">
            <button className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700">
              بدء جلسة المجلس
            </button>
          </div>
        </div>

        {/* Investors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {councilResults.investors.map((inv) => (
            <div key={inv.id} className={`rounded-xl shadow-sm border p-5 ${inv.color}`}>
              <div className="border-b pb-3 mb-3 border-black/10">
                <h2 className={`text-xl font-bold ${inv.text}`}>{inv.name}</h2>
                <span className="text-sm font-medium opacity-80">{inv.title}</span>
              </div>
              <div className="space-y-3 text-sm text-slate-800">
                <p className="italic font-semibold opacity-90">"{inv.opening}"</p>
                <p><strong>الأطروحة:</strong> {inv.thesis}</p>
                <p><strong>المتغير الحاسم:</strong> {inv.variable}</p>
                <p className="text-red-700"><strong>الخطر:</strong> {inv.risk}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-black/10 flex justify-between items-center">
                <span className="font-bold">القرار:</span>
                <span className={`px-3 py-1 rounded font-bold text-xs ${getVerdictStyle(inv.verdict)}`}>
                  {inv.verdict}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Final Summary Section */}
        <div className="bg-slate-900 text-slate-100 rounded-xl shadow-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">⚖️ الملخص النظمي</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p><span className="text-blue-400 font-bold">التقاطعات:</span> {councilResults.summary.intersections}</p>
              <p><span className="text-emerald-400 font-bold">الحجة الأقوى:</span> {councilResults.summary.strongest}</p>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-800 rounded-lg p-4">
              <span className="text-slate-400 mb-2">القرار النهائي</span>
              <span className={`text-3xl px-8 py-3 rounded-xl font-black ${getVerdictStyle(councilResults.summary.decision)}`}>
                {councilResults.summary.decision}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCouncil;
