import { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SlideGenerator({ title, onSelectAgent }: { title: string, onSelectAgent?: (agent: any) => void }) {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('Modern');
  const [pages, setPages] = useState(10);
  const [outline, setOutline] = useState(`- Introduction & Market Overview\n- User Persona & Pain Points\n- Value Proposition\n- Solution Architecture\n- Go-to-Market Strategy\n- Timeline & Roadmap\n- Financial Projections\n- Conclusion`);

  if (step === 1) {
    return (
      <div className="max-w-[600px] w-full flex flex-col items-center mt-12 mx-auto">
        <div className="w-full bg-white rounded-2xl shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Configure Slide Deck</h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Theme & Style</label>
              <select 
                value={theme} 
                onChange={e => setTheme(e.target.value)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
              >
                <option>Modern</option>
                <option>Minimal</option>
                <option>Corporate</option>
                <option>Playful</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Estimated Pages</label>
              <input 
                type="number"
                value={pages}
                onChange={e => setPages(Number(e.target.value))}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-full font-medium transition cursor-pointer"
            >
              Next: Review Outline <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-[600px] w-full flex flex-col items-center mt-12 mx-auto">
        <div className="w-full bg-white rounded-2xl shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Review Outline</h2>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">You can edit the generated outline below before we build the final slides.</p>
          
          <textarea 
            value={outline}
            onChange={e => setOutline(e.target.value)}
            className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px] font-medium text-gray-800 resize-none leading-relaxed"
          ></textarea>

          <div className="mt-8 flex justify-between items-center">
            <button 
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition cursor-pointer"
            >
              Back
            </button>
            <button 
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full font-medium transition shadow-sm cursor-pointer"
            >
              Generate Final Slides <Sparkles className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] w-full flex flex-col items-center mx-auto mt-4 pb-12">
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">{title}</h2>
        <button 
          onClick={() => onSelectAgent?.('Slide')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-sm font-medium transition cursor-pointer"
        >
          <Sparkles className="size-4" />
          <span>Modify Slide</span>
        </button>
      </div>

      {/* Slide Container (16:9 Aspect Ratio) */}
      <div className="w-full aspect-video bg-white rounded-xl shadow-[0px_2px_12px_rgba(0,0,0,0.06)] border border-gray-200 overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center px-8 bg-gray-50/50">
          <div className="h-4 w-32 bg-indigo-100 rounded-md"></div>
        </div>
        {/* Content */}
        <div className="flex-1 p-10 flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight max-w-2xl bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <div className="w-20 h-1.5 bg-indigo-600 rounded-full"></div>
            
            <div className="flex-1 flex gap-8 mt-4">
              <div className="flex-1 flex flex-col gap-4">
                <div className="h-4 w-full bg-gray-100 rounded-md"></div>
                <div className="h-4 w-5/6 bg-gray-100 rounded-md"></div>
                <div className="h-4 w-full bg-gray-100 rounded-md"></div>
                <div className="h-4 w-4/6 bg-gray-100 rounded-md"></div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
                {/* Mock Chart */}
                <div className="absolute bottom-0 left-8 w-12 h-[40%] bg-blue-200 rounded-t-sm"></div>
                <div className="absolute bottom-0 left-24 w-12 h-[75%] bg-indigo-400 rounded-t-sm"></div>
                <div className="absolute bottom-0 left-40 w-12 h-[60%] bg-purple-300 rounded-t-sm"></div>
                <div className="absolute bottom-0 left-56 w-12 h-[90%] bg-indigo-600 rounded-t-sm"></div>
                <div className="absolute bottom-8 w-[80%] h-px bg-gray-200"></div>
              </div>
            </div>
        </div>
      </div>
      
      {/* Slide Navigation Mock */}
      <div className="mt-6 flex gap-2">
        <div className="size-2 rounded-full bg-indigo-600 border border-indigo-600"></div>
        <div className="size-2 rounded-full bg-transparent border border-gray-300"></div>
        <div className="size-2 rounded-full bg-transparent border border-gray-300"></div>
        <div className="size-2 rounded-full bg-transparent border border-gray-300"></div>
      </div>
    </div>
  );
}
