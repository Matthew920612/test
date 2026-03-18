import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image as ImageIcon, Sparkles, Plus, ChevronDown, ArrowUpRight, X, FileText, Wand2, Zap } from 'lucide-react';
import type { SessionState, Message, AgentState } from '../App';
import newSessionIcon from '../assets/new-session-icon.png';

type ChatPanelProps = {
  onSendMessage: (content: string, shortcut?: string | null) => void;
  sessionState: SessionState;
  onSelectAgent?: (agent: 'Slide' | 'Image' | 'Task') => void;
  messages: Message[];
  agentState: AgentState;
  onGenerateOutput?: (type: 'slide' | 'image') => void;
  activeFileContextName?: string;
  onClearFileContext?: () => void;
  sessionFiles?: { id: string; name: string; type: string }[];
  onSelectFileContext?: (id: string, title: string) => void;
};

export default function ChatPanel({ 
  onSendMessage, 
  sessionState, 
  messages,
  agentState,
  onGenerateOutput,
  activeFileContextName,
  onClearFileContext,
  sessionFiles,
  onSelectFileContext
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

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
  return (
    <div className="h-full flex flex-col justify-between w-full bg-white/50">
      
      {/* Dynamic Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col relative w-full h-full max-w-4xl mx-auto">
        
        {sessionState === 'new' ? (
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
            <div className="w-full max-w-3xl flex flex-col gap-3 mt-auto mb-6">
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
            <div className="w-full max-w-3xl flex flex-col gap-3 mt-4 mb-6">
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
                  <div className="bg-gray-100 rounded-2xl px-4 py-2.5 max-w-[85%]">
                    <p className="text-[15px] text-gray-900 leading-snug whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="bg-transparent text-gray-900 text-[15px] leading-relaxed max-w-[90%]">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Agent Action Buttons (Shown when drafting is complete) */}
            {agentState === 'complete' && messages.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-sm text-gray-500 font-medium mb-1">Suggested Next Actions</p>
                <div className="flex flex-wrap gap-2">
                   <button 
                     onClick={() => onGenerateOutput?.('slide')}
                     className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                   >
                     <div className="size-4 border-2 border-indigo-600 rounded-sm flex items-center justify-center">
                        <div className="size-1.5 bg-indigo-600 rounded-sm"></div>
                     </div>
                     Generate Slides
                   </button>
                   <button 
                     onClick={() => onGenerateOutput?.('image')}
                     className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                   >
                     <ImageIcon className="size-4 text-emerald-600" />
                     Generate Images
                   </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="relative px-4 pb-4 max-w-4xl mx-auto w-full">
        
        {/* Prompt Input Box Container */}
        <div className={`border border-[#e4e4e7] rounded-[24px] bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.03)] flex flex-col relative z-20 transition-all duration-300 ${sessionState === 'new' ? 'min-h-[160px]' : ''}`}>
          
          {/* File Context Bar */}
          {sessionState !== 'new' && sessionFiles && sessionFiles.length > 0 && (
            <div className="bg-[#f4f4f5] px-5 py-3 flex justify-between items-center border-b border-[#e4e4e7] relative group rounded-t-[24px]">
              <div 
                className="flex items-center gap-2 text-gray-900 cursor-pointer"
                onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              >
                <ArrowUpRight className="size-[18px]" strokeWidth={2} />
                <span className="text-[15px] font-medium">{activeFileContextName || 'No file selected'}</span>
                <ChevronDown className="size-4 text-gray-400" />
              </div>
              {activeFileContextName && (
                <button 
                  onClick={onClearFileContext}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="size-[18px]" />
                </button>
              )}

              {/* File Menu Dropdown (Floating) */}
              {isFileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/5" 
                    onClick={(e) => { e.stopPropagation(); setIsFileMenuOpen(false); }}
                  ></div>
                  <div className="absolute bottom-full mb-2 left-4 w-64 bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-2 relative bg-white">
                      <div className="px-4 py-1 text-xs font-medium text-gray-500">Session Files</div>
                      {sessionFiles.length === 0 && (
                        <div className="px-4 py-2 text-xs text-gray-400">No files in session</div>
                      )}
                      {sessionFiles.map(f => (
                        <button
                          key={f.id}
                          onClick={() => {
                            onSelectFileContext?.(f.id, f.name);
                            setIsFileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        >
                          <FileText className="size-3.5" />
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Inner Input Area */}
          <div className={`bg-white p-4 flex flex-col gap-3 flex-1 mt-1 ${sessionState !== 'new' && sessionFiles && sessionFiles.length > 0 ? 'rounded-b-[24px]' : 'rounded-[24px]'}`}>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your presentation info..."
              className={`w-full text-[15px] placeholder-gray-400 text-gray-900 resize-none outline-none bg-transparent px-1 ${sessionState === 'new' ? 'h-[70px]' : 'h-[40px]'}`}
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
