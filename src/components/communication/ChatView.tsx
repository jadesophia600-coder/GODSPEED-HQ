import React, { useState } from 'react';
import { Member } from '../../types';
import { MessageSquare, Send, Hash, Sparkles, User } from 'lucide-react';

interface ChatViewProps {
  currentUser: Member;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderName: 'Eleanor Sterling',
      senderRole: 'Gold Regional Lead',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      text: 'Global Leadership Summit scheduled for 09:00 AM BST tomorrow. All regional directors please confirm attendance.',
      timestamp: '09:42 AM'
    },
    {
      id: 'm2',
      senderName: 'David K. Ross',
      senderRole: 'Gold Regional Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      text: 'Americas Hub NYC team confirmed. Q4 PV numbers submitted for pre-review.',
      timestamp: '10:15 AM'
    }
  ]);

  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: `m-${Date.now()}`,
        senderName: currentUser.full_name,
        senderRole: currentUser.rank,
        avatar: currentUser.avatar_url,
        text: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInput('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100"># global-executive-channel</h3>
            <p className="text-[11px] text-slate-500">Official announcement broadcast & leadership updates</p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Official Channel
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-3 group">
            <img
              src={m.avatar}
              alt={m.senderName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.senderName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">{m.senderRole}</span>
                <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 max-w-xl">
                {m.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/40">
        <input
          type="text"
          placeholder="Broadcast a message to executive team..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
};
