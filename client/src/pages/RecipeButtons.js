import React, { Component } from 'react';
import styled from 'styled-components';
import graphql from '../utils/graphql';

const Grid = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 50%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 20px;
`;

const ButtonCell = styled.button.attrs({
  type: 'button',
})`
  background-color: #4caf50; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
`;

export default class RecipeButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    graphql`
      query {
        recipes {
          id
          facilityType {
            name
          }
          dependencyTypes {
            name
          }
          consumableTypes {
            name
          }
          resultTypes {
            name
          }
          resultHandler
          manual
          duration
        }
      }
    `.then(({ recipes }) => {
      const list = recipes
        .filter(r => r.facilityType.name === 'account')
        .map(r => (
          <ButtonCell key={r.id}>
            {r.resultTypes.map(t => t.name).join(', ')}
          </ButtonCell>
        ));
      this.setState({ buttons: list });
    });
  }

  render() {
    return <Grid>{this.state.buttons}</Grid>;
  }
}
