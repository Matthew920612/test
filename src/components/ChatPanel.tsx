import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image as ImageIcon, Sparkles, Plus, X, FileText, Wand2, Zap } from 'lucide-react';
import type { SessionState, Message, TaskInfo } from '../App';
import newSessionIcon from '../assets/new-session-icon.png';

type ChatPanelProps = {
  onSendMessage: (content: string, shortcut?: string | null) => void;
  sessionState: SessionState;
  onSelectAgent?: (agent: 'Slide' | 'Image' | 'Task') => void;
  messages: Message[];
  activeFileContextName?: string;
  onClearFileContext?: () => void;
  sessionFiles?: { id: string; name: string; type: string }[];
  onSelectFileContext?: (id: string, title: string) => void;
  activeTabType?: 'draft' | 'slide' | 'image' | 'guide' | 'folder';
  tasks?: TaskInfo[];
  activeTabId?: string;
};

const TypewriterText = ({ text, msgId }: { text: string, msgId: string }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    const timestampStr = msgId.split('_')[1] || '0';
    const msgTimestamp = parseInt(timestampStr, 10);
    const isNew = Date.now() - msgTimestamp < 3000;
    
    if (!isNew) {
      setDisplayed(text);
      return;
    }
    
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20); // 20ms per character typing speed
    
    return () => clearInterval(interval);
  }, [text, msgId]);

  return <>{displayed}</>;
};

