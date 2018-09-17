import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/App';
import registerServiceWorker from './utils/registerServiceWorker';
import { handleOAuthCallback } from './utils/authentication';

handleOAuthCallback().then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

registerServiceWorker();
