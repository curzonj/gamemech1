import React from 'react';
import { post } from '../../utils/graphql';

function onClick(recipeId) {
  post(
    `
    mutation QueueRecipe($input: QueueRecipeInput!) {
      queueRecipe(input: $input) {
        id
      }
    }`,
    {
      input: {
        recipeId,
        locationId: 1,
      },
    }
  ).then(({ data, errors }) => {
    alert(JSON.stringify(errors || data));
  });
}

export default function(WrappedComponent) {
  return function RecipeWithMutation(props) {
    return <WrappedComponent onClick={onClick} {...props} />;
  };
}
