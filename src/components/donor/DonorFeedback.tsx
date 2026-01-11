import { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { apiService } from '../../services/api';
import { DonorFeedback as DonorFeedbackType } from '../../types/donor_feedback';

interface DonorFeedbackProps {
  donorId: number;
}

export default function DonorFeedback({ donorId }: DonorFeedbackProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbacks, setFeedbacks] = useState<DonorFeedbackType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all feedbacks for this donor on component mount and when donorId changes
  useEffect(() => {
    if (donorId) {
      fetchFeedbacks();
    }
  }, [donorId]);

  const fetchFeedbacks = async () => {
    if (!donorId) return;
    
    try {
      setIsLoading(true);
      const data = await apiService.getDonorFeedbacks(donorId);
      // Backend already returns sorted by created_at descending (newest first)
      setFeedbacks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching donor feedbacks:', err);
      setError('Failed to load feedbacks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim() || !donorId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newFeedback = await apiService.createDonorFeedback(donorId, feedbackText.trim());
      // Add the new feedback to the list (at the top since it's newest)
      setFeedbacks(prev => [newFeedback, ...prev]);
      setFeedbackText('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Donor Feedback</h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Share your thoughts, suggestions, or report issues about this donor. Everyone can see all feedback.
        </p>
      </div>

      {/* Feedback Form */}
      <div className="p-6 border-b bg-gray-50">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="donor-feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              id="donor-feedback"
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!feedbackText.trim() || isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Feedback List */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Feedback ({feedbacks.length})
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading feedbacks...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No feedback yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {feedback.username}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(feedback.created_at)}
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {feedback.feedback}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

