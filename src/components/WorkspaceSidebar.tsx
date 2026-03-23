import { Plus, MessageSquare, ChevronDown, ChevronRight, Upload, Folder, CornerDownRight, Loader2 } from 'lucide-react';
import type { FolderInfo, TaskInfo } from '../App';

type WorkspaceSidebarProps = {
  workspaceName?: string;
  activeTab: 'Sessions' | 'Assets';
  setActiveTab: (tab: 'Sessions' | 'Assets') => void;
  folders: FolderInfo[];
  tasks?: TaskInfo[];
  activeTabId?: string;
  onCreateFolder: () => void;
  onToggleFolder: (id: string) => void;
  onOpenFile: (fileId: string, fileName: string, fileType: 'draft' | 'slide' | 'image' | 'guide') => void;
};

export default function WorkspaceSidebar({
  workspaceName,
  activeTab,
  setActiveTab,
  folders,
  tasks = [],
  activeTabId,
  onCreateFolder,
  onToggleFolder,
  onOpenFile
}: WorkspaceSidebarProps) {
  return (
    <div className="bg-transparent h-full w-[324px] flex flex-col shrink-0 py-4">
      {/* Title */}
      <div className="px-6 py-4 flex items-center h-[56px] shrink-0">
        <h2 className="font-semibold text-gray-900 text-base">{workspaceName || 'Workspace'}</h2>
      </div>

      {/* Projects / Assets Tabs */}
      <div className="px-4 mb-4 shrink-0">
        <div className="bg-gray-100/60 p-1 rounded-full flex gap-1 items-center">
          <button 
            onClick={() => setActiveTab('Sessions')}
            className={`flex-1 rounded-full py-1 text-sm font-medium transition-colors ${activeTab === 'Sessions' ? 'bg-white shadow-tab text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Tasks
          </button>
          <button 
            onClick={() => setActiveTab('Assets')}
            className={`flex-1 rounded-full py-1 text-sm font-medium transition-colors ${activeTab === 'Assets' ? 'bg-white shadow-tab text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Assets
          </button>
        </div>
      </div>

      {/* Upload file button for Assets Only */}
      {activeTab === 'Assets' && (
        <div className="px-4 mb-6 shrink-0">
          <button 
            className="w-full border border-gray-200 rounded-lg flex items-center justify-center gap-2 py-2 hover:bg-gray-50 transition-colors"
          >
            <Upload className="size-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-800">
              Upload file
            </span>
          </button>
        </div>
      )}

      {/* Item List */}
      <div className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto">
        
        {/* Persistent New Session List Item */}
        {activeTab === 'Sessions' && (
          <div className="flex flex-col gap-1 mb-2">
            <div 
              onClick={onCreateFolder}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors group cursor-pointer ${
                activeTabId === 'new_session' ? 'bg-blue-50/80' : 'hover:bg-gray-50'
              }`}
            >
              <div className="opacity-0 pointer-events-none">
                <ChevronRight className="size-3" />
              </div>
              <Plus className={`size-4 ${activeTabId === 'new_session' ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${activeTabId === 'new_session' ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                New task
              </span>
            </div>
          </div>
        )}
        
        {folders.map(folder => (
          <div key={folder.id} className="flex flex-col gap-1 mb-2">
            
            {/* Folder Header */}
            <div 
              onClick={() => {
                onToggleFolder(folder.id);
              }}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors group cursor-pointer ${
                activeTabId === folder.id ? 'bg-blue-50/80' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`transition-colors ${folder.children.length > 0 || activeTab === 'Assets' ? 'text-gray-400 group-hover:text-gray-600' : 'opacity-0'}`}>
                {folder.isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              </div>
              {activeTab === 'Sessions' ? (
                <MessageSquare className={`size-4 shrink-0 ${activeTabId === folder.id ? 'text-blue-600' : 'text-gray-500'}`} />
              ) : (
                <Folder className={`size-4 shrink-0 ${activeTabId === folder.id ? 'text-blue-600' : 'text-gray-500'}`} />
              )}
              <span className={`text-sm font-medium truncate pr-2 ${activeTabId === folder.id ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                {folder.name}
              </span>
              {tasks.some(t => t.status === 'running' && folder.children.some(c => c.id === t.targetTabId)) && (
                 <Loader2 className="size-3.5 text-indigo-400 animate-spin shrink-0 ml-auto" />
              )}
            </div>
            
            {/* Sub Items Container */}
            <div 
              className={`pl-6 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
                folder.isOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
              }`}
            >
              {folder.children.map(child => {
                const isActive = activeTabId === child.id;
                return (
                  <div 
                    key={child.id} 
                    onClick={() => onOpenFile(child.id, child.name, child.type)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      isActive ? 'bg-blue-50/80 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                       <CornerDownRight className={`size-3.5 ml-1 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} strokeWidth={2.5} />
                       <span className={`text-sm truncate ${isActive ? 'font-semibold' : ''}`}>{child.name}</span>
                    </div>
                    {tasks.some(t => t.status === 'running' && t.targetTabId === child.id) && (
                        <div className="flex gap-0.5 shrink-0 ml-2">
                           <div className="size-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                           <div className="size-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                           <div className="size-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    )}
                  </div>
                );
              })}
              
            </div>
            
          </div>
        ))}

        {/* Static Default File Items to show scrolling / structure */}
        {folders.length === 0 && (
          <div className="px-2 py-4 text-sm text-gray-400 text-center">
            {activeTab === 'Sessions' ? 'No tasks yet. Start a chat or click "New task".' : 'No assets uploaded yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
