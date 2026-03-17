import { Plus, FolderOpen, FolderClosed, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import type { FolderInfo } from '../App';

type WorkspaceSidebarProps = {
  workspaceName?: string;
  activeTab: 'Projects' | 'Assets';
  setActiveTab: (tab: 'Projects' | 'Assets') => void;
  folders: FolderInfo[];
  onCreateFolder: () => void;
  onToggleFolder: (id: string) => void;
  onOpenFile: (fileId: string, fileName: string, fileType: 'draft' | 'slide' | 'image' | 'guide') => void;
};

export default function WorkspaceSidebar({
  workspaceName,
  activeTab,
  setActiveTab,
  folders,
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
            onClick={() => setActiveTab('Projects')}
            className={`flex-1 rounded-full py-1 text-sm font-medium transition-colors ${activeTab === 'Projects' ? 'bg-white shadow-tab text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Projects
          </button>
          <button 
            onClick={() => setActiveTab('Assets')}
            className={`flex-1 rounded-full py-1 text-sm font-medium transition-colors ${activeTab === 'Assets' ? 'bg-white shadow-tab text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Assets
          </button>
        </div>
      </div>

      {/* Create new button */}
      <div className="px-4 mb-6 shrink-0">
        <button 
          onClick={onCreateFolder}
          className="w-full border border-gray-200 rounded-lg flex items-center justify-center gap-2 py-2 hover:bg-gray-50 transition-colors"
        >
          <Plus className="size-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-800">Create new</span>
        </button>
      </div>

      {/* Item List */}
      <div className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto">
        
        {folders.map(folder => (
          <div key={folder.id} className="flex flex-col gap-1 mb-2">
            
            {/* Folder Header */}
            <div 
              onClick={() => onToggleFolder(folder.id)}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors group"
            >
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                {folder.isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              </div>
              {folder.isOpen ? (
                <FolderOpen className="size-4 text-gray-500" />
              ) : (
                <FolderClosed className="size-4 text-gray-500" />
              )}
              <span className="text-sm text-gray-900 font-medium">{folder.name}</span>
            </div>
            
            {/* Sub Items Container */}
            <div 
              className={`pl-6 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
                folder.isOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
              }`}
            >
              {folder.children.map(child => (
                <div 
                  key={child.id} 
                  onClick={() => onOpenFile(child.id, child.name, child.type)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                >
                  <FileText className="size-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{child.name}</span>
                </div>
              ))}
              
              {/* Optional: Add a subtle 'Empty' state if child is empty and folder is open */}
              {folder.isOpen && folder.children.length === 0 && (
                <div className="p-2 text-xs text-gray-400 italic">Empty Folder</div>
              )}
            </div>
            
          </div>
        ))}

        {/* Static Default File Items to show scrolling / structure */}
        {folders.length === 0 && (
          <div className="px-2 py-4 text-sm text-gray-400 text-center">
            {activeTab === 'Projects' ? 'No projects yet. Start a chat or click "Create new".' : 'No assets uploaded yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
