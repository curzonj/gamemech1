import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/App/App';
import { unregister } from './utils/registerServiceWorker';
import * as auth from './utils/authentication';
import withApolloProvider from './utils/withApolloProvider';

const Root = withApolloProvider(App);

auth.handleOAuthCallback().then(() => {
  if (auth.isAuthenticated()) {
    ReactDOM.render(<Root />, document.getElementById('root'));
  } else {
    auth.redirectAuthentication();
  }
});

unregister();