export default function ChatPanel({ 
  onSendMessage, 
  sessionState, 
  messages,
  activeTabType,
  tasks,
  activeTabId
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, activeShortcut);
    setInputText('');
    setActiveShortcut(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  let agentName = 'Brain';
  let AgentIcon = Sparkles;
  if (activeTabType === 'slide') { agentName = 'Presenter'; AgentIcon = FileText; }
  if (activeTabType === 'draft') { agentName = 'Writer'; AgentIcon = FileText; }
  if (activeTabType === 'image') { agentName = 'Designer'; AgentIcon = ImageIcon; }

  const isAgentBusy = tasks?.some(t => t.targetTabId === activeTabId && t.status === 'running') || false;
  return (
    <div className="h-full flex flex-col justify-between w-full bg-white/50">
      
      {/* Dynamic Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${sessionState === 'new' ? 'px-8 lg:px-16' : 'px-5'} flex flex-col relative w-full h-full max-w-4xl mx-auto`}>
        
        {messages.length === 0 ? (
          // NEW SESSION STATE - Centered Welcome & Templates
          <div className="flex-1 flex flex-col items-center justify-center p-8 w-full">
            
            {/* Centered Logo & Title */}
            <div className="flex flex-col items-center gap-5 mb-24 mt-8">
              <img src={newSessionIcon} alt="Dokie Logo" className="w-[84px] object-contain opacity-90" />
              <h1 className="text-4xl font-serif italic text-gray-900 tracking-tight">
                A smarter way to present ideas
              </h1>
            </div>

            {/* Template Cards */}
            <div className="w-full flex flex-col gap-3 mt-auto mb-6">
              <span className="text-xs font-medium text-gray-900 ml-1">Templets</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Card 1 */}
                <button 
                  onClick={() => {
                    onSendMessage("I'd like to use the Praesent lobortis velit template to build a presentation. Please help me structure the content.");
                  }}
                  className="bg-white border border-[#e4e4e7] p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col gap-3 group"
                >
                  <div className="text-orange-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="size-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px] mb-1">Praesent lobortis velit</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">Rutrum eu egestas fermentum lectus malesuada ornare urna ac odio. Purus lacinia libero lectus non.</p>
                  </div>
                </button>

                {/* Card 2 */}
                <button 
                  onClick={() => {
                    onSendMessage("I want to adapt the Praesent vitae strategy for a brand new marketing campaign. Can you assist?");
                  }}
                  className="bg-white border border-[#e4e4e7] p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col gap-3 group"
                >
                  <div className="text-orange-400 group-hover:scale-110 transition-transform">
                    <Wand2 className="size-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px] mb-1">Praesent lobortis velit</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">Rutrum eu egestas fermentum lectus malesuada ornare urna ac odio. Purus lacinia libero lectus non.</p>
                  </div>
                </button>

                {/* Card 3 */}
                <button 
                  onClick={() => {
                     onSendMessage("Let's brainstorm some ideas using the Lightning Idea template.");
                  }}
                  className="bg-white border border-[#e4e4e7] p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col gap-3 group"
                >
                  <div className="text-orange-400 group-hover:scale-110 transition-transform">
                    <Zap className="size-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px] mb-1">Praesent lobortis velit</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">Rutrum eu egestas fermentum lectus malesuada ornare urna ac odio. Purus lacinia libero lectus non.</p>
                  </div>
                </button>

              </div>
            </div>

            {/* Shortcuts */}
            <div className="w-full flex flex-col gap-3 mt-4 mb-6">
              <span className="text-xs font-medium text-gray-900 ml-1">Shortcuts</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveShortcut('draft')}
                  className="bg-white border border-[#e4e4e7] p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="text-blue-400 group-hover:scale-110 transition-transform">
                    <FileText className="size-5" />
                  </div>
                  <span className="font-medium text-gray-900 text-[15px]">Create draft</span>
                </button>
                <button 
                  onClick={() => setActiveShortcut('slide')}
                  className="bg-white border border-[#e4e4e7] p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="text-indigo-400 group-hover:scale-110 transition-transform">
                    <div className="size-5 border-2 border-current rounded-sm flex items-center justify-center shrink-0"><div className="size-1.5 bg-current rounded-sm"></div></div>
                  </div>
                  <span className="font-medium text-gray-900 text-[15px]">Create a slide</span>
                </button>
                <button 
                  onClick={() => setActiveShortcut('social_image')}
                  className="bg-white border border-[#e4e4e7] p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="text-emerald-400 group-hover:scale-110 transition-transform">
                    <ImageIcon className="size-5" />
                  </div>
                  <span className="font-medium text-gray-900 text-[15px]">Create social media image</span>
                </button>
                <button 
                  onClick={() => setActiveShortcut('long_image')}
                  className="bg-white border border-[#e4e4e7] p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="text-orange-400 group-hover:scale-110 transition-transform">
                    <ImageIcon className="size-5" />
                  </div>
                  <span className="font-medium text-gray-900 text-[15px]">Create long image</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          // ACTIVE SESSION STATE - Messages
          <div className="flex flex-col gap-6 mt-4 pt-8 pb-4">
            


            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="bg-gray-100 rounded-2xl px-4 py-2.5 max-w-[85%] border border-gray-200/50">
                    <p className="text-[15px] text-gray-900 leading-snug whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="flex gap-3 max-w-[90%] w-full">
                    <div className="size-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                       {msg.agentNameOverride === 'Brain' ? (
                          <Sparkles className="size-[15px] text-indigo-600" />
                       ) : (
                          <AgentIcon className="size-[15px] text-indigo-600" />
                       )}
                    </div>
                    <div className="flex flex-col gap-1 w-full pt-1.5">
                      <span className="text-xs font-bold text-gray-500 tracking-wide mb-1">{msg.agentNameOverride || agentName}</span>
                      <p className="text-[15px] text-gray-800 tracking-tight leading-relaxed flex flex-col bg-transparent">
                        <TypewriterText text={msg.content} msgId={msg.id} />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className={`relative ${sessionState === 'new' ? 'px-8 lg:px-16' : 'px-5'} pb-4 w-full max-w-4xl mx-auto`}>
        
        {/* Prompt Input Box Container */}
        <div className={`border border-[#e4e4e7] rounded-[24px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.03)] flex flex-col relative z-20 transition-all duration-300 ${messages.length === 0 ? 'min-h-[160px]' : ''}`}>
          
          {/* Inner Input Area */}
          <div className={`bg-white p-4 flex flex-col gap-3 flex-1 mt-1 rounded-[24px]`}>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)}></div>
                <div className="absolute bottom-[calc(100%+12px)] left-0 w-[280px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
                   <div className="px-3 py-2 border-b border-gray-50 mb-1">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</span>
                   </div>
                   <div className="flex flex-col gap-0.5">
                      <button onClick={() => { setInputText('请帮我生成一份关于 Q3 战略规划的 Slide 演示文稿，包含市场分析和盈利预测，大概10页左右。'); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-indigo-50/80 group transition text-left">
                          <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition">
                             <div className="size-4 border-2 border-current rounded-sm flex items-center justify-center shrink-0"><div className="size-1 bg-current rounded-sm"></div></div>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-semibold text-gray-900 leading-none mb-1 group-hover:text-indigo-900">Generate Slide</span>
                             <span className="text-[11px] text-gray-500 leading-none">Draft a new presentation pitch</span>
                          </div>
                      </button>
                      <button onClick={() => { setInputText('我需要起草一份关于近期公司架构调整的详细 Document 报告，重点说明人力资源的重新分配。'); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-blue-50/80 group transition text-left">
                          <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition">
                             <FileText className="size-4" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-semibold text-gray-900 leading-none mb-1 group-hover:text-blue-900">Generate Document</span>
                             <span className="text-[11px] text-gray-500 leading-none">Write a new strategy draft</span>
                          </div>
                      </button>
                      <button onClick={() => { setInputText('请为我们的夏季新品发布会设计一张充满活力的宣传海报 Image，颜色要明亮。'); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-emerald-50/80 group transition text-left">
                          <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition">
                             <ImageIcon className="size-4" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-semibold text-gray-900 leading-none mb-1 group-hover:text-emerald-900">Generate Image</span>
                             <span className="text-[11px] text-gray-500 leading-none">Create a visual asset</span>
                          </div>
                      </button>
                   </div>
                </div>
              </>
            )}

            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onDoubleClick={() => setIsMenuOpen(true)}
              onKeyDown={handleKeyDown}
              disabled={isAgentBusy}
              placeholder={isAgentBusy ? `${agentName} is currently processing a task for this document...` : "Ask me anything... (Double-click for actions)"}
              className={`w-full text-[15px] placeholder-gray-400 text-gray-900 resize-none outline-none bg-transparent px-1 relative z-20 ${sessionState === 'new' ? 'h-[70px]' : 'h-[40px]'} ${isAgentBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
            ></textarea>
          
          <div className="flex justify-between items-end mt-auto">
            
            <div className="flex items-center gap-1">
              {/* Attach Button */}
              <button className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
                <Plus className="size-[22px]" strokeWidth={2} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-auto pb-1 flex-1 px-2">
              {activeShortcut && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-600 shrink-0">Creating: {activeShortcut.replace('_', ' ')}</span>
                  {activeShortcut === 'slide' && (
                    <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition whitespace-nowrap">Select Theme</button>
                  )}
                  {(activeShortcut === 'social_image' || activeShortcut === 'long_image') && (
                    <button className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition whitespace-nowrap">Select Ratio</button>
                  )}
                  <button onClick={() => setActiveShortcut(null)} className="text-gray-400 hover:text-gray-600 ml-1">
                    <X className="size-3" />
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`rounded-full size-10 shrink-0 flex items-center justify-center shadow-sm transition ${
                inputText.trim()
                  ? (sessionState === 'new' ? 'bg-gray-900 text-white cursor-pointer hover:bg-gray-800' : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700')
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="size-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
