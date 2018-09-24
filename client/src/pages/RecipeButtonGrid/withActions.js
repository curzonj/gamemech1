import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import safe from '../../shared/try_catch';

export default graphql(
  gql`
    mutation QueueRecipe($input: QueueRecipeInput!) {
      queueRecipe(input: $input) {
        id
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      onClick: recipeId =>
        mutate({
          variables: {
            input: {
              recipeId,
              locationId: 1,
            },
          },
        })
          .then(result => alert(JSON.stringify(result)))
          .catch(e => {
            console.log(e);
            if (e.graphQLErrors) {
              alert(safe(() => e.graphQLErrors[0].message));
            }
          }),
    }),
  }
);
