import { 
  Plus, 
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import type { WorkspaceInfo } from '../App';

type SidebarStripProps = {
  workspaces: WorkspaceInfo[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function SidebarStrip({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  isSidebarOpen,
  onToggleSidebar
}: SidebarStripProps) {
  return (
    <div className="bg-black/5 h-full w-[64px] border-r border-[#e4e4e7] flex flex-col items-center py-4 shrink-0 transition-opacity duration-300">
      
      {/* Sidebar Toggle */}
      <div 
        className="size-10 flex items-center justify-center mb-6 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors"
        onClick={onToggleSidebar}
      >
        {isSidebarOpen ? <PanelLeftClose className="size-[20px]" /> : <PanelLeft className="size-[20px]" />}
      </div>
      
      {/* Workspaces List */}
      <div className="flex flex-col gap-4 items-center w-full">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          return (
            <div 
              key={ws.id}
              onClick={() => onSelectWorkspace(ws.id)}
              className={`size-10 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
                isActive 
                  ? 'bg-white shadow-surface border border-gray-200' 
                  : 'hover:bg-black/5 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`size-8 ${ws.color} text-white rounded flex items-center justify-center font-bold text-sm`}>
                {ws.initial}
              </div>
            </div>
          );
        })}
        
        {/* Create Workspace Button */}
        <div 
          onClick={onCreateWorkspace}
          className="size-10 flex items-center justify-center cursor-pointer mt-2 border border-dashed border-gray-400 rounded-full hover:bg-black/5 transition-colors"
        >
          <Plus className="size-[16px] text-gray-600" />
        </div>
      </div>

      {/* Avatar Placeholder */}
      <div className="mt-auto">
        <div className="size-8 rounded-full bg-indigo-500 border-2 border-white shadow-sm flex items-center justify-center text-xs text-white">MW</div>
      </div>
    </div>
  );
}
