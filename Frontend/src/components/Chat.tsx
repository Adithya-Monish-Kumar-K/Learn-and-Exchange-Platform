import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatUserList from './ChatUserList';
import ChatRequestsList from './ChatRequestsList';
import RequestForm from './RequestForm';
import apiClient from '../services/apiClient';
import type { User as ChatUser } from '../types/ChatUser';
import type { Request } from '../types/Request';
import type { Message } from '../types/Message';

// Extended user type to include MongoDB _id
export interface User extends Omit<ChatUser, 'id'> {
  _id: string;
  id: string;
}

// Helper: validate MongoDB ObjectId strings
const isObjectId = (val: unknown): val is string =>
  typeof val === 'string' && /^[a-f\d]{24}$/i.test(val);

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [socket, setSocket] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [view, setView] = useState<
    'chat' | 'requests' | 'newRequest' | 'editRequest'
  >('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [requestToEdit, setRequestToEdit] = useState<Request | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null); // messageId for context menu
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  // Type guard for currentUser
  if (!currentUser?.id) {
    return (
      <div
        style={{ color: 'var(--text-secondary)' }}
        className="flex items-center justify-center h-full"
      >
        Please log in to access chat
      </div>
    );
  }

  useEffect(() => {
    // Initialize socket connection with user ID
    const newSocket = io('http://localhost:3000', {
      query: { userId: currentUser.id },
      transports: ['websocket', 'polling'],
    } as any);

    // Handle socket connection events
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setSocket(newSocket);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection failed:', error);
    });

    // Load initial chat requests and accepted users
    const fetchData = async () => {
      try {
        // Fetch requests
        const requestsData = await apiClient.getChatRequests();
        setRequests(requestsData);

        // Extract users from accepted requests
        const acceptedRequests = requestsData.filter(
          (request: Request) => request.status === 'accepted'
        );

        // Get unique user IDs from accepted requests
        const userIds = new Set<string>(
          acceptedRequests.flatMap((request: Request) => [
            request.senderId,
            request.receiverId,
          ])
        );

        // Remove current user's ID
        userIds.delete(currentUser.id);

        // Fetch user details for each unique user ID
        const userDetailsPromises = Array.from(userIds).map((userId) =>
          apiClient.getUserDetails(userId)
        );

        const userDetails = await Promise.all(userDetailsPromises);
        const validUserDetails = userDetails
          .filter((user): user is any => !!user)
          .map((u: any) => ({ ...u, id: u.id || u._id }) as User);
        setUsers((prevUsers) => {
          const merged = [...(prevUsers || [])];
          for (const u of validUserDetails) {
            if (!merged.some((x) => x.id === (u as any).id)) merged.push(u);
          }
          return merged;
        });
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchData();

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (!socket) return;

    // Listen for online users (backend emits 'getOnlineUsers')
    socket.on('getOnlineUsers', (_onlineIds: string[]) => {
      // optionally handle online status
    });

    // Listen for new messages (backend emits 'newMessage')
    socket.on('newMessage', async ({ chatId: evtChatId, message }: any) => {
      if (!isObjectId(evtChatId)) return; // ignore malformed events

      // If we had no chatId yet (first message), capture it
      setChatId((prev) => (prev && isObjectId(prev) ? prev : evtChatId));

      // Only handle events for the currently open chat
      if (!chatId || chatId !== evtChatId) return;

      const msgId = message?._id;
      if (!isObjectId(msgId)) {
        // Fallback: fetch latest history to ensure valid ObjectIds
        try {
          const history: any = await apiClient.getChatHistory(evtChatId);
          setMessages(Array.isArray(history) ? history : []);
          console.log(messages);
        } catch (e) {
          console.error('Failed to refresh messages after newMessage:', e);
        }
        return;
      }

      // normalize incoming message
      const normalized: Message = {
        _id: msgId,
        senderId:
          typeof message?.senderId === 'string'
            ? message.senderId
            : message?.senderId?._id || '',
        receiverId: message?.receiverId || '',
        text: message?.text || '',
        createdAt: message?.createdAt || new Date().toISOString(),
        updatedAt: message?.updatedAt || new Date().toISOString(),
        isEdited: !!message?.isEdited,
      };

      setMessages((prev) => {
        if (prev.some((m) => m._id === normalized._id)) return prev;
        return [...prev, normalized];
      });
    });

    // Listen for message edits
    socket.on('editMessage', ({ chatId: evtChatId, messageId, text }: any) => {
      if (!chatId || evtChatId !== chatId) return;
      if (!isObjectId(messageId) || !isObjectId(evtChatId)) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text, isEdited: true } : msg
        )
      );
    });

    // Listen for message deletions
    socket.on('deleteMessage', ({ chatId: evtChatId, messageId }: any) => {
      if (!chatId || evtChatId !== chatId) return;
      if (!isObjectId(messageId) || !isObjectId(evtChatId)) return;
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    // Chat request events: refresh lists
    const handleRequestsRefresh = async () => {
      try {
        const data = await apiClient.getChatRequests();
        setRequests(data);
        await refreshUsersList();
      } catch (error) {
        console.error('Failed to update chat requests:', error);
      }
    };
    socket.on('requestResponse', handleRequestsRefresh);
    socket.on('requestEdit', handleRequestsRefresh);
    socket.on('requestDelete', handleRequestsRefresh);

    return () => {
      socket.off('getOnlineUsers');
      socket.off('newMessage');
      socket.off('requestResponse');
      socket.off('requestEdit');
      socket.off('requestDelete');
      socket.off('editMessage');
      socket.off('deleteMessage');
    };
  }, [socket, currentUser.id, selectedUser?._id, chatId]);

  // Always keep scrolled to the latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser?._id]);

  const handleSendMessage = async (message: string) => {
    if (!socket || !selectedUser) return;

    try {
      // Send message through API first
      const response = await apiClient.sendMessage(selectedUser._id, {
        text: message,
      });

      // Ensure we only add messages that have valid ObjectIds
      if (response && isObjectId((response as any)._id)) {
        setMessages((prev) => {
          return prev.some((m) => m._id === (response as any)._id)
            ? prev
            : [...prev, response as any];
        });
      } else if (chatId) {
        // Fallback: refresh chat by chatId if response didn't carry a valid id
        const history: any = await apiClient.getChatHistory(chatId);
        setMessages(Array.isArray(history) ? history : []);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setView('chat');
    try {
      const history: any = await apiClient.getChatHistory(user._id);
      setMessages(Array.isArray(history) ? history : []);
      // capture chatId if available
      const cid = (history as any)?._chatId;
      setChatId(isObjectId(cid) ? cid : null);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const onUserSelect = (user: ChatUser) => {
    // Ensure we carry both id and _id
    const withIds: User = {
      ...(user as any),
      _id: (user as any)._id || user.id,
      id: user.id,
    };
    void handleUserSelect(withIds);
  };

  interface RequestFormValues {
    user: string;
    task?: string;
    title: string;
    description: string;
  }

  const handleCreateRequest = async (values: RequestFormValues) => {
    if (!currentUser?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      const request = {
        receiverId: values.user,
        senderId: currentUser.id.toString(),
        task: values.task,
        title: values.title,
        description: values.description,
      };

      if (requestToEdit) {
        // Edit existing request
        await apiClient.editChatRequest(requestToEdit._id, {
          title: values.title,
          description: values.description,
          task: values.task,
          receiverId: values.user,
          senderId: currentUser.id.toString(),
        });
      } else {
        await apiClient.createChatRequest(request);
      }

      // Update the list after creating/editing
      const updatedRequests = await apiClient.getChatRequests();
      setRequests(updatedRequests);
      setRequestToEdit(null);
      setView('requests');
    } catch (error) {
      console.error('Failed to handle chat request:', error);
    }
  };

  const handleSelectRequest = async (request: Request) => {
    if (request.status === 'pending') {
      return; // Don't start chat for pending requests
    }

    // Find the other user ID (opposite of current user)
    const otherUserId =
      request.senderId === currentUser.id
        ? request.receiverId
        : request.senderId;

    // Get user details and start chat
    try {
      const userDetails = await apiClient.getUserDetails(otherUserId);
      if (userDetails) {
        const user: User = {
          ...(userDetails as any),
          id: (userDetails as any).id || (userDetails as any)._id,
          _id: (userDetails as any)._id || (userDetails as any).id,
        };
        await handleUserSelect(user);
      }
    } catch (error) {
      console.error('Failed to get user details:', error);
    }
  };

  const handleEditRequest = (request: Request) => {
    setRequestToEdit(request);
    setView('editRequest');
  };

  const refreshUsersList = async () => {
    try {
      // Fetch requests to get latest accepted requests
      const requestsData = await apiClient.getChatRequests();

      // Extract users from accepted requests
      const acceptedRequests = requestsData.filter(
        (request: Request) => request.status === 'accepted'
      );

      // Get unique user IDs from accepted requests
      const userIds = new Set<string>(
        acceptedRequests.flatMap((request: Request) => [
          request.senderId,
          request.receiverId,
        ])
      );

      // Remove current user's ID
      userIds.delete(currentUser.id);

      // Fetch user details for each unique user ID
      const userDetailsPromises = Array.from(userIds).map((userId) =>
        apiClient.getUserDetails(userId)
      );

      const userDetails = await Promise.all(userDetailsPromises);
      const validUserDetails = userDetails
        .filter((user): user is any => !!user)
        .map((u: any) => ({ ...u, id: u.id || u._id }) as User);

      setUsers(validUserDetails as User[]);
    } catch (error) {
      console.error('Failed to refresh users list:', error);
    }
  };

  // Message actions
  const onBubbleClick = (messageId: string) => {
    setActiveMenu((prev) => (prev === messageId ? null : messageId));
  };

  const onEditMessage = async (m: Message) => {
    if (!isObjectId(m._id)) {
      alert('Cannot edit: invalid message id');
      return;
    }
    const newText = prompt('Edit message', m.text);
    if (newText === null || newText.trim() === '' || !chatId) return;
    try {
      await apiClient.editMessage(chatId, m._id, newText.trim());
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === m._id
            ? { ...msg, text: newText.trim(), isEdited: true }
            : msg
        )
      );
      setActiveMenu(null);
    } catch (e) {
      console.error('Failed to edit message:', e);
    }
  };

  const onDeleteMessage = async (m: Message) => {
    if (!isObjectId(m._id)) {
      alert('Cannot delete: invalid message id');
      return;
    }
    if (!chatId) return;
    const ok = confirm('Delete this message?');
    if (!ok) return;
    try {
      await apiClient.deleteMessage(chatId, m._id);
      setMessages((prev) => prev.filter((msg) => msg._id !== m._id));
      setActiveMenu(null);
    } catch (e) {
      console.error('Failed to delete message:', e);
    }
  };

  const downloadChat = () => {
    if (!selectedUser) return;
    const data = {
      withUser: {
        id: selectedUser.id,
        _id: selectedUser._id,
        name: selectedUser.name,
      },
      chatId,
      messages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${selectedUser.name.replace(/\s+/g, '_')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const renderView = () => {
    switch (view) {
      case 'requests':
        return (
          <ChatRequestsList
            requests={requests}
            setRequests={setRequests}
            currentUserId={currentUser.id}
            onBack={() => setView('chat')}
            onSelectRequest={handleSelectRequest}
            onEditRequest={handleEditRequest}
          />
        );
      case 'newRequest':
      case 'editRequest':
        return (
          <RequestForm
            onClose={() => {
              setRequestToEdit(null);
              setView('requests');
            }}
            onSubmit={handleCreateRequest}
            initialValues={
              requestToEdit
                ? {
                    user: requestToEdit.receiverId,
                    task: requestToEdit.task,
                    title: requestToEdit.title,
                    description: requestToEdit.description,
                  }
                : undefined
            }
            isEditing={!!requestToEdit}
          />
        );
      default:
        return (
          <ChatUserList
            users={users as any}
            selectedUserId={selectedUser?.id ?? null}
            onUserSelect={onUserSelect}
            onNewRequest={() => setView('newRequest')}
            onViewRequests={async () => {
              const updated = await apiClient.getChatRequests();
              setRequests(updated);
              setView('requests');
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-1/3 h-full">{renderView()}</div>

      {/* Right panel - Chat area */}
      <div className="flex-1 h-full flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div
              className="p-4 border-b flex items-center gap-3"
              style={{
                borderColor: 'var(--card-border)',
                background: 'var(--card-background)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {selectedUser.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </div>
              <div>
                <h2
                  style={{ color: 'var(--text-primary)' }}
                  className="font-medium"
                >
                  {selectedUser.name}
                </h2>
                <span
                  style={{ color: 'var(--text-secondary)' }}
                  className="text-sm"
                >
                  Online
                </span>
              </div>
              <div className="ml-auto">
                <button
                  onClick={downloadChat}
                  className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--chat-secondary-hover)]"
                  style={{
                    background: 'var(--chat-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--chat-border)',
                  }}
                >
                  Download Chat
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {messages.map((message) => {
                const isOwn = message.senderId === currentUser.id;
                const time = (() => {
                  try {
                    return new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  } catch {
                    return '';
                  }
                })();
                return (
                  <div
                    key={message._id}
                    className={`mb-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                        isOwn ? 'rounded-br-none' : 'rounded-bl-none'
                      }`}
                      style={{
                        background: isOwn
                          ? 'var(--chat-message-sent)'
                          : 'var(--chat-message-received)',
                        color: isOwn ? '#ffffff' : 'var(--text-primary)',
                      }}
                      onClick={() => onBubbleClick(message._id)}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.text}
                      </div>
                      <div
                        className="mt-1 text-[11px] opacity-70"
                        style={{
                          color: isOwn
                            ? 'var(--text-muted)'
                            : 'var(--text-secondary)',
                        }}
                      >
                        {time}
                        {message.isEdited ? ' • edited' : ''}
                      </div>
                      {activeMenu === message._id && (
                        <div
                          className={`mt-2 flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <button
                            onClick={() => onEditMessage(message)}
                            className="px-2 py-1 text-xs rounded-md hover:bg-[var(--chat-secondary-hover)]"
                            style={{
                              background: 'var(--chat-secondary)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--chat-border)',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteMessage(message)}
                            className="px-2 py-1 text-xs rounded-md hover:bg-red-600"
                            style={{
                              background: 'var(--error)',
                              color: '#fff',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div
              className="p-4 border-t"
              style={{
                borderColor: 'var(--card-border)',
                background: 'var(--card-background)',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    'message'
                  ) as HTMLInputElement;
                  if (input.value.trim()) {
                    handleSendMessage(input.value);
                    input.value = '';
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="message"
                  placeholder="Type a message..."
                  className="form-input flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium hover:bg-[var(--chat-primary-hover)] transition-colors"
                  style={{
                    background: 'var(--chat-primary)',
                    color: 'white',
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div
            className="h-full flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
