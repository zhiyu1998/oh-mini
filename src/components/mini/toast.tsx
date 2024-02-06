import React, { useState } from 'react';

interface MiniToastProps {
  isOpen: boolean;
  message?: string;
}

/**
 * 提示
 * @param isOpen
 * @param message
 * @constructor
 */
const MiniToast: React.FC<MiniToastProps> = ({ isOpen, message }) => {
  return (
    <div id="mini-extension-toast" className={isOpen ? 'mini-show-toast' : ''}>
      <img src="" />
      <span>{message}</span>
    </div>
  );
};

export default MiniToast;
