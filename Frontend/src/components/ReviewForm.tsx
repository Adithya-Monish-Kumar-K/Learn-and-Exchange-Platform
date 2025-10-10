import React, { useState } from 'react';
import axios from 'axios';

const ReviewForm: React.FC = () => {
	const [content, setContent] = useState('');
	const [rating, setRating] = useState(5);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			await axios.post('/api/reviews', { content, rating });
			setSuccess(true);
			setContent('');
			setRating(5);
		} catch (err: any) {
			setError(err.message || 'Failed to submit review');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>Submit a Review</h2>
			<textarea value={content} onChange={e => setContent(e.target.value)} required />
			<br />
			<label>
				Rating:
				<input type="number" min={1} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} required />
			</label>
			<br />
			<button type="submit" disabled={loading}>Submit</button>
			{success && <div>Review submitted!</div>}
			{error && <div>Error: {error}</div>}
		</form>
	);
};

export default ReviewForm;
