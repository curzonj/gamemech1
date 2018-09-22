import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/App';
import { unregister } from './utils/registerServiceWorker';
import * as auth from './utils/authentication';

auth.handleOAuthCallback().then(() => {
  if (auth.isAuthenticated()) {
    ReactDOM.render(<App />, document.getElementById('root'));
  } else {
    auth.redirectAuthentication();
  }
});

unregister();
