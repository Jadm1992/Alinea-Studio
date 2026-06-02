import React, { useState } from 'react';
import { ChatSession } from '../types';
import { MessageSquare, Plus, Trash2, Edit3, Check, X, MessageSquareCode, Download } from 'lucide-react';
import { exportSessionToMarkdown, triggerDownload } from '../utils/exportUtils';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  onCloseMobile?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onClearAllSessions,
  onCloseMobile,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const startEditing = (id: string, title: string) => {
    setEditingSessionId(id);
    setEditTitleValue(title);
  };

  const saveRename = (id: string) => {
    if (editTitleValue.trim()) {
      onRenameSession(id, editTitleValue.trim());
    }
    setEditingSessionId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveRename(id);
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };

  return (
      <div className="h-full flex flex-col w-full select-none transition-colors duration-300" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', borderRightWidth: '1px' }}>
        {/* Brand Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <MessageSquareCode className="w-4.5 h-4.5" style={{ color: 'var(--theme-highlight)' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider uppercase leading-none" style={{ color: 'var(--theme-text-primary)' }}>
                Alinea Studio
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onCloseMobile && (
              <button onClick={onCloseMobile} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

      {/* New Session Action */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewSession();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl transition text-xs font-semibold tracking-wide border hover:opacity-80 active:scale-95"
          style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
        >
          <Plus className="w-4 h-4" style={{ color: 'var(--theme-highlight)' }} />
          <span>New Thread</span>
        </button>
      </div>

      {/* Conversation Thread History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2">
        <div className="px-2 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
            Active Chats
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 px-4 text-center text-[var(--theme-text-muted)] text-[11px] font-mono">
            No active chats. Complete your setup or click 'New Thread' above.
          </div>
        ) : (
          <div className="space-y-0.5">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = session.id === editingSessionId;

              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                    isActive
                      ? 'bg-[var(--theme-surface-hover)] border border-[var(--theme-text-muted)]/30 text-[var(--theme-text-primary)] shadow-sm'
                      : 'text-[var(--theme-text-muted)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)] border border-transparent'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? 'var(--theme-highlight)' : 'var(--theme-text-muted)' }} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onBlur={() => saveRename(session.id)}
                        onKeyDown={(e) => handleKeyPress(e, session.id)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none border"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                      />
                    ) : (
                      <span className="font-medium truncate pr-8 leading-relaxed">
                        {session.title}
                      </span>
                    )}
                  </div>

                  {/* Actions overlay */}
                  {!isEditing && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session.id, session.title);
                        }}
                        className="p-1 rounded hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition"
                        title="Rename Thread"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 rounded hover:bg-[var(--theme-border)] text-[var(--theme-text-primary)] hover:text-rose-400 transition"
                        title="Delete Thread"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-0.5 ml-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => saveRename(session.id)}
                        className="p-1 rounded transition"
                        style={{ color: 'var(--theme-highlight)' }}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingSessionId(null)}
                        className="p-1 rounded transition opacity-50 hover:opacity-100"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dock Controls for Workspace and Purge */}
      <div className="p-3 border-t space-y-2 transition-colors duration-300" style={{ borderColor: 'var(--theme-border)' }}>
        {sessions.length > 0 && (
          <>
            <button
              onClick={() => {
                const active = sessions.find(s => s.id === activeSessionId);
                if (active) {
                  const content = exportSessionToMarkdown(active);
                  triggerDownload(content, `${active.title.replace(/\s+/g, '_')}.md`);
                }
              }}
              className="w-full h-9 flex items-center justify-center gap-1.5 rounded-lg transition text-xs font-medium border opacity-80 hover:opacity-100"
              style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Chat (.md)</span>
            </button>
            <button
            onClick={onClearAllSessions}
            className="w-full h-9 flex items-center justify-center gap-1.5 rounded-lg transition text-xs font-medium opacity-50 hover:opacity-100"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge All Message History</span>
          </button>
          </>
        )}
      </div>
    </div>
  );
};
