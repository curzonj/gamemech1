import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import RecipeButtonGrid from './RecipeButtonGrid';
import { fragment } from './RecipeButton';
import withActions from './withActions';

export default graphql(
  gql`
    query RecipeButtonGrid {
      recipes {
        ...RecipeFragment
      }
    }
    ${fragment}
  `,
  {
    props({ data: { recipes, ...rest }, ...props }) {
      const list =
        recipes && recipes.filter(r => r.facilityType.name === 'account');
      return { data: { recipes: list, ...rest }, ...props };
    },
  }
)(withActions(RecipeButtonGrid));
