import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as auth from './authentication'

function graphql(q) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  auth.injectAuthHeader(headers)

  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/graphql`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: q })
  })
    .then(async r => {
      let body = await r.json()

      if (body.errors) {
        console.log(body.errors)
        throw new Error("Graphql request failed")
      }

      return body.data
    })
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

  login = auth.redirectAuthentication
  logout = () => {
    auth.logout()

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
