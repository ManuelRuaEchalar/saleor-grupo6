// src/components/WelcomeMessage.jsx
import React from 'react';

const WelcomeMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="welcome-message" role="alert">
      <p>{message}</p>
    </div>
  );
};

export default WelcomeMessage;