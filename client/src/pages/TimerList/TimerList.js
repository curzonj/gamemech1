import React from 'react';
import styled from 'styled-components';
import Asset from './Asset';
import graphql from '../../utils/graphql';
import reportError from '../../utils/reportError';

const Grid = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 50%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 20px;
`;

export default class TimerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    graphql`
      query {
        assetInstances {
          id
          type {
            name
          }
          timerBlockedType {
            id
            name
          }
          timerBlockedQuantity
          timers {
            id
            triggerAt
            retries
            nextId
            listHead
            runs
            recipe {
              resultTypes {
                name
              }
              consumableTypes {
                name
              }
            }
          }
        }
      }
    `
      .then(({ data: { assetInstances }, errors }) => {
        if (errors) {
          console.log(errors);
        } else {
          this.setState({
            buttons: assetInstances.map(a => <Asset key={a.id} asset={a} />),
          });
        }
      })
      .catch(e => reportError(e));
  }

  render() {
    return <Grid>{this.state.buttons}</Grid>;
  }
}
