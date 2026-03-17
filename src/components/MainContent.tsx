import { useState, useEffect } from 'react';
import { FileText, Share2, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { TabInfo } from '../App';

type MainContentProps = {
  onSelectAgent?: (agentId: 'Slide' | 'Image') => void;
  openTabs: TabInfo[];
  activeTabId: string;
  onSetActiveTab: (id: string) => void;
  onCloseTab: (id: string) => void;
};

export default function MainContent({ 
  onSelectAgent, 
  openTabs, 
  activeTabId, 
  onSetActiveTab, 
  onCloseTab 
}: MainContentProps) {
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
      <div className="bg-gray-50/50 border-b border-[#e4e4e7] flex items-center h-[56px] px-2 overflow-x-auto select-none">
        {openTabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <div 
              key={tab.id}
              onClick={() => onSetActiveTab(tab.id)}
              className={`flex items-center group justify-between px-3 py-2 rounded-t-lg border-b-0 cursor-pointer min-w-[120px] transition-colors ${
                isActive 
                  ? 'bg-white border border-[#e4e4e7] -mb-[1px]' 
                  : 'hover:bg-gray-100 text-gray-500 border border-transparent'
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
                
                <span className={`font-medium text-sm truncate max-w-[100px] ${isActive ? 'text-gray-900' : ''}`}>
                  {tab.title}
                </span>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className={`ml-2 p-0.5 rounded-sm hover:bg-gray-200 transition-colors ${isActive ? 'text-gray-500 hover:text-gray-700' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Document Content */}
      <div className="flex-1 overflow-y-auto px-16 py-12 flex justify-center bg-[#F9FAFB]">
        {activeTab?.type === 'guide' && (
          <div className="max-w-[600px] w-full text-black flex flex-col gap-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="font-semibold text-3xl tracking-tight leading-9">
                Feature Guide: AI Brand Identity Extractor
              </h1>
              <button 
                onClick={() => onSelectAgent?.('Slide')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-sm font-medium transition"
              >
                <Sparkles className="size-4" />
                <span>Modify with AI</span>
              </button>
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
                <p>After the analysis is complete, a success banner will appear: "Brand colors identified!" You can then review the suggested palette and click Apply Logo to update your project's theme.</p>
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

        {/* Mock Slide Deliverable */}
        {activeTab?.type === 'slide' && (
          <div className="max-w-[800px] w-full flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-900">{activeTab.title}</h2>
              <button 
                onClick={() => onSelectAgent?.('Slide')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-sm font-medium transition"
              >
                <Sparkles className="size-4" />
                <span>Modify Slide</span>
              </button>
            </div>

            {/* Slide Container (16:9 Aspect Ratio) */}
            <div className="w-full aspect-video bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden relative flex flex-col">
              {/* Header */}
              <div className="h-16 border-b border-gray-100 flex items-center px-8 bg-gray-50/50">
                <div className="h-4 w-32 bg-indigo-100 rounded-md"></div>
              </div>
              {/* Content */}
              <div className="flex-1 p-10 flex flex-col gap-6">
                 <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight max-w-2xl bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
                   Market Analysis & Strategic Positioning
                 </h1>
                 <div className="w-20 h-1.5 bg-indigo-600 rounded-full"></div>
                 
                 <div className="flex-1 flex gap-8 mt-4">
                   <div className="flex-1 flex flex-col gap-4">
                      <div className="h-4 w-full bg-gray-100 rounded-md"></div>
                      <div className="h-4 w-5/6 bg-gray-100 rounded-md"></div>
                      <div className="h-4 w-full bg-gray-100 rounded-md"></div>
                      <div className="h-4 w-4/6 bg-gray-100 rounded-md"></div>
                   </div>
                   <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center relative overflow-hidden">
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
        )}

        {/* Mock Image Deliverable */}
        {activeTab?.type === 'image' && (
           <div className="max-w-[700px] w-full flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">{activeTab.title}</h2>
                <button 
                  onClick={() => onSelectAgent?.('Image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full text-sm font-medium transition"
                >
                  <Sparkles className="size-4" />
                  <span>Modify Image</span>
                </button>
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
                
                <div className="flex items-center gap-3">
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-sm font-medium transition"
                  >
                    <Sparkles className="size-4" />
                    <span>Modify with AI</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 w-full relative overflow-y-auto draft-editor-container tiptap-wrapper">
                <EditorContent editor={editor} />
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
