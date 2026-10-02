import React, { useState, useEffect, useRef } from 'react';
import type { Member, ActivityItem } from '../../types';
import { supabase, sendBroadcastAnnouncement, getActivities } from '../../lib/supabase';
import { Hash, Send, Sparkles, Megaphone, BellRing, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ChatViewProps {
  currentUser: Member;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isBroadcast?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load existing broadcasts from Supabase
  const loadSupabaseMessages = async () => {
    try {
      const actRes = await getActivities();
      if (actRes && actRes.length > 0) {
        const formatted: ChatMessage[] = actRes.map(a => ({
          id: a.id,
          senderName: a.user_name || 'Admin',
          senderRole: 'Leadership',
          avatar: a.user_avatar,
          text: a.description || a.title,
          timestamp: a.timestamp || 'Today',
          isBroadcast: true
        }));
        setMessages(formatted.reverse());
      } else {
        // Default seed message
        setMessages([
          {
            id: 'seed-01',
            senderName: 'Marcus Vance',
            senderRole: 'Director',
            text: 'Welcome to the GODSPEED HQ Executive Broadcast Channel. All team announcements posted here are delivered live in real-time to all team members.',
            timestamp: '09:00 AM',
            isBroadcast: true
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading chat broadcasts:', err);
    }
  };

  // Subscribe to Supabase Realtime channel for live announcements across all team members
  useEffect(() => {
    loadSupabaseMessages();

    const channel = supabase
      .channel('public:activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        (payload) => {
          const newAct = payload.new as ActivityItem;
          const newMsg: ChatMessage = {
            id: newAct.id,
            senderName: newAct.user_name || 'Leader',
            senderRole: 'Leadership',
            text: newAct.description || newAct.title,
            timestamp: newAct.timestamp || 'Just now',
            isBroadcast: true
          };

          setMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg]);
          
          // Trigger live broadcast banner for all team members
          setBroadcastAlert(`📢 Broadcast from ${newMsg.senderName}: "${newMsg.text.slice(0, 60)}${newMsg.text.length > 60 ? '...' : ''}"`);
          setTimeout(() => setBroadcastAlert(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const messageContent = input.trim();
    setInput('');
    setIsSending(true);

    const localMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderName: currentUser.full_name,
      senderRole: currentUser.rank,
      avatar: currentUser.avatar_url,
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBroadcast: true
    };

    setMessages(prev => [...prev, localMessage]);

    // Send to Supabase database so all connected team members receive the live broadcast!
    await sendBroadcastAnnouncement(
      currentUser.full_name,
      currentUser.rank,
      messageContent
    );

    setIsSending(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Live Broadcast Notification Banner */}
      {broadcastAlert && (
        <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-2xl shadow-xl flex items-center justify-between border border-amber-400/40 animate-bounce">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-amber-100 flex-shrink-0" />
            <p className="text-xs font-bold">{broadcastAlert}</p>
          </div>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live Broadcast
          </span>
        </div>
      )}

      {/* Main Broadcast Chat Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card h-[620px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                # team-broadcast-channel
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live team announcements • Updates shared here are received by all team members in real-time
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Real-time Broadcast
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-md">
                {m.senderName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.senderName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-800/40">
                    {m.senderRole}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                </div>

                <div className="mt-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed shadow-xs">
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/80 dark:bg-slate-950/60">
          <input
            type="text"
            placeholder="Post a broadcast announcement to all team members..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast</span>
          </button>
        </form>

      </div>

    </div>
  );
};
