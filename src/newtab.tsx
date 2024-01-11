import React from 'react';
import { createRoot } from 'react-dom/client';
import '../public/newtab.css';
import MiniComponent from './components/mini';

// Mount components to the body
const newDiv = document.createElement('div');
newDiv.id = 'mini-root';
document.body.appendChild(newDiv);

const root = createRoot(document.getElementById('mini-root')!);
root.render(
  <React.StrictMode>
    <MiniComponent />
  </React.StrictMode>,
);
