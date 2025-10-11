import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SupportTickets: React.FC = () => {
	const [tickets, setTickets] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				const res = await axios.get('/api/tickets');
				setTickets(res.data);
			} catch (err: any) {
				setError(err.message || 'Failed to fetch tickets');
			} finally {
				setLoading(false);
			}
		};
		fetchTickets();
	}, []);

	if (loading) return <div>Loading tickets...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			<h2>Support Tickets</h2>
			<ul>
				{tickets.map((ticket) => (
					<li key={ticket._id}>{ticket.subject || ticket.title}</li>
				))}
			</ul>
		</div>
	);
};

export default SupportTickets;
