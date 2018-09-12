const Store = require('locallyjs').Store;

const storageAPI = new Store();

export function handleOAuthCallback() {
  if (window.location.pathname === process.env.REACT_APP_OAUTH_CALLBACK_PATH) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
      window.history.replaceState(window.history.state, document.title, '/');
      storageAPI.remove('authToken');

      const code = params.get('code');
      return fetch(`${process.env.REACT_APP_API_ENDPOINT}/login?code=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async r => {
          const text = await r.text();
          if (r.ok) {
            storageAPI.set('authToken', text);
          } else {
            console.log(text);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  return Promise.resolve();
}

export function redirectAuthentication() {
  window.location.href = process.env.REACT_APP_OAUTH_AUTHORIZE_URI;
}

export function logout() {
  // It's a JWT token so all we need to do to log out is lose it
  storageAPI.remove('authToken');
}

export function injectAuthHeader(headers) {
  const authToken = storageAPI.get('authToken');
  // Why is authToken null as a string? :shrug:
  if (authToken !== null && authToken !== 'null') {
    headers.Authorization = `Bearer ${authToken}`;
  }
}
