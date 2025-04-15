import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React from 'react';
import './Login.css';

function Login({ setUser, setIsNewUser }) {
  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const { email, name, sub: googleId } = decoded;

    try {
      const res = await axios.post('http://localhost:5000/check-user', {
        email,
        googleId,
        name,
      });

      setUser({ email, name, googleId });
      setIsNewUser(!res.data.exists); // if not exists => true
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <h3>Login</h3>
      <GoogleLogin 
        onSuccess={handleSuccess} 
        onError={() => console.log('Login Failed')} 
      />
    </div>
  );
}

export default Login;
