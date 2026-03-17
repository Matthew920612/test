import { Plus, Briefcase, Megaphone } from 'lucide-react';

type WorkspaceCreatorProps = {
  onCancel: () => void;
  onCreate: (template: string) => void;
};

export default function WorkspaceCreator({ onCancel, onCreate }: WorkspaceCreatorProps) {
  const templates = [
    { id: 'blank', icon: Plus, title: 'Start from scratch', desc: 'Create a completely custom workspace with an empty environment.' },
    { id: 'Marketing', icon: Megaphone, title: 'Marketing Campaign', desc: 'Pre-configured folders and agents for marketing collaterals.' },
    { id: 'Product', icon: Briefcase, title: 'Product Launch', desc: 'Ideal for planning, roadmaps, and tracking new product features.' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#fbfbfb] rounded-[16px] animate-in fade-in duration-300 relative border border-[#e4e4e7] shadow-sm">
      <div className="max-w-4xl w-full">
         <h1 className="text-3xl font-serif text-gray-900 mb-3 tracking-tight">Create a New Workspace</h1>
         <p className="text-gray-500 mb-12 text-[15px] font-light">Select a preset to quickly set up your environment, or start from scratch.</p>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           {templates.map(t => {
             const Icon = t.icon;
             return (
               <button 
                 key={t.id}
                 onClick={() => onCreate(t.id)}
                 className="flex flex-col text-left p-6 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all group cursor-pointer"
               >
                 <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center mb-5 group-hover:bg-indigo-50 transition-colors">
                   <Icon className="size-6 text-gray-600 group-hover:text-indigo-600 transition-colors" strokeWidth={1.5} />
                 </div>
                 <h3 className="font-semibold text-gray-900 text-base mb-2">{t.title}</h3>
                 <p className="text-gray-500 text-[13px] leading-relaxed font-light">{t.desc}</p>
               </button>
             )
           })}
         </div>

         <div className="mt-12 flex pl-2">
            <button 
              onClick={onCancel} 
              className="text-gray-400 hover:text-gray-700 text-[13px] font-medium transition-colors"
            >
               Cancel
            </button>
         </div>
      </div>
    </div>
  );
}
