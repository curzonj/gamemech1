import React from 'react';
import styled from 'styled-components';
import { propType } from 'graphql-anywhere';
import PropTypes from 'prop-types';
import RecipeButton from './RecipeButton';
import withData, { fragment } from './withData';

const Grid = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 50%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 20px;
`;

function RecipeButtonGrid({ recipes, ...props }) {
  return (
    <Grid>
      {recipes &&
        recipes.map(r => <RecipeButton key={r.id} recipe={r} {...props} />)}
    </Grid>
  );
}

RecipeButtonGrid.propTypes = {
  recipes: PropTypes.arrayOf(propType(fragment)),
};

RecipeButtonGrid.defaultProps = {
  recipes: [],
};

export default withData(RecipeButtonGrid);
