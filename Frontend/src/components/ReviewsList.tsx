import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewsList: React.FC = () => {
	const [reviews, setReviews] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const res = await axios.get('/api/reviews');
				setReviews(res.data);
			} catch (err: any) {
				setError(err.message || 'Failed to fetch reviews');
			} finally {
				setLoading(false);
			}
		};
		fetchReviews();
	}, []);

	if (loading) return <div>Loading reviews...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			<h2>Reviews</h2>
			<ul>
				{reviews.map((review) => (
					<li key={review._id}>{review.content} (Rating: {review.rating})</li>
				))}
			</ul>
		</div>
	);
};

export default ReviewsList;
