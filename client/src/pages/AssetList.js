import React, { Component } from 'react';
import styled from 'styled-components';
import HoverPopper from '../components/HoverPopper/HoverPopper';
import graphql from '../utils/graphql';

const Grid = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 50%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 20px;
`;

const Cell = styled.div`
  background-color: navy;
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
        assets {
          id
          type {
            id
            name
          }
          location {
            name
          }
          quantity
        }
      }
    `
      .then(({ assets }) => {
        const list = assets.map(a => (
          <HoverPopper fadeDelay={10}>
            <Cell key={a.id}>
              {a.quantity}
              <PaddedText>{a.type.name}</PaddedText>
            </Cell>
            <div>The content of the Popper.</div>
          </HoverPopper>
        ));
        this.setState({ buttons: list });
      })
      .catch(e => console.log(e));
  }

  render() {
    return <Grid>{this.state.buttons}</Grid>;
  }
}
