import axios from 'axios';
import React, { useState } from 'react';
import './ServiceForm.css';

const ServiceForm = ({ user }) => {
  const [category, setCategory] = useState('General Queries');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      await axios.post('http://localhost:5000/service', {
        category,
        comment,
        email: user.email,
        name: user.name,
      }, { withCredentials: true });

      setSubmitSuccess(true);
      setComment('');
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="service-form-container">
      <form onSubmit={submitRequest} className="service-form">
        <h3 className="form-title">Submit a Customer Service Request</h3>

        <div className="form-group">
          <div className="input-field">
            <label className="input-label">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option>General Queries</option>
              <option>Product Features Queries</option>
              <option>Product Pricing Queries</option>
              <option>Product Feature Implementation Requests</option>
            </select>
          </div>

          <div className="input-field">
            <label className="input-label">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="form-textarea"
              placeholder="Please describe your request in detail..."
              rows={5}
            ></textarea>
          </div>
        </div>

        <div className="form-footer">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
          
          {submitSuccess && (
            <div className="success-message">
              Request submitted successfully!
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;