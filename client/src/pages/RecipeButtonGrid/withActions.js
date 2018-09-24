import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import safe from '../../shared/try_catch';
import chain from '../../utils/chainHoC';
import { withUserNotifications } from '../../providers/NotificationContext';
import reportError from '../../utils/reportError';

const mutation = graphql(
  gql`
    mutation QueueRecipe($input: QueueRecipeInput!) {
      queueRecipe(input: $input) {
        id
      }
    }
  `,
  {
    props: ({ mutate, ownProps: { notifyUser, ...rest } }) => ({
      ...rest,

      onClick: (recipeId, name) =>
        mutate({
          variables: {
            input: {
              recipeId,
              locationId: 1,
            },
          },
        })
          .then(() => notifyUser(`Queued ${name}`))
          .catch(e => {
            console.log(e);
            if (e.graphQLErrors) {
              notifyUser(safe(() => e.graphQLErrors[0].message));
            } else {
              reportError(e);
            }
          }),
    }),
  }
);

export default chain(mutation, withUserNotifications);
