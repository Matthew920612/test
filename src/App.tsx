import { useState } from 'react';
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
  type: 'draft' | 'slide' | 'image' | 'guide';
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
      assets: [],
      messages: [
        { id: 'm1', role: 'user', content: "Let's work on the brand identity!" },
        { id: 'm2', role: 'assistant', content: "Sounds great. I've created the initial draft and slides." }
      ],
      openTabs: [
        { id: 'c1', title: 'Brain V1.2', type: 'guide' },
        { id: 'c2', title: 'Pitch Deck', type: 'slide' }
      ],
      activeTabId: 'c1',
      chatContextFileId: 'c1',
      sessionState: 'active'
    },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('home');

  // Folders vs Assets View
  const [activeSidebarTab, setActiveSidebarTab] = useState<'Sessions' | 'Assets'>('Sessions');

  // Layout Session State
  const [selectedAgent, setSelectedAgent] = useState<'Slide' | 'Image' | 'Task' | null>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  // Derived state from active workspace
  const messages = activeWorkspace.messages;
  const openTabs = activeWorkspace.openTabs;
  const activeTabId = activeWorkspace.activeTabId;
  const sessionState = activeWorkspace.sessionState;

  // Helper macro to update active workspace state easily
  const updateWorkspace = (updates: Partial<WorkspaceInfo>) => {
     setWorkspaces(prev => prev.map(ws => ws.id === activeWorkspaceId ? { ...ws, ...updates } : ws));
  };

  const handleToggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
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
    const updatedWorkspaces = workspaces.map(ws => {
      if (ws.id === activeWorkspaceId) {
        const newFolder: FolderInfo = {
          id: `f${Date.now()}`,
          name: `New Session ${ws.folders.length + 1}`,
          isOpen: true,
          children: []
        };
        return {
          ...ws,
          folders: [newFolder, ...ws.folders],
          sessionState: 'new' as SessionState,
          messages: [],
          openTabs: [],
          activeTabId: newFolder.id,
          chatContextFileId: undefined
        };
      }
      return ws;
    });
    setWorkspaces(updatedWorkspaces);
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const handleToggleFolder = (folderId: string) => {
    setWorkspaces(workspaces.map(ws => {
      if (ws.id === activeWorkspaceId) {
        if (activeSidebarTab === 'Sessions') {
          return {
             ...ws,
             activeTabId: folderId,
             chatContextFileId: undefined,
             openTabs: ws.activeTabId === folderId ? ws.openTabs : [], // Clear tabs only if switching sessions
             folders: ws.folders.map(f => f.id === folderId ? { ...f, isOpen: ws.activeTabId === folderId ? !f.isOpen : true } : f)
          };
        } else {
           return {
             ...ws,
             activeTabId: folderId,
             chatContextFileId: undefined,
             openTabs: ws.activeTabId === folderId ? ws.openTabs : [],
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

  const handleSendMessage = (content: string) => {
    const newUserMsg: Message = { id: `m_${Date.now()}`, role: 'user', content };
    let newMessages = [...messages, newUserMsg];
    let newOpenTabs = [...openTabs];
    let newActiveTabId = activeTabId;
    let newSessionState = sessionState;
    let newFolders = [...activeWorkspace.folders];

    const lowerContent = content.toLowerCase();
    let effectiveAgent = selectedAgent;

    // Auto-select agent based on prompt keywords if no agent is currently selected
    if (!effectiveAgent) {
      if (lowerContent.includes('slide') || lowerContent.includes('ppt') || lowerContent.includes('幻灯片') || lowerContent.includes('演示')) {
        effectiveAgent = 'Slide';
        setSelectedAgent('Slide');
      } else if (lowerContent.includes('image') || lowerContent.includes('picture') || lowerContent.includes('图片') || lowerContent.includes('画') || lowerContent.includes('图')) {
        effectiveAgent = 'Image';
        setSelectedAgent('Image');
      }
    }

    // Auto-focus logic: If an agent is selected, switch to its corresponding tab if it exists
    if (effectiveAgent) {
      const targetType = effectiveAgent.toLowerCase() as 'slide' | 'image' | 'guide'; // Assuming 'task' might map differently later, but aligns with 'slide'/'image' for now
      const matchingTab = openTabs.find(t => t.type === targetType);
      if (matchingTab) {
        newActiveTabId = matchingTab.id;
      }
    }

    if (sessionState === 'new') {
      const newProjectId = `proj_${Date.now()}`;
      const draftFileId = `draft_${Date.now()}`;
      
      // Auto-create a Project folder and a Draft file inside it
      const newProject: FolderInfo = {
        id: newProjectId,
        name: 'Untitled Project',
        isOpen: true,
        children: [
          { id: draftFileId, name: 'Draft', type: 'draft' }
        ]
      };
      newFolders = [newProject, ...newFolders];
      
      // Auto-open Draft tab
      const draftTab: TabInfo = { id: draftFileId, title: 'Draft', type: 'draft' };
      newOpenTabs = [draftTab];
      newActiveTabId = draftFileId;
      newSessionState = 'active';
      
      setIsSidebarOpen(false); // Auto-collapse sidebar when starting active session
      setAgentState('drafting');
    }

    // Proceed with state updates
    updateWorkspace({
       messages: newMessages,
       folders: newFolders,
       openTabs: newOpenTabs,
       activeTabId: newActiveTabId,
       sessionState: newSessionState
    });

    // Command shortcuts interception before AI runs
    if (lowerContent === 'slide' || lowerContent === '/slide') {
      setTimeout(() => {
        handleGenerateOutput('slide');
        setAgentState('idle'); 
      }, 100);
      return;
    }
    if (lowerContent === 'image' || lowerContent === '/image') {
      setTimeout(() => {
        handleGenerateOutput('image');
        setAgentState('idle');
      }, 100);
      return;
    }

    // Run real AI chat request
    const runAI = async () => {
      try {
        const assistantMsgId = `m_${Date.now()+1}`;
        // Create an empty assistant message first
        setWorkspaces(prev => prev.map(ws => ws.id === activeWorkspaceId ? {
          ...ws,
          messages: [...ws.messages, { id: assistantMsgId, role: 'assistant', content: "" }]
        } : ws));

        // Start stream using the history so far
        const stream = generateChatResponseStream(newMessages);
        let accumulatedText = "";
        
        for await (const chunk of stream) {
           accumulatedText += chunk;
           setWorkspaces(prev => prev.map(ws => {
              if (ws.id === activeWorkspaceId) {
                 const msgs = [...ws.messages];
                 const lastMsg = msgs[msgs.length - 1];
                 if (lastMsg.id === assistantMsgId) {
                    // Create a new object for immutability
                    msgs[msgs.length - 1] = { ...lastMsg, content: accumulatedText };
                 }
                 return { ...ws, messages: msgs };
              }
              return ws;
           }));
        }
        
        if (sessionState === 'new') {
           setAgentState('complete'); // Move to complete to show next actions
        }
      } catch (err: any) {
        console.error(err);
        setWorkspaces(prev => prev.map(ws => ws.id === activeWorkspaceId ? {
          ...ws,
          messages: [...ws.messages, { id: `err_${Date.now()}`, role: 'assistant', content: `Error: ${err.message}` }]
        } : ws));
      }
    };
    
    runAI();
  };

  const handleGenerateOutput = (type: 'slide' | 'image') => {
    const fileId = `file_${Date.now()}`;
    
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
    const baseTitle = type === 'slide' ? `Pitch Deck ${index}` : `Generated Image ${index}`;
    const fileName = type === 'slide' ? `${baseTitle}.slide` : `${baseTitle}.png`;

    // 1. Add file to the Untitled Project folder for the ACTIVE workspace
    setWorkspaces(workspaces.map(ws => {
      if (ws.id === activeWorkspaceId) {
        const untitledFolderId = ws.folders.find(f => f.name === 'Untitled Project')?.id;
        let newFolders = ws.folders;
        if (untitledFolderId) {
          newFolders = ws.folders.map(f => {
            if (f.id === untitledFolderId) {
              return {
                ...f,
                children: [...f.children, { id: fileId, name: fileName, type }]
              };
            }
            return f;
          });
        }
        return { 
          ...ws, 
          folders: newFolders,
          openTabs: [...ws.openTabs, { id: fileId, title: baseTitle, type }],
          activeTabId: fileId,
          chatContextFileId: fileId,
          messages: [...ws.messages, {
            id: `m_${Date.now()+1}`,
            role: 'assistant',
            content: `I've generated the ${type === 'slide' ? 'slides' : 'images'} for you! You can view them in the main panel and they've been saved to your project folder.`
          }]
        };
      }
      return ws;
    }));

    setAgentState('idle'); // clear suggested actions
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = openTabs.filter(t => t.id !== tabId);
    updateWorkspace({
      openTabs: newTabs,
      activeTabId: activeTabId === tabId && newTabs.length > 0 ? newTabs[newTabs.length - 1].id : (activeTabId === tabId ? '' : activeTabId)
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
              sessionState === 'new' || openTabs.length === 0 ? 'flex-1' : 'w-[380px]'
            }`}
          >
            <ChatPanel 
              onSendMessage={handleSendMessage} 
              sessionState={sessionState} 
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              onClearAgent={() => setSelectedAgent(null)}
              messages={messages}
              agentState={agentState}
              onGenerateOutput={handleGenerateOutput}
              activeFileContextName={openTabs.find(t => t.id === activeWorkspace.chatContextFileId)?.title}
              onClearFileContext={() => updateWorkspace({ chatContextFileId: undefined })}
            />
          </div>

          {/* 3. Right Main Content Panel */}
          <div 
            className={`bg-[white] rounded-[16px] flex flex-col relative overflow-hidden transition-all duration-300 ease-in-out ${
              sessionState === 'new' || openTabs.length === 0 ? 'w-0 opacity-0 min-w-0' : 'flex-1 min-w-[400px] opacity-100'
            }`}
          >
            <MainContent 
              onSelectAgent={setSelectedAgent}
              openTabs={openTabs}
              activeTabId={activeTabId}
              onSetActiveTab={(tabId) => updateWorkspace({ activeTabId: tabId, chatContextFileId: tabId })}
              onCloseTab={handleCloseTab}
            />
          </div>
        </>
      )}

    </div>
  );
}

export default App;
