// /frontend/src/components/user/StoreRatingAction.jsx

import React, { useState } from 'react';
import axios from 'axios';

const StoreRatingAction = ({ storeId, currentRating, onRatingSubmitted }) => {
    const [rating, setRating] = useState(currentRating || 0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determines if the action is a POST (new) or PUT (modify)
    const isModification = currentRating !== null && currentRating !== undefined;

    const handleRatingChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 5) {
            setRating(value);
            setMessage(''); // Clear message when selection changes
        }
    };

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            setMessage('Please select a rating between 1 and 5.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            let res;
            if (isModification) {
                // PUT /api/ratings/:storeId (Modify)
                res = await axios.put(`/ratings/${storeId}`, { rating });
            } else {
                // POST /api/ratings (Submit New)
                res = await axios.post('/ratings', { storeId, rating });
            }
            
            setMessage(res.data.message);
            
            // Trigger the parent component (StoreList) to refresh the data
            onRatingSubmitted();

        } catch (error) {
            console.error('Rating submission failed:', error.response);
            setMessage(error.response?.data?.message || 'Action failed.');
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rating-action">
            {isSubmitting ? (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <select 
                            value={rating} 
                            onChange={handleRatingChange} 
                            disabled={loading}
                            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="0" disabled>Rate</option>
                            {[1, 2, 3, 4, 5].map(r => (
                                <option key={r} value={r}>{r} ⭐</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading || rating === 0}
                            className="btn-primary text-sm py-1.5 px-3"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : isModification ? 'Save' : 'Submit'}
                        </button>
                        <button 
                            onClick={() => setIsSubmitting(false)} 
                            disabled={loading}
                            className="btn-secondary text-sm py-1.5 px-3"
                        >
                            Cancel
                        </button>
                    </div>
                    {message && (
                        <small className={`text-xs ${message.includes('failed') || message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                            {message}
                        </small>
                    )}
                </div>
            ) : (
                <button 
                    onClick={() => setIsSubmitting(true)} 
                    className="btn-secondary text-sm"
                >
                    {isModification ? 'Modify Rating' : 'Submit Rating'}
                </button>
            )}
        </div>
    );
};

export default StoreRatingAction;