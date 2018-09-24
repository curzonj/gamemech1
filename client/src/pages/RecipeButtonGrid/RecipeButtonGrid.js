import React from 'react';
import { propType } from 'graphql-anywhere';
import PropTypes from 'prop-types';
import RecipeButton, { fragment } from './RecipeButton';
import Grid from '../../components/ButtonGrid';

export default function RecipeButtonGrid({ data: { recipes }, ...props }) {
  return (
    <Grid>
      {recipes &&
        recipes.map(r => <RecipeButton key={r.id} recipe={r} {...props} />)}
    </Grid>
  );
}

RecipeButtonGrid.propTypes = {
  data: PropTypes.shape({
    recipes: PropTypes.arrayOf(propType(fragment)),
  }).isRequired,
};
