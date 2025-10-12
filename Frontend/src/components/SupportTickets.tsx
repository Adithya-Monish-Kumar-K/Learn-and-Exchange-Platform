import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';

interface SupportTicket {
  _id: string;
  requestType: string;
  request: string;
  requestBy: string;
  status?: string; // default 'Pending' per backend
  media?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/tickets');
        // Ensure res.data is an array, otherwise use empty array
        const ticketsData = Array.isArray(res.data) ? res.data : [];
        setTickets(ticketsData);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch tickets'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();

    const onRefresh = () => {
      setLoading(true);
      fetchTickets();
    };
    window.addEventListener('support:tickets:refresh', onRefresh);
    return () =>
      window.removeEventListener('support:tickets:refresh', onRefresh);
  }, []);

  const downloadJson = (data: unknown, filename = 'support-tickets.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Support Tickets</h2>
        <button
          onClick={() =>
            downloadJson({
              exportedAt: new Date().toISOString(),
              count: tickets.length,
              data: tickets,
            })
          }
          className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 border"
        >
          <Download className="w-4 h-4" />
          Download Tickets
        </button>
      </div>
      {tickets.length === 0 ? (
        <p className="text-gray-500">No support tickets yet</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket._id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">
                    {ticket.requestType}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {ticket.request}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    {ticket.createdAt && (
                      <span className="text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      {ticket.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SupportTickets;
