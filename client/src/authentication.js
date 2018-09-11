const Store = require('locallyjs').Store
const storageAPI = new Store()

export function handleOAuthCallback() {
    if (window.location.pathname === process.env.REACT_APP_OAUTH_CALLBACK_PATH) {
      let params = new URLSearchParams(window.location.search)
      if (params.has("code")) {
        window.history.replaceState(window.history.state, document.title, '/')

        let code = params.get('code')
        return fetch(`${process.env.REACT_APP_API_ENDPOINT}/login?code=${code}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        })
          .then(r => r.text())
          .then(data => {
            console.log(data)
            storageAPI.set("authToken", data)
          })
          .catch(err => {
            console.log(err)
          })
      }
    }

    return Promise.resolve()
}

export function redirectAuthentication() {
    window.location.href = process.env.REACT_APP_OAUTH_AUTHORIZE_URI
}

export function logout() {
  // It's a JWT token so all we need to do to log out is lose it
  storageAPI.set("authToken", null)
}