import React, { Component } from 'react';
import styled from 'styled-components';
import graphql from '../utils/graphql';
import safe from '../shared/try_catch';

const Grid = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 50%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 20px;
`;

const Cell = styled.div`
  background-color: purple;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
`;

const PaddedText = styled.span`
  margin-left: 0.25em;
`;

export default class AssetList extends Component {
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
                id
                name
              }
            }
          }
        }
      }
    `
      .then(({ assetInstances }) => {
        const list = assetInstances.map(a => {
          const currentTimer = safe(() => a.timers.filter(t => t.listHead)[0]);
          return (
            <Cell key={a.id}>
              {a.type.name}
              <br />
              {a.timerBlockedType ? (
                <span>
                  Blocked on:
                  <PaddedText>{a.timerBlockedType.name}</PaddedText>
                </span>
              ) : (
                <span />
              )}
              <br />
              {currentTimer ? (
                <span>
                  Producing:
                  <PaddedText>
                    {safe(() => currentTimer.recipe.resultTypes[0].name)}
                  </PaddedText>
                </span>
              ) : (
                <span />
              )}
            </Cell>
          );
        });
        this.setState({ buttons: list });
      })
      .catch(e => console.log(e));
  }

  render() {
    return <Grid>{this.state.buttons}</Grid>;
  }
}
