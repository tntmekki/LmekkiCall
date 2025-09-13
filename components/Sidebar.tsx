import React from 'react';
import type { ChatContact } from '../types';
import { SearchIcon, MenuIcon } from './icons/Icons';
import Avatar from './Avatar';

interface SidebarProps {
  contacts: ChatContact[];
  onSelectChat: (id: string) => void;
  activeChatId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userAvatar: string;
  onOpenProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ contacts, onSelectChat, activeChatId, searchQuery, onSearchChange, userAvatar, onOpenProfile }) => {
  return (
    <div className="w-full max-w-sm flex flex-col border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={onOpenProfile} aria-label="Open user profile" className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 rounded-full">
              <Avatar src={userAvatar} alt="User Avatar" size="md" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">LmekkiCall</h1>
        </div>
        <button className="text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
          <MenuIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث أو ابدأ محادثة جديدة"
            className="w-full bg-slate-200 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-full py-2 pr-10 pl-4 transition"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {contacts.map((contact) => (
            <li
              key={contact.id}
              onClick={() => onSelectChat(contact.id)}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-colors duration-200 ${
                activeChatId === contact.id
                  ? 'bg-teal-500/20'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'
              }`}
            >
              <Avatar src={contact.avatar} alt={contact.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-semibold truncate text-slate-800 dark:text-slate-50">{contact.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{contact.lastMessageTime}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{contact.lastMessage}</p>
                    {contact.unreadCount > 0 && (
                        <span className="bg-teal-500 text-white text-xs font-bold rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                        {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                        </span>
                    )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;