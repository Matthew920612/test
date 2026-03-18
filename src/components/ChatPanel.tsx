import { useState } from 'react';
import { Plus, ArrowUp, ArrowUpRight, Zap, Sparkles, Wand2, X, Image as ImageIcon } from 'lucide-react';
import type { SessionState, Message, AgentState } from '../App';
import newSessionIcon from '../assets/new-session-icon.png';

type ChatPanelProps = {
  onSendMessage: (content: string) => void;
  sessionState: SessionState;
  selectedAgent?: 'Slide' | 'Image' | 'Task' | null;
  onSelectAgent?: (agent: 'Slide' | 'Image' | 'Task') => void;
  onClearAgent?: () => void;
  messages: Message[];
  agentState: AgentState;
  onGenerateOutput?: (type: 'slide' | 'image') => void;
  activeFileContextName?: string;
  onClearFileContext?: () => void;
};

export default function ChatPanel({ 
  onSendMessage, 
  sessionState, 
  selectedAgent, 
  onSelectAgent,
  onClearAgent,
  messages,
  agentState,
  onGenerateOutput,
  activeFileContextName,
  onClearFileContext
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);

  const agents = ['Slide', 'Image', 'Task'] as const;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
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
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="relative px-4 pb-4 max-w-4xl mx-auto w-full">
        
        {/* Prompt Input Box Container */}
        <div className={`border border-[#e4e4e7] rounded-[24px] shadow-[0px_2px_12px_rgba(0,0,0,0.03)] flex flex-col relative z-20 overflow-hidden transition-all duration-300 ${sessionState === 'new' ? 'min-h-[160px]' : ''}`}>
          
          {/* File Context Bar */}
          {activeFileContextName && (
            <div className="bg-[#f4f4f5] px-5 py-3 flex justify-between items-center border-b border-[#e4e4e7]">
              <div className="flex items-center gap-2 text-gray-900">
                <ArrowUpRight className="size-[18px]" strokeWidth={2} />
                <span className="text-[15px] font-medium">{activeFileContextName}</span>
              </div>
              <button 
                onClick={onClearFileContext}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="size-[18px]" />
              </button>
            </div>
          )}

          {/* Inner Input Area */}
          <div className="bg-white p-4 flex flex-col gap-3 flex-1 mt-1">
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

              {/* Inline Agent Tag / Dropdown */}
              <div className="relative">
                {selectedAgent ? (
                  <div 
                    onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#f4f4f5] rounded-full border border-[#e4e4e7] text-[#3f3f46] hover:bg-[#e4e4e7]/50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-center -space-x-1 opacity-80">
                      <div className="size-[7px] rounded-full border-[1.5px] border-current"></div>
                      <div className="w-3 h-[1.5px] bg-current"></div>
                      <div className="size-[7px] rounded-full border-[1.5px] border-current"></div>
                    </div>
                    <span className="text-[13px] font-medium tracking-wide">{selectedAgent}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearAgent?.();
                        setIsAgentMenuOpen(false);
                      }} 
                      className="text-gray-400 hover:text-gray-700 transition"
                    >
                      <X className="size-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 cursor-pointer transition group"
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                    <span className="text-[13px] font-medium tracking-wide">Agent</span>
                  </button>
                )}

                {/* Dropdown Menu */}
                {isAgentMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-32 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                      {agents.map((agent) => (
                        <button
                          key={agent}
                          onClick={() => {
                            if (onSelectAgent) {
                              onSelectAgent(agent as 'Slide' | 'Image' | 'Task');
                            }
                            setIsAgentMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-gray-50 flex items-center gap-2 ${selectedAgent === agent ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                        >
                           {agent === 'Slide' && <div className="size-3 border-2 border-current rounded-sm flex items-center justify-center shrink-0"><div className="size-1 bg-current rounded-sm"></div></div>}
                           {agent === 'Image' && <ImageIcon className="size-3.5 shrink-0" strokeWidth={2} />}
                           {agent === 'Task' && <div className="size-[5px] bg-current rounded-sm shrink-0"></div>}
                           {agent}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`rounded-full size-10 flex items-center justify-center shadow-sm transition ${
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
