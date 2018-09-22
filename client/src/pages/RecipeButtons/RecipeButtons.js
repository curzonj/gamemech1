import React from 'react';
import styled from 'styled-components';
import graphql from '../../utils/graphql';
import Recipe from './Recipe';

const Grid = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 50%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 20px;
`;

export default class RecipeButtons extends React.Component {
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
        .map(r => <Recipe key={r.id} recipe={r} />);
      this.setState({ buttons: list });
    });
  }

  render() {
    return <Grid>{this.state.buttons}</Grid>;
  }
}
