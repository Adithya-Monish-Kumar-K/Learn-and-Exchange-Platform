import React from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import apiClient from '../services/apiClient';

type State = {
  comment: string;
  title: string;
  rating: number;
  hoveredRating: number;
  loading: boolean;
  error: string | null;
  success: boolean;
};

class ReviewForm extends React.PureComponent<unknown, State> {
  state: State = {
    comment: '',
    title: '',
    rating: 5,
    hoveredRating: 0,
    loading: false,
    error: null,
    success: false,
  };

  get currentUserId() {
    return apiClient.getUser()?.id;
  }

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true, error: null, success: false });
    try {
      const { title, rating, comment } = this.state;
      const payload = {
        reviewer: this.currentUserId,
        reviewee: this.currentUserId, // TODO: replace with selector when available
        title: title?.trim() || undefined,
        rating,
        comment,
        isAnonymous: false,
      };
      await axios.post(
        'https://skill-exchange-platform-9s6c.onrender.com/api/reviews',
        payload
      );
      this.setState({ success: true, comment: '', title: '', rating: 5 });
      window.dispatchEvent(new CustomEvent('reviews:refresh'));
    } catch (err: any) {
      this.setState({ error: err?.message || 'Failed to submit review' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { comment, title, rating, hoveredRating, loading, error, success } =
      this.state;
    return (
      <form onSubmit={this.handleSubmit} className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Submit a Review</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => this.setState({ title: e.target.value })}
            placeholder="Short title for your review"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => this.setState({ rating: value })}
                onMouseEnter={() => this.setState({ hoveredRating: value })}
                onMouseLeave={() => this.setState({ hoveredRating: 0 })}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    value <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => this.setState({ comment: e.target.value })}
            required
            placeholder="Write your review here..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-y dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>

          {success && (
            <div className="text-green-600 dark:text-green-400 animate-fade-in">
              Review submitted successfully!
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg dark:bg-red-900 dark:border-red-800 dark:text-red-200">
            {error}
          </div>
        )}
      </form>
    );
  }
}

export default ReviewForm;
