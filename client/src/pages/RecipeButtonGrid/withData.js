import React from 'react';
import gql from 'graphql-tag';
import graphql from '../../utils/graphql';

export const fragment = gql`
  fragment RecipeFragment on Recipe {
    id
    facilityType {
      name
    }
    dependencyTypes {
      name
    }
    consumableTypes {
      id
      name
    }
    resultTypes {
      name
    }
    resultHandler
    manual
    duration
    details
  }
`;

export default function(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { loading: true };
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
              id
              name
            }
            resultTypes {
              name
            }
            resultHandler
            manual
            duration
            details
          }
        }
      `.then(({ data: { recipes }, errors }) => {
        if (errors) {
          console.log(errors);
        } else {
          const list = recipes.filter(r => r.facilityType.name === 'account');
          this.setState({ loading: false, recipes: list });
        }
      });
    }

    render() {
      return <WrappedComponent {...this.state} {...this.props} />;
    }
  };
}
