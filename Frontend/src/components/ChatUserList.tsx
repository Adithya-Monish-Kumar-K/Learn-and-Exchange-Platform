import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { User } from '../types/ChatUser';

interface ChatUserListProps {
  users: User[];
  selectedUserId: string | null;
  onUserSelect: (user: User) => void;
  onNewRequest: () => void;
  onViewRequests: () => void;
}

const ChatUserList: React.FC<ChatUserListProps> = ({
  users,
  selectedUserId,
  onUserSelect,
  onNewRequest,
  onViewRequests,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="w-full h-full flex flex-col border-r"
      style={{ borderColor: 'var(--card-border)' }}
    >
      {/* Header with search and filters */}
      <div
        className="p-4 border-b"
        style={{
          borderColor: 'var(--card-border)',
          background: 'var(--card-background)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-lg font-semibold"
          >
            Messages
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onNewRequest}
              className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--chat-primary-hover)] transition-colors"
              style={{ background: 'var(--chat-primary)', color: 'white' }}
            >
              New Request
            </button>
          </div>
        </div>
        <div className="relative ">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pr-10"
          />
          <Search
            className="absolute right-3 top-2.5 w-5 h-5"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
        <button
          onClick={onViewRequests}
          className="w-full mt-3 px-3 py-2 rounded-md text-sm font-medium flex justify-center items-center gap-2 hover:bg-[var(--chat-secondary-hover)] transition-colors"
          style={{
            background: 'var(--chat-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          View Requests
        </button>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user)}
            className="w-full p-4 flex items-center gap-3 hover:bg-opacity-10 hover:bg-slate-500 transition-colors"
            style={{
              background:
                selectedUserId === user.id
                  ? 'var(--sidebar-muted)'
                  : 'transparent',
              borderBottom: '1px solid var(--card-border)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1 text-left">
              <div
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {user.name}
              </div>
              <div
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Last message...
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatUserList;
