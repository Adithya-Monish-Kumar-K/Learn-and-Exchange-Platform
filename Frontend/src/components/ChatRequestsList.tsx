import React, { useState } from 'react';
import type { Request } from '../types/Request';
import { ChevronLeft, Search } from 'lucide-react';
import apiClient from '../services/apiClient';

interface ChatRequestsListProps {
  requests: Request[];
  onBack: () => void;
  onSelectRequest: (request: Request) => void;
  onEditRequest?: (request: Request) => void;
  currentUserId: string;
  setRequests: (requests: Request[]) => void;
}

const ChatRequestsList: React.FC<ChatRequestsListProps> = ({
  requests,
  onBack,
  onSelectRequest,
  onEditRequest,
  currentUserId,
  setRequests,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'accepted' | 'rejected'
  >('all');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  console.log(
    'Current User ID:',
    currentUserId,
    'Request Sender ID:',
    filteredRequests
  );

  console.log(currentUserId === filteredRequests[0]?._id);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { background: 'var(--warning-muted)', color: 'var(--warning)' };
      case 'accepted':
        return { background: 'var(--success-muted)', color: 'var(--success)' };
      case 'rejected':
        return { background: 'var(--error-muted)', color: 'var(--error)' };
      default:
        return { background: 'var(--info-muted)', color: 'var(--info)' };
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col border-r"
      style={{ borderColor: 'var(--card-border)' }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{
          borderColor: 'var(--card-border)',
          background: 'var(--card-background)',
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-slate-500"
            style={{ color: 'var(--text-primary)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-lg font-semibold"
          >
            Requests
          </h2>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 rounded-lg"
            style={{
              background: 'var(--input-background)',
              color: 'var(--text-primary)',
              borderColor: 'var(--card-border)',
            }}
          />
          <Search
            className="absolute right-3 top-2.5 w-5 h-5"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mt-3">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="px-3 py-1 rounded-md text-sm capitalize"
                style={{
                  background:
                    filterStatus === status
                      ? 'var(--primary)'
                      : 'var(--card-background-secondary)',
                  color:
                    filterStatus === status ? 'white' : 'var(--text-primary)',
                }}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Requests list */}
      <div className="flex-1 overflow-y-auto">
        {filteredRequests.map((request) => (
          <div
            key={request._id}
            className="w-full p-4 flex flex-col gap-2 hover:bg-opacity-5 hover:bg-slate-500 transition-colors"
            style={{ borderBottom: '1px solid var(--card-border)' }}
          >
            <div className="flex justify-between items-start">
              <h3
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {request.title}
              </h3>
              <span
                className="px-2 py-1 rounded text-xs capitalize"
                style={getStatusStyle(request.status)}
              >
                {request.status}
              </span>
            </div>
            <p
              className="text-sm line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {request.description}
            </p>
            <div className="flex justify-between items-center">
              <div
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  {currentUserId === request.senderId ? (
                    // Sender Actions
                    <>
                      <button
                        disabled={loading[request._id]}
                        onClick={() => onEditRequest?.(request)}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          background: 'var(--warning)',
                          color: 'white',
                          opacity: loading[request._id] ? 0.7 : 1,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        disabled={loading[request._id]}
                        onClick={async () => {
                          try {
                            setLoading((prev) => ({
                              ...prev,
                              [request._id]: true,
                            }));
                            await apiClient.deleteChatRequest(request._id);
                            // Refresh requests list
                            const updatedRequests =
                              await apiClient.getChatRequests();
                            setRequests(updatedRequests);
                          } catch (error) {
                            console.error('Failed to delete request:', error);
                          } finally {
                            setLoading((prev) => ({
                              ...prev,
                              [request._id]: false,
                            }));
                          }
                        }}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          background: 'var(--error)',
                          color: 'white',
                          opacity: loading[request._id] ? 0.7 : 1,
                        }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    // Receiver Actions
                    <>
                      <button
                        disabled={loading[request._id]}
                        onClick={async () => {
                          try {
                            setLoading((prev) => ({
                              ...prev,
                              [request._id]: true,
                            }));
                            await apiClient.respondToChatRequest(
                              request._id,
                              true
                            );
                            onSelectRequest({
                              ...request,
                              status: 'accepted',
                            });
                          } catch (error) {
                            console.error('Failed to accept request:', error);
                          } finally {
                            setLoading((prev) => ({
                              ...prev,
                              [request._id]: false,
                            }));
                          }
                        }}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          background: 'var(--success)',
                          color: 'white',
                          opacity: loading[request._id] ? 0.7 : 1,
                        }}
                      >
                        Accept
                      </button>
                      <button
                        disabled={loading[request._id]}
                        onClick={async () => {
                          try {
                            setLoading((prev) => ({
                              ...prev,
                              [request._id]: true,
                            }));
                            await apiClient.respondToChatRequest(
                              request._id,
                              false
                            );
                            onSelectRequest({
                              ...request,
                              status: 'rejected',
                            });
                          } catch (error) {
                            console.error('Failed to reject request:', error);
                          } finally {
                            setLoading((prev) => ({
                              ...prev,
                              [request._id]: false,
                            }));
                          }
                        }}
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          background: 'var(--error)',
                          color: 'white',
                          opacity: loading[request._id] ? 0.7 : 1,
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}
              {request.status !== 'pending' && (
                <button
                  onClick={() => onSelectRequest(request)}
                  className="px-3 py-1 rounded-md text-sm"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                  }}
                >
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatRequestsList;
