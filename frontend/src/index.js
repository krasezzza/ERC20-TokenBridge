import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

import './style/style.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
// StrictMode removed because of the components double-rendering
root.render(<App />);
