import React, { useState } from 'react';

interface MiniToastProps {
  isOpen: boolean;
  message?: string;
}

const MiniToast: React.FC<MiniToastProps> = ({ isOpen, message }) => {
  return (
    <div id="mini-extension-toast" className={isOpen ? 'mini-show-toast' : ''}>
      <img src="" />
      <span>{message}</span>
    </div>
  );
};

export default MiniToast;
