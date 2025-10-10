import React, { useState } from 'react';
import axios from 'axios';

const SupportForm: React.FC = () => {
	const [subject, setSubject] = useState('');
	const [description, setDescription] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			await axios.post('/api/tickets', { subject, description });
			setSuccess(true);
			setSubject('');
			setDescription('');
		} catch (err: any) {
			setError(err.message || 'Failed to submit ticket');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>Submit a Support Ticket</h2>
			<input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" required />
			<br />
			<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
			<br />
			<button type="submit" disabled={loading}>Submit</button>
			{success && <div>Ticket submitted!</div>}
			{error && <div>Error: {error}</div>}
		</form>
	);
};

export default SupportForm;
