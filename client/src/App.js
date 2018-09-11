import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { logout, redirectAuthentication } from './authentication'

const Store = require('locallyjs').Store
const storageAPI = new Store()

function graphql(q) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const authToken = storageAPI.get('authToken')
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/graphql`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: q })
  })
    .then(r => r.json())
    .then(r => r.data)
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: "Waiting for content",
    }

    this.fetchContent()
  }

  fetchContent = () => {
    graphql(`
      query {
        hello
      }`)
    .then(data => this.setState({ text: data.hello }))
    .catch(err => {
      console.log(err)
    })
  }

  login = redirectAuthentication
  logout = () => {
    logout()

    // TODO ideally the content would be observing our user session state via mobx and reload automatically
    this.fetchContent()
  } 

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          <span>{this.state.text}</span>
        </p>
        <div className="App-actions">
          <button onClick={this.login}>Login</button>
          <button onClick={this.logout}>Logout</button>
        </div>
      </div>
    );
  }
}

export default App;
