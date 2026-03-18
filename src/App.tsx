import { useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import SidebarStrip from './components/SidebarStrip';
import WorkspaceSidebar from './components/WorkspaceSidebar';
import ChatPanel from './components/ChatPanel';
import MainContent from './components/MainContent';
import WorkspaceCreator from './components/WorkspaceCreator';
import { generateChatResponseStream } from './lib/gemini';

export type FolderInfo = {
  id: string;
  name: string;
  isOpen: boolean;
  messages?: Message[];
  sessionState?: SessionState;
  children: { id: string; name: string, type: 'draft' | 'slide' | 'image' | 'guide' }[];
};

export type WorkspaceInfo = {
  id: string;
  name: string;
  color: string;
  initial: string;
  folders: FolderInfo[];
  assets: FolderInfo[];
  messages: Message[];
  openTabs: TabInfo[];
  activeTabId: string;
  chatContextFileId?: string;
  sessionState: SessionState;
};

export type TabInfo = {
  id: string;
  title: string;
  type: 'draft' | 'slide' | 'image' | 'guide' | 'folder';
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type AgentState = 'idle' | 'drafting' | 'complete';

export type SessionState = 'new' | 'active';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([
    { 
      id: 'home', 
      name: 'Home', 
      color: 'bg-gray-100', // Home doesn't need a bright color
      initial: '', // Rendered as an icon in SidebarStrip
      folders: [],
      assets: [],
      messages: [],
      openTabs: [],
      activeTabId: '',
      chatContextFileId: undefined,
      sessionState: 'new'
    },
    { 
      id: 'ws1', 
      name: 'Workspace 1', 
      color: 'bg-blue-600', 
      initial: 'D',
      folders: [
        {
          id: 'f1',
          name: 'AI Brand Identity Extractor',
          isOpen: true,
          children: [
            { id: 'c1', name: 'Brain V1.2', type: 'guide' },
            { id: 'c2', name: 'Pitch Deck.slide', type: 'slide' },
            { id: 'c3', name: 'Assets.png', type: 'image' },
          ]
        }
      ],
      assets: [
        {
          id: 'a1',
          name: 'Logos & Branding',
          isOpen: true,
          children: [
            { id: 'img1', name: 'Primary_Logo.png', type: 'image' },
            { id: 'img2', name: 'Brand_Guidelines', type: 'guide' },
          ]
        },
        {
          id: 'a2',
          name: 'Marketing Material',
          isOpen: false,
          children: [
            { id: 'img3', name: 'Promo_Banner.png', type: 'image' },
          ]
        }
      ],
      messages: [
        { id: 'm1', role: 'user', content: "Let's work on the brand identity!" },
        { id: 'm2', role: 'assistant', content: "Sounds great. I've created the initial draft and slides." }
      ],
      openTabs: [
        { id: 'c1', title: 'Brain V1.2', type: 'guide' },
        { id: 'c2', title: 'Pitch Deck', type: 'slide' }
      ],
      activeTabId: 'new_session',
      chatContextFileId: undefined,
      sessionState: 'new'
    },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('home');

  // Folders vs Assets View
  const [activeSidebarTab, setActiveSidebarTab] = useState<'Sessions' | 'Assets'>('Sessions');

  // Layout Session State
  const [selectedAgent, setSelectedAgent] = useState<'Slide' | 'Image' | 'Task' | null>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  // Derived state from active workspace
  const openTabs = activeWorkspace.openTabs;
  const activeTabId = activeWorkspace.activeTabId;
  const sessionState = activeWorkspace.sessionState;

  let activeFolder = undefined;
  
  if (activeTabId !== 'new_session') {
    activeFolder = activeWorkspace.folders.find(f => f.id === activeTabId) 
      || activeWorkspace.assets.find(f => f.id === activeTabId);
    
    if (!activeFolder) {
      activeFolder = activeWorkspace.folders.find(f => f.children.some(c => c.id === activeTabId))
        || activeWorkspace.assets.find(f => f.children.some(c => c.id === activeTabId));
    }
    
    if (!activeFolder && activeWorkspace.folders.length > 0) {
      activeFolder = activeWorkspace.folders[0];
    }
  }

  const activeFolderId = activeFolder?.id;
  const sessionFiles = activeFolder ? activeFolder.children : [];

  const currentMessages = activeFolder?.messages || activeWorkspace.messages;
  const currentSessionState = activeFolder?.sessionState || (activeFolder && activeFolder.children.length > 0 ? 'active' : activeWorkspace.sessionState);

  // Helper macro to update active workspace state easily
  const updateWorkspace = (updates: Partial<WorkspaceInfo>) => {
     setWorkspaces(prev => prev.map(ws => ws.id === activeWorkspaceId ? { ...ws, ...updates } : ws));
  };

  const handleToggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    setWorkspaces(prev => prev.map(ws => 
      ws.id === id ? { ...ws, activeTabId: 'new_session', chatContextFileId: undefined, sessionState: 'new' as SessionState } : ws
    ));
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };
  
  const handleInitiateCreateWorkspace = () => {
    setIsCreatingWorkspace(true);
    setIsSidebarOpen(false); // Auto collapse sidebar on workspace creation
  };
  
  const handleConfirmCreateWorkspace = (templateId: string) => {
    const newId = `ws${workspaces.length + 1}`;
    let initialFolders: FolderInfo[] = [];
    
    if (templateId === 'Marketing') {
       initialFolders = [{ id: 'f1', name: 'Campaign Assets', isOpen: true, children: [] }];
    } else if (templateId === 'Product') {
       initialFolders = [{ id: 'f1', name: 'Launch Plan', isOpen: true, children: [] }];
    }

    const newWs: WorkspaceInfo = {
      id: newId,
      name: templateId === 'blank' ? `Workspace ${workspaces.length + 1}` : `${templateId} Workspace`,
      color: 'bg-indigo-500', 
      initial: `W${workspaces.length + 1}`,
      folders: initialFolders,
      assets: [],
      messages: [],
      openTabs: [],
      activeTabId: '',
      sessionState: 'new'
    };
    setWorkspaces([...workspaces, newWs]);
    setActiveWorkspaceId(newId);
    setIsCreatingWorkspace(false);
    
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const handleCreateFolder = () => {
    updateWorkspace({ 
      activeTabId: 'new_session',
      chatContextFileId: undefined,
      sessionState: 'new'
    });
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const handleToggleFolder = (folderId: string) => {
    setWorkspaces(workspaces.map(ws => {
      if (ws.id === activeWorkspaceId) {
        if (activeSidebarTab === 'Sessions') {
          return {
             ...ws,
             activeTabId: folderId,
             chatContextFileId: ws.folders.find(f => f.id === folderId)?.children.length ? folderId : undefined,
             openTabs: ws.openTabs,
             folders: ws.folders.map(f => f.id === folderId ? { ...f, isOpen: ws.activeTabId === folderId ? !f.isOpen : true } : f)
          };
        } else {
           return {
             ...ws,
             activeTabId: folderId,
             chatContextFileId: undefined,
             openTabs: ws.openTabs,
             assets: ws.assets.map(a => a.id === folderId ? { ...a, isOpen: ws.activeTabId === folderId ? !a.isOpen : true } : a)
           };
        }
      }
      return ws;
    }));
  };

  const handleOpenFile = (fileId: string, fileName: string, fileType: 'draft' | 'slide' | 'image' | 'guide') => {
    // Check if tab already open
    const existingTab = openTabs.find(t => t.id === fileId);
    if (existingTab) {
      updateWorkspace({ 
        activeTabId: fileId,
        chatContextFileId: fileId,
        sessionState: sessionState === 'new' ? 'active' : sessionState
      });
    } else {
      const newTab: TabInfo = {
        id: fileId,
        title: fileName.replace('.slide', '').replace('.png', ''),
        type: fileType
      };
      updateWorkspace({ 
        openTabs: [...openTabs, newTab],
        activeTabId: fileId,
        chatContextFileId: fileId,
        sessionState: sessionState === 'new' ? 'active' : sessionState
      });
    }
  };

  const handleSyncTabSelection = (tabId: string) => {
    let updatedFolders = activeWorkspace.folders;
    let updatedAssets = activeWorkspace.assets;
    let changed = false;

    const parentFolder = activeWorkspace.folders.find(f => f.children.some(c => c.id === tabId)) 
      || activeWorkspace.assets.find(f => f.children.some(c => c.id === tabId));
      
    if (parentFolder && !parentFolder.isOpen) {
      changed = true;
      const inFolders = activeWorkspace.folders.some(f => f.id === parentFolder.id);
      if (inFolders) {
        updatedFolders = activeWorkspace.folders.map(f => f.id === parentFolder.id ? { ...f, isOpen: true } : f);
      } else {
        updatedAssets = activeWorkspace.assets.map(f => f.id === parentFolder.id ? { ...f, isOpen: true } : f);
      }
    }

    if (tabId !== activeTabId || changed) {
       updateWorkspace({ 
          activeTabId: tabId, 
          chatContextFileId: tabId, 
          folders: updatedFolders, 
          assets: updatedAssets 
       });
    } else {
       updateWorkspace({ chatContextFileId: tabId });
    }
  };

  const handleSendMessage = (content: string, shortcut: string | null = null) => {
    const newUserMsg: Message = { id: `m_${Date.now()}`, role: 'user', content };
    const isCurrentlyNew = currentSessionState === 'new';
    
    let newActiveTabId = activeTabId;
    let autoCollapsedSidebar = false;

    // Command shortcuts interception before AI runs
    const lowerContent = content.toLowerCase();
    let effectiveAgent = selectedAgent;
    if (!effectiveAgent) {
      if (lowerContent.includes('slide') || lowerContent.includes('ppt') || lowerContent.includes('幻灯片') || lowerContent.includes('演示')) {
        effectiveAgent = 'Slide';
        setSelectedAgent('Slide');
      } else if (lowerContent.includes('image') || lowerContent.includes('picture') || lowerContent.includes('图片') || lowerContent.includes('画') || lowerContent.includes('图')) {
        effectiveAgent = 'Image';
        setSelectedAgent('Image');
      }
    }
    if (effectiveAgent) {
      const targetType = effectiveAgent.toLowerCase() as 'slide' | 'image' | 'guide';
      const matchingTab = openTabs.find(t => t.type === targetType);
      if (matchingTab) {
        newActiveTabId = matchingTab.id;
      }
    }

    let targetFolderId = activeFolderId;
    let isAutoGeneratingFolder = false;

    if (activeTabId === 'new_session' || !targetFolderId || !activeWorkspace.folders.some(f => f.id === targetFolderId)) {
        if (activeTabId === 'new_session' || activeWorkspace.folders.length === 0) {
            targetFolderId = `folder_${Date.now()}`;
            isAutoGeneratingFolder = true;
        } else {
            targetFolderId = activeWorkspace.folders[0].id;
        }
    }

    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === activeWorkspaceId) {
        let updatedFolders = ws.folders;
        if (isAutoGeneratingFolder) {
            const newFolder = {
                id: targetFolderId!,
                name: 'Untitled Session',
                children: [],
                isOpen: true,
                messages: [],
                sessionState: 'new' as SessionState
            };
            updatedFolders = [newFolder, ...updatedFolders];
        }

        let targetFolder = updatedFolders.find(f => f.id === targetFolderId);
        
        let newOpenTabs = ws.openTabs;
        let finalMessages = currentMessages;

        if (targetFolder) {
          const oldMsgs = targetFolder.messages || ws.messages;
          finalMessages = [...oldMsgs, newUserMsg];
          updatedFolders = updatedFolders.map(f => {
            if (f.id === targetFolder!.id) {
               return {
                  ...f,
                  messages: finalMessages,
                  sessionState: 'active' as SessionState,
                  name: isCurrentlyNew || isAutoGeneratingFolder ? 'Untitled Session' : f.name,
                  children: isCurrentlyNew || isAutoGeneratingFolder ? [] : f.children
               };
            }
            return f;
          });
          
          if (isCurrentlyNew || isAutoGeneratingFolder) {
            newActiveTabId = targetFolder!.id;
            const draftFileId = updatedFolders.find(f => f.id === targetFolder!.id)?.children[0]?.id;
            if (draftFileId) {
              newOpenTabs = [{ id: draftFileId, title: 'Draft', type: 'draft' as any }, ...ws.openTabs];
              newActiveTabId = draftFileId;
              autoCollapsedSidebar = true;
            }
          }
        }

        return {
          ...ws,
          folders: updatedFolders,
          messages: finalMessages, // optionally keep workspace fallback synced
          sessionState: 'active' as SessionState,
          openTabs: newOpenTabs,
          activeTabId: newActiveTabId
        };
      }
      return ws;
    }));

    if (autoCollapsedSidebar) setIsSidebarOpen(false);
    if (isCurrentlyNew || isAutoGeneratingFolder) setAgentState('drafting');

    if (shortcut === 'slide' || lowerContent === 'slide' || lowerContent === '/slide') {
      setTimeout(() => { handleGenerateOutput('slide', targetFolderId!); setAgentState('idle'); }, 100);
      return;
    }
    if (shortcut === 'draft' || lowerContent === 'draft' || lowerContent === '/draft' || lowerContent.includes('draft') || lowerContent.includes('document')) {
      setTimeout(() => { handleGenerateOutput('draft', targetFolderId!); setAgentState('idle'); }, 100);
      return;
    }
    if (shortcut === 'social_image' || shortcut === 'long_image' || lowerContent === 'image' || lowerContent === '/image') {
      setTimeout(() => { handleGenerateOutput('image', targetFolderId!); setAgentState('idle'); }, 100);
      return;
    }

    // Run real AI chat request
    const runAI = async () => {
      try {
        const assistantMsgId = `m_${Date.now()+1}`;
        setWorkspaces(prev => prev.map(ws => {
          if (ws.id === activeWorkspaceId) {
             const preUpdatedFolders = ws.folders.map(f => {
               if (f.id === targetFolderId) {
                 return { ...f, messages: [...(f.messages || ws.messages), { id: assistantMsgId, role: 'assistant' as 'assistant', content: "" }] };
               }
               return f;
             });
             return { ...ws, folders: preUpdatedFolders, messages: [...ws.messages, { id: assistantMsgId, role: 'assistant' as 'assistant', content: "" }] };
          }
          return ws;
        }));

        const historyForStream = [...currentMessages, newUserMsg];
        const stream = generateChatResponseStream(historyForStream);
        let accumulatedText = "";
        
        for await (const chunk of stream) {
           accumulatedText += chunk;
           setWorkspaces(prev => prev.map(ws => {
              if (ws.id === activeWorkspaceId) {
                 const midUpdatedFolders = ws.folders.map(f => {
                   if (f.id === targetFolderId) {
                     const msgs = [...(f.messages || [])];
                     const lastMsg = msgs[msgs.length - 1];
                     if (lastMsg && lastMsg.id === assistantMsgId) msgs[msgs.length - 1] = { ...lastMsg, content: accumulatedText };
                     return { ...f, messages: msgs };
                   }
                   return f;
                 });
                 
                 const wsMsgs = [...ws.messages];
                 if (wsMsgs[wsMsgs.length - 1]?.id === assistantMsgId) wsMsgs[wsMsgs.length - 1] = { ...wsMsgs[wsMsgs.length - 1], content: accumulatedText };

                 return { ...ws, folders: midUpdatedFolders, messages: wsMsgs };
              }
              return ws;
           }));
        }
        if (isCurrentlyNew || isAutoGeneratingFolder) setAgentState('complete');
      } catch (err: any) {
        console.error(err);
      }
    };
    
    runAI();
  };

  const handleGenerateOutput = (type: 'slide' | 'image' | 'draft', overrideFolderId?: string) => {
    const fileId = `file_${Date.now()}`;
    const targetId = overrideFolderId || activeFolderId;
    
    // Count existing files of this type in the active workspace
    const activeWs = workspaces.find(w => w.id === activeWorkspaceId);
    let count = 0;
    if (activeWs) {
      activeWs.folders.forEach(f => {
        f.children.forEach(c => {
          if (c.type === type) count++;
        });
      });
      activeWs.assets.forEach(f => {
        f.children.forEach(c => {
          if (c.type === type) count++;
        });
      });
    }
    const index = count + 1;
    const baseTitle = type === 'slide' ? `Pitch Deck ${index}` : type === 'image' ? `Generated Image ${index}` : `Draft ${index}`;
    const fileName = type === 'slide' ? `${baseTitle}.slide` : type === 'image' ? `${baseTitle}.png` : `${baseTitle}`;

    const assistantMsg: Message = {
      id: `m_${Date.now()+1}`,
      role: 'assistant',
      content: `I've generated the ${type === 'slide' ? 'slides' : type === 'image' ? 'images' : 'draft'} for you! You can view them in the main panel and they've been saved to your session folder.`
    };

    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === activeWorkspaceId) {
        let newFolders = ws.folders.map(f => {
          if (f.id === targetId) {
             return { 
                ...f, 
                children: [...f.children, { id: fileId, name: fileName, type }],
                messages: [...(f.messages || []), assistantMsg]
             };
          }
          return f;
        });

        return { 
          ...ws, 
          folders: newFolders,
          openTabs: [...ws.openTabs, { id: fileId, title: baseTitle, type }],
          activeTabId: fileId,
          chatContextFileId: fileId,
          messages: [...ws.messages, assistantMsg]
        };
      }
      return ws;
    }));

    setAgentState('idle'); // clear suggested actions
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = openTabs.filter(t => t.id !== tabId);
    
    const visibleTabs = newTabs.filter(t => sessionFiles.some(f => f.id === t.id));
    const oldVisibleTabs = openTabs.filter(t => sessionFiles.some(f => f.id === t.id));
    const currentIndex = oldVisibleTabs.findIndex(t => t.id === tabId);
    
    let newActiveTabId = activeTabId;
    if (activeTabId === tabId) {
      newActiveTabId = visibleTabs.length > 0 
        ? (currentIndex > 0 ? visibleTabs[currentIndex - 1].id : visibleTabs[0].id)
        : (activeFolderId || '');
    }

    updateWorkspace({
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      chatContextFileId: newActiveTabId
    });
  };

  return (
    <div className="w-full h-screen bg-[#e2e2e2] p-4 flex gap-4 overflow-hidden min-w-[1280px]">
      
      {/* 1. Left Sidebar (Unified styling container) */}
      <div 
        className={`flex bg-white rounded-[16px] h-full overflow-hidden flex-shrink-0 relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[388px]' : 'w-[64px]'}`}
      >
        <SidebarStrip 
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={(id) => {
            handleSelectWorkspace(id);
            setIsCreatingWorkspace(false); // Close creator if user switches
          }}
          onCreateWorkspace={handleInitiateCreateWorkspace}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />
        
        <div className={`transition-opacity duration-300 ease-in-out w-[324px] shrink-0 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <WorkspaceSidebar 
            workspaceName={activeWorkspace?.name}
            activeTab={activeSidebarTab}
            setActiveTab={setActiveSidebarTab}
            folders={activeSidebarTab === 'Sessions' ? activeWorkspace.folders : activeWorkspace.assets}
            activeTabId={activeTabId}
            onCreateFolder={handleCreateFolder}
            onToggleFolder={handleToggleFolder}
            onOpenFile={handleOpenFile}
          />
        </div>
      </div>

      {/* 2. Middle and Right Panels */}
      {isCreatingWorkspace ? (
        <div className="flex-1 min-w-0 h-full flex flex-col relative transition-all duration-300 ml-2">
           <WorkspaceCreator 
             onCancel={() => setIsCreatingWorkspace(false)}
             onCreate={handleConfirmCreateWorkspace}
           />
        </div>
      ) : (
        <>
          {/* 2. Middle Chat Panel */}
          <div 
            className={`bg-white/80 backdrop-blur-md rounded-[16px] h-full overflow-hidden flex-shrink-0 shadow-[0px_1px_3px_0px_rgba(25,33,61,0.1)] border border-[#e4e4e7] flex flex-col relative transition-all duration-300 ease-in-out ${
              !activeWorkspace.chatContextFileId ? 'flex-1' : 'w-[380px]'
            }`}
          >
            <ChatPanel 
              onSendMessage={handleSendMessage} 
              sessionState={currentSessionState} 
              messages={currentMessages}
              agentState={agentState}
              onGenerateOutput={handleGenerateOutput}
              activeFileContextName={
                activeWorkspace.chatContextFileId === activeFolderId 
                  ? undefined 
                  : openTabs.find(t => t.id === activeWorkspace.chatContextFileId)?.title
              }
              onClearFileContext={() => updateWorkspace({ chatContextFileId: undefined })}
              sessionFiles={sessionFiles}
              onSelectFileContext={(id) => handleSyncTabSelection(id)}
            />
          </div>

          {/* 3. Right Main Content Panel */}
          <div 
            className={`bg-[white] rounded-[16px] flex flex-col relative overflow-hidden transition-all duration-300 ease-in-out ${
              !activeWorkspace.chatContextFileId ? 'w-0 opacity-0 min-w-0 border-0 ml-0' : 'flex-1 min-w-[400px] opacity-100 ml-4 border border-[#e4e4e7]'
            }`}
          >
            <MainContent 
              onSelectAgent={setSelectedAgent}
              openTabs={
                sessionFiles.length > 0 && activeFolderId
                  ? [{ id: activeFolderId, title: 'Session Files', type: 'folder' } as any, ...openTabs.filter(t => sessionFiles.some(f => f.id === t.id))]
                  : openTabs.filter(t => sessionFiles.some(f => f.id === t.id))
              }
              activeTabId={activeWorkspace.chatContextFileId || ''}
              onSetActiveTab={handleSyncTabSelection}
              onCloseTab={handleCloseTab}
              sessionFiles={sessionFiles}
              onOpenFile={(id, name, type) => handleOpenFile(id, name, type)}
              onManualCollapse={() => updateWorkspace({ chatContextFileId: undefined, activeTabId: activeFolderId })}
            />
          </div>

          {/* Floating Expand Handle */}
          {!activeWorkspace.chatContextFileId && sessionFiles.length > 0 && (
            <button 
              onClick={() => {
                updateWorkspace({ 
                  chatContextFileId: activeTabId === 'new_session' || !activeTabId ? sessionFiles[0].id : (activeTabId === activeFolderId ? sessionFiles[0].id : activeTabId)
                });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-[#e4e4e7] border-r-0 rounded-l-xl p-1.5 pl-2 shadow-[-4px_0_12px_rgb(0,0,0,0.06)] hover:bg-gray-50 hover:pr-3 transition-all z-50 text-gray-500 hover:text-gray-900 group flex items-center justify-center cursor-pointer"
              title="Expand Panel"
            >
              <PanelLeftOpen className="size-[18px] rotate-180 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </>
      )}

    </div>
  );
}

export default App;
