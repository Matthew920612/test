import { useState, useEffect, useRef } from 'react';
import { FileText, Share2, X, Image as ImageIcon, PanelRightClose, Sparkles } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { TabInfo } from '../App';
import SlideGenerator from './SlideGenerator';
import ChatPanel from './ChatPanel';
import type { Message, SessionState, AgentState, TaskInfo } from '../App';

type MainContentProps = {
  onSelectAgent?: (agentId: 'Slide' | 'Image') => void;
  openTabs: TabInfo[];
  activeTabId: string;
  onSetActiveTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  sessionFiles?: { id: string; name: string; type: string }[];
  onOpenFile?: (id: string, name: string, type: 'draft'|'slide'|'image'|'guide') => void;
  onManualCollapse?: () => void;
  
  onSendMessage: (content: string, shortcut?: string | null) => void;
  sessionState: SessionState;
  messages: Message[];
  agentState: AgentState;
  onGenerateOutput?: (type: 'slide' | 'image' | 'draft') => void;
  tasks: TaskInfo[];
};

export default function MainContent({ 
  onSelectAgent, 
  openTabs, 
  activeTabId,
  onSetActiveTab,
  onCloseTab,
  sessionFiles,
  onOpenFile,
  onManualCollapse,
  onSendMessage,
  sessionState,
  messages,
  tasks
}: MainContentProps) {
  const [chatWidth, setChatWidth] = useState(400);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(300, Math.min(800, e.clientX - 324 - 16)); 
      setChatWidth(newWidth);
    };
    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = () => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const [draftContent, setDraftContent] = useState(
    '<h1>Goal</h1><p>Create a comprehensive presentation outlining our new software architecture.</p><h2>Outline</h2><ul><li>Introduction & Current state</li><li>Proposed changes and microservice breakdown</li><li>Migration Timeline</li></ul><p><em>Note: Need to make sure we emphasize the cost savings in the timeline section.</em></p>'
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start drafting your ideas...',
      }),
    ],
    content: draftContent,
    // @ts-ignore
    onUpdate: ({ editor }) => {
      setDraftContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none p-6 min-h-[400px]',
      },
    },
  });

  // Keep editor content in sync if the tab changes
  useEffect(() => {
    if (editor && editor.getHTML() !== draftContent) {
      editor.commands.setContent(draftContent);
    }
  }, [activeTabId]);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Top Tabs */}
      {sessionState !== 'new' && (
        <div className="bg-gray-50/50 border-b border-[#e4e4e7] flex items-center h-[56px] px-2 overflow-x-auto select-none justify-between">
          <div className="flex items-center h-full">
            {openTabs.map(tab => {
              const isActive = tab.id === activeTabId;
              return (
                <div 
                  key={tab.id}
                  onClick={() => onSetActiveTab(tab.id)}
                  className={`flex items-center group justify-between px-3 py-2 rounded-t-lg border-b-0 cursor-pointer min-w-[120px] transition-colors h-full mt-2 ${
                    isActive 
                      ? 'bg-white border border-[#e4e4e7] -mb-[1px]' 
                      : 'hover:bg-gray-100 text-gray-500 border border-transparent mb-[1px]'
                  }`}
                >
                  <div className="flex gap-2 items-center">
                    {tab.type === 'draft' && <FileText className={`size-4 ${isActive ? 'text-gray-900' : ''}`} />}
                    {tab.type === 'slide' && (
                      <div className={`size-4 border-2 rounded-sm flex items-center justify-center ${isActive ? 'border-gray-900 text-gray-900' : 'border-current'}`}>
                        <div className="size-1.5 bg-current rounded-sm"></div>
                      </div>
                    )}
                    {tab.type === 'guide' && <Share2 className={`size-4 ${isActive ? 'text-gray-900' : ''}`} />}
                    {tab.type === 'image' && <ImageIcon className={`size-4 ${isActive ? 'text-gray-900' : ''}`} />}
                    {tab.type === 'folder' && <FileText className={`size-4 ${isActive ? 'text-gray-900' : ''}`} />}
                    
                    <span className={`font-medium text-sm truncate max-w-[100px] ${isActive ? 'text-gray-900' : ''}`}>
                      {tab.title}
                    </span>
                  </div>
                  
                  {tab.type !== 'folder' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className={`ml-2 p-0.5 rounded-sm hover:bg-gray-200 transition-colors ${isActive ? 'text-gray-500 hover:text-gray-700' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {onManualCollapse && (
            <button 
              onClick={onManualCollapse}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition mr-1"
              title="Collapse panel"
            >
              <PanelRightClose className="size-[18px]" strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* Main Split Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* Left Chat Pane */}
        {sessionState !== 'new' && (
          <div 
            className="h-full flex-shrink-0 border-r border-[#e4e4e7] transition-all bg-white relative z-10 flex flex-col"
            style={{ width: `${chatWidth}px` }}
          >
            <ChatPanel 
              onSendMessage={onSendMessage} 
              sessionState={sessionState} 
              messages={messages}
              activeTabType={activeTab?.type}
              tasks={tasks}
              activeTabId={activeTabId}
            />
            {/* Resizer Handle */}
            <div 
              onMouseDown={startResizing}
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 transition-colors z-50 translate-x-1/2 flex flex-col justify-center items-center group"
            >
               <div className="w-[3px] h-8 bg-gray-300 rounded-full group-hover:bg-white transition-colors" />
            </div>
          </div>
        )}

        {/* Right Document Renderer Pane */}
        <div className={`flex-1 h-full overflow-y-auto ${sessionState === 'new' ? 'px-0 py-0' : 'px-12 py-12'} flex justify-center bg-[#F9FAFB]`}>
        
        {tasks.some(t => t.targetTabId === activeTabId && t.status === 'running') && activeTab?.type !== 'folder' ? (
           <div className="max-w-[800px] w-full flex flex-col items-center justify-center h-full mt-[-8%]">
              <div className="flex flex-col items-center gap-6 w-full animate-pulse">
                 <div className="relative flex items-center justify-center size-20">
                   <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
                   <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin"></div>
                   <div className="size-8 bg-indigo-50 rounded-full flex items-center justify-center">
                      <Sparkles className="size-4 text-indigo-500" />
                   </div>
                 </div>
                 
                 <div className="flex flex-col items-center gap-2 text-center mb-8">
                   <h3 className="text-xl font-medium text-gray-900">Agent is generating content...</h3>
                   <p className="text-sm text-gray-500">This usually takes about 2 minutes. Focus mode active.</p>
                 </div>

                 {activeTab?.type === 'slide' ? (
                   <div className="w-full aspect-[16/9] max-w-[600px] bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                      <div className="h-12 bg-gray-50 border-b border-gray-100 w-full flex items-center px-4 gap-3">
                         <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                         <div className="w-24 h-4 rounded-sm bg-gray-200"></div>
                     </div>
                     <div className="flex-1 p-8 flex flex-col justify-center items-center gap-6">
                        <div className="w-3/4 h-8 bg-gray-100 rounded-lg"></div>
                        <div className="w-1/2 h-4 bg-gray-100 rounded-md"></div>
                        <div className="w-full h-32 bg-gray-50 rounded-lg mt-4"></div>
                     </div>
                   </div>
                 ) : activeTab?.type === 'image' ? (
                   <div className="w-full max-w-[400px] aspect-square bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                      <div className="w-full h-full bg-gray-50 rounded-lg"></div>
                   </div>
                 ) : (
                   <div className="w-full max-w-[600px] bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col gap-4">
                      <div className="w-1/3 h-8 bg-gray-100 rounded-lg mb-4"></div>
                      <div className="w-full h-4 bg-gray-50 rounded-md"></div>
                      <div className="w-11/12 h-4 bg-gray-50 rounded-md"></div>
                      <div className="w-4/5 h-4 bg-gray-50 rounded-md"></div>
                      <div className="w-full h-4 bg-gray-50 rounded-md mt-6"></div>
                      <div className="w-3/4 h-4 bg-gray-50 rounded-md"></div>
                   </div>
                 )}
              </div>
           </div>
        ) : (
          <>
            {activeTab?.type === 'guide' && (
              <div className="max-w-[600px] w-full text-black flex flex-col gap-4">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="font-semibold text-3xl tracking-tight leading-9">
                    Feature Guide: AI Brand Identity Extractor
                  </h1>
                </div>
                
                <h2 className="font-semibold text-2xl tracking-tight leading-8 mt-2 mb-2">
                  Overview
                </h2>
                <p className="font-normal text-sm leading-5 mb-2">
                  The Brand Identity Extractor allows users to automatically generate a cohesive color system by simply uploading a brand logo. Our engine analyzes the core visual DNA of your file to provide professional-grade palette recommendations.
                </p>
                
                <p className="font-normal text-sm leading-5 font-semibold mt-2">
                  Core Functionalities
                </p>
                <ul className="list-disc pl-5 font-normal text-sm leading-5 flex flex-col gap-1 mb-4">
                  <li>Smart Analysis: Instantly decodes primary and secondary colors from any uploaded image (PNG, SVG, or JPG).</li>
                  <li>Palette Generation: Creates a full spectrum of UI-ready shades based on your brand's core aesthetics.</li>
                  <li>Dynamic Application: Apply the extracted colors to your entire workspace with a single click.</li>
                </ul>

                <h2 className="font-semibold text-2xl tracking-tight leading-8 mt-4 mb-2">
                  How to Use
                </h2>
                <div className="font-normal text-sm leading-5 flex flex-col gap-3">
                  <div>
                    <p>Step 1: Upload Your Logo</p>
                    <p>Navigate to the Assets tab and click on the Attach Files button. Select your brand logo from your local drive.</p>
                    <p className="text-gray-500 italic mt-1">Note: For best results, use a high-resolution file with a transparent background.</p>
                  </div>
                  
                  <div>
                    <p>Step 2: Extract Palette</p>
                    <p>Once the file is uploaded, click the Extract Colors button. You will see an Analyzing... status indicator while our system processes the image.</p>
                  </div>
                  
                  <div>
                    <p>Step 3: Review & Apply</p>
                    <p>After the analysis is complete, a success banner will appear: "Brand colors identified!" You can then review the suggested palette and click Apply Logo to update your session's theme.</p>
                  </div>
                </div>

                <h2 className="font-semibold text-2xl tracking-tight leading-8 mt-6 mb-2">
                  Troubleshooting
                </h2>
                <div className="font-normal text-sm leading-5">
                  <p>Error: "Something went wrong while starting the task."</p>
                  <ul className="list-disc pl-5 mt-1 mb-3">
                    <li>This usually occurs due to an unstable network connection. Click Fix & Retry to resume.</li>
                  </ul>
                  
                  <p className="font-semibold">File Upload Failed</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Ensure your file size is under 10MB. If the issue persists, try refreshing the page.</li>
                  </ul>
                </div>

              </div>
            )}

            {/* Slide Generator Workflow */}
            {activeTab?.type === 'slide' && (
              <SlideGenerator title={activeTab.title} onSelectAgent={onSelectAgent as any} />
            )}

            {/* Mock Image Deliverable */}
            {activeTab?.type === 'image' && (
              <div className="max-w-[700px] w-full flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-gray-900">{activeTab.title}</h2>
                  </div>
                  
                  <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <ImageIcon className="size-16 stroke-1" />
                      <span className="font-medium tracking-wide">(Generated Image Placeholder)</span>
                    </div>
                  </div>
              </div>
            )}

            {/* Mock Draft View */}
            {activeTab?.type === 'draft' && (
              <div className="max-w-[700px] w-full flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mt-4">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h1 className="font-serif text-2xl text-gray-900 tracking-tight flex items-center gap-2">
                      <FileText className="size-5 text-indigo-500" />
                      {activeTab.title}
                    </h1>
                  </div>
                  
                  <div className="flex-1 w-full relative overflow-y-auto draft-editor-container tiptap-wrapper">
                    <EditorContent editor={editor} />
                  </div>
              </div>
            )}

            {/* Session Default Files View */}
            {activeTab?.type === 'folder' && sessionState !== 'new' && (
              <div className="max-w-[800px] w-full flex flex-col items-start mt-8">
                  
                  {/* Insert Active Tasks Section Here */}
                  {tasks && tasks.length > 0 && (
                     <div className="w-full flex flex-col mb-10">
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-4 flex items-center gap-2">
                           <Sparkles className="size-5 text-indigo-500" />
                           Active Tasks
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                           {tasks.map(t => (
                              <div key={t.id} className="bg-white border border-indigo-100/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden group">
                                 {t.status === 'running' && (
                                   <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 overflow-hidden">
                                      <div className="h-full bg-indigo-500 w-1/2 animate-pulse rounded-r-full"></div>
                                   </div>
                                 )}
                                 <div className="flex justify-between items-start pt-1">
                                    <span className="font-medium text-[15px] text-gray-900 leading-snug">{t.description}</span>
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                       t.status === 'running' ? 'bg-indigo-100 text-indigo-700' : 
                                       t.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 
                                       'bg-amber-100 text-amber-700'
                                    }`}>
                                      {t.status === 'running' ? 'In Progress' : t.status === 'done' ? 'Done' : 'Pending'}
                                    </span>
                                 </div>
                                 {t.status === 'running' && (
                                    <div className="flex items-center gap-2 mt-1">
                                       <div className="flex gap-1 items-center">
                                          <div className="size-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                          <div className="size-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                          <div className="size-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                       </div>
                                       <span className="text-[13px] text-gray-500 font-medium tracking-wide">Executing sub-agent workflow...</span>
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Task Files</h2>
                  <p className="text-sm text-gray-500 mb-8">All generated drafts, images, and slides in your current active task.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {(sessionFiles || []).map(file => (
                        <div 
                          key={file.id}
                          onClick={() => onOpenFile?.(file.id, file.name, file.type as any)}
                          className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition group"
                        >
                          <div className="size-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 shrink-0">
                              {file.type === 'draft' && <FileText className="size-5 text-gray-400 group-hover:text-indigo-600" />}
                              {file.type === 'slide' && <div className="size-4 border-2 border-current rounded-sm flex items-center justify-center shrink-0 text-gray-400 group-hover:text-indigo-600"><div className="size-1 bg-current rounded-sm"></div></div>}
                              {file.type === 'image' && <ImageIcon className="size-5 text-gray-400 group-hover:text-indigo-600" />}
                              {file.type === 'guide' && <Share2 className="size-5 text-gray-400 group-hover:text-indigo-600" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                              <span className="font-medium text-[14px] text-gray-900 truncate">{file.name}</span>
                              <span className="text-xs text-gray-500 capitalize">{file.type} Type</span>
                          </div>
                        </div>
                    ))}
                    
                    {(!sessionFiles || sessionFiles.length === 0) && (
                        <div className="col-span-full py-12 text-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          No files generated in this task yet.
                        </div>
                    )}
                  </div>
              </div>
            )}

            {sessionState === 'new' && (
              <div className="w-full h-full flex flex-col bg-white overflow-hidden relative">
                    <ChatPanel 
                        onSendMessage={onSendMessage} 
                        sessionState={sessionState} 
                        messages={messages}
                        activeTabType={activeTab?.type}
                        tasks={tasks}
                        activeTabId={activeTabId}
                      />
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
