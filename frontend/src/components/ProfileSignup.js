// src/components/ProfileSignup.js
import React, { useState } from 'react';
import axios from 'axios';
import './ProfileSignup.css'; // Make sure the CSS file is imported

function ProfileSignup({ user, onComplete }) {
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/profile', {
        email: user.email,
        googleId: user.googleId,
        name: user.name,
        phone,
        organization,
      });

      onComplete(); // trigger to stop showing profile form
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  return (
    <div className="profile-container">
      <form onSubmit={handleSubmit}>
        <h3>Complete Your Profile</h3>
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          required
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default ProfileSignup;
