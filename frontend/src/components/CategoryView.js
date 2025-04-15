import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './CategoryView.css';

const socket = io('http://localhost:5000'); // Replace with your server

const CategoryView = ({ category }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/service/${category}`);
        setRequests(res.data);
      } catch (err) {
        console.error('Error loading requests:', err);
      }
    };

    fetchRequests();

    // Socket listeners
    socket.on('new-request', (newReq) => {
      if (newReq.category === category) {
        setRequests(prev => [newReq, ...prev]);
      }
    });

    socket.on('delete-request', ({ id }) => {
      setRequests(prev => prev.filter(req => req._id !== id));
    });

    return () => {
      socket.off('new-request');
      socket.off('delete-request');
    };
  }, [category]);

  // Delete button handler
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/service/${id}`);
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

  return (
    <div className="category-view-container">
      <h3>{category}</h3>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="requests-grid">
          {requests.map((req) => (
            <div className="request-card" key={req._id}>
              <div>{req.comment}</div>
              <div className="request-meta">
                <span>{req.user?.name}</span>
                <button onClick={() => handleDelete(req._id)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryView;
