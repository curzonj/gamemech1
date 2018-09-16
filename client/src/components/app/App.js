import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as auth from '../../authentication';
import safe from '../../shared/try_catch';

function graphql(q) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  auth.injectAuthHeader(headers);

  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: q }),
  }).then(async r => {
    const body = await r.json();

    if (body.errors) {
      console.log(body.errors);
      throw new Error('Graphql request failed');
    }

    return body.data;
  });
}

const urls = [
  'https://image.flaticon.com/icons/svg/1016/1016729.svg',
  'https://image.flaticon.com/icons/svg/1016/1016730.svg',
  'https://image.flaticon.com/icons/svg/1016/1016731.svg',
  'https://image.flaticon.com/icons/svg/1016/1016732.svg',
  'https://image.flaticon.com/icons/svg/1016/1016733.svg',
  'https://image.flaticon.com/icons/svg/1016/1016734.svg',
  'https://image.flaticon.com/icons/svg/1016/1016735.svg',
  'https://image.flaticon.com/icons/svg/1016/1016736.svg',
  'https://image.flaticon.com/icons/svg/1016/1016737.svg',
  'https://image.flaticon.com/icons/svg/1016/1016738.svg',
  'https://image.flaticon.com/icons/svg/1016/1016739.svg',
  'https://image.flaticon.com/icons/svg/1016/1016740.svg',
  'https://image.flaticon.com/icons/svg/1016/1016741.svg',
  'https://image.flaticon.com/icons/svg/1016/1016742.svg',
  'https://image.flaticon.com/icons/svg/1016/1016743.svg',
  'https://image.flaticon.com/icons/svg/1016/1016744.svg',
  'https://image.flaticon.com/icons/svg/1016/1016745.svg',
  'https://image.flaticon.com/icons/svg/1016/1016746.svg',
  'https://image.flaticon.com/icons/svg/1016/1016747.svg',
  'https://image.flaticon.com/icons/svg/1016/1016748.svg',
  'https://image.flaticon.com/icons/svg/1016/1016749.svg',
  'https://image.flaticon.com/icons/svg/1016/1016750.svg',
  'https://image.flaticon.com/icons/svg/1016/1016751.svg',
  'https://image.flaticon.com/icons/svg/1016/1016752.svg',
  'https://image.flaticon.com/icons/svg/1016/1016753.svg',
  'https://image.flaticon.com/icons/svg/1016/1016754.svg',
  'https://image.flaticon.com/icons/svg/1016/1016755.svg',
  'https://image.flaticon.com/icons/svg/1016/1016756.svg',
  'https://image.flaticon.com/icons/svg/1016/1016757.svg',
  'https://image.flaticon.com/icons/svg/1016/1016758.svg',
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'Waiting for content',
      dragon: null,
    };

    this.fetchContent = this.fetchContent.bind(this);
    this.logout = this.logout.bind(this);
    this.dragon = this.dragon.bind(this);
    this.login = auth.redirectAuthentication;

    this.fetchContent();
  }

  fetchContent() {
    graphql(`
      query {
        account {
          details
        }
      }
    `)
      .then(data => {
        const name = safe(
          () => data.account.details.nickname,
          'Anonymous Stranger'
        );
        this.setState({ text: `Hello ${name}!` });
      })
      .catch(err => {
        console.log(err);
      });
  }

  dragon() {
    if (!auth.isAuthenticated()) {
      return;
    }

    graphql(`
      mutation GetDragon {
        getDragon {
          type {
            name
            details
          }
          quantity
        }
      }
    `)
      .then(data => {
        const url = urls[data.getDragon.type.details.dragonId - 1];
        const radius = 70;

        this.setState({
          dragon: (
            <div>
              <svg height="200" width="200">
                <circle
                  cx={radius}
                  cy={radius}
                  r={radius}
                  strokeWidth="0"
                  fill={data.getDragon.type.details.color}
                />
                <circle
                  cx={radius}
                  cy={radius}
                  r={radius - 15}
                  strokeWidth="0"
                  fill="white"
                />
                <image
                  x={radius / 2 - 5}
                  y={radius / 2 - 5}
                  width="80"
                  height="80"
                  href={url}
                />
              </svg>
            </div>
          ),
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  logout() {
    auth.logout();

    // TODO ideally the content would be observing our user
    // session state via mobx and reload automatically
    this.fetchContent();
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
          <button type="button" onClick={this.login}>
            Login
          </button>
          <button type="button" onClick={this.dragon}>
            Get a Dragon!
          </button>
          <button type="button" onClick={this.logout}>
            Logout
          </button>
        </div>
        <div>{this.state.dragon}</div>
      </div>
    );
  }
}

export default App;
