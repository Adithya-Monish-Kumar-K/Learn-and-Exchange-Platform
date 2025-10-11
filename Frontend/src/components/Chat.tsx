import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatUserList from '../components/ChatUserList';
import ChatRequestsList from '../components/ChatRequestsList';
import RequestForm from '../components/RequestForm';
import apiClient from '../services/apiClient';
import type { User } from '../types/ChatUser';
import type { Request } from '../types/Request';
import type { Message } from '../types/Message';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  console.log('Current User in Chat component:', currentUser);
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

  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [view, setView] = useState<
    'chat' | 'requests' | 'newRequest' | 'editRequest'
  >('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [requestToEdit, setRequestToEdit] = useState<Request | null>(null);

  useEffect(() => {
    // Initialize socket connection with user ID
    const newSocket = io('http://localhost:3000', {
      query: { userId: currentUser.id },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    // Load initial chat requests
    const fetchRequests = async () => {
      try {
        const data = await apiClient.getChatRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch chat requests:', error);
      }
    };
    fetchRequests();

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for online users
    socket.on('getUsers', (users: User[]) => {
      setUsers(users.filter((user) => user.id !== currentUser.id));
    });

    // Listen for new messages
    socket.on('getMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for chat request updates
    socket.on('chatRequestUpdate', async () => {
      try {
        const data = await apiClient.getChatRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to update chat requests:', error);
      }
    });

    // Listen for message updates (edit/delete)
    socket.on('messageUpdate', ({ chatId, messageId, type, data }) => {
      if (selectedUser?._id === chatId) {
        setMessages((prev) => {
          if (type === 'edit') {
            return prev.map((msg) =>
              msg._id === messageId ? { ...msg, ...data } : msg
            );
          } else if (type === 'delete') {
            return prev.filter((msg) => msg._id !== messageId);
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off('getUsers');
      socket.off('getMessage');
      socket.off('chatRequestUpdate');
      socket.off('messageUpdate');
    };
  }, [socket, currentUser.id, selectedUser?._id]);

  const handleSendMessage = (message: string) => {
    if (!socket || !selectedUser) return;

    socket.emit('sendMessage', {
      senderId: currentUser.id,
      receiverId: selectedUser._id,
      text: message,
    });
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setView('chat');
    try {
      const history = await apiClient.getChatHistory(user._id);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleCreateRequest = async (values: {
    user: string;
    task?: string;
    title: string;
    description: string;
  }) => {
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
        // Create new request
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
        await handleUserSelect(userDetails);
      }
    } catch (error) {
      console.error('Failed to get user details:', error);
    }
  };

  const handleEditRequest = (request: Request) => {
    setRequestToEdit(request);
    setView('editRequest');
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
            users={users}
            selectedUserId={selectedUser?._id ?? null}
            onUserSelect={handleUserSelect}
            onNewRequest={() => setView('newRequest')}
            onViewRequests={() => setView('requests')}
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
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 flex ${
                    message.senderId === currentUser.id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className="max-w-[70%] p-3 rounded-lg"
                    style={{
                      background:
                        message.senderId === currentUser.id
                          ? 'var(--primary)'
                          : 'var(--message-background)',
                      color:
                        message.senderId === currentUser.id
                          ? 'var(--primary-text)'
                          : 'var(--text-primary)',
                    }}
                  >
                    {message.text}
                    {message.isEdited && (
                      <span
                        className="ml-2 text-xs"
                        style={{
                          color:
                            message.senderId === currentUser.id
                              ? 'var(--primary-text-muted)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        (edited)
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
