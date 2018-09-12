import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/App';
import registerServiceWorker from './registerServiceWorker';
import { handleOAuthCallback } from './authentication';

handleOAuthCallback().then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

registerServiceWorker();
