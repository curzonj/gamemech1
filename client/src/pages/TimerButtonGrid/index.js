import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import TimerButtonGrid from './TimerButtonGrid';
import { fragment } from './Timer';

export default graphql(
  gql`
    query TimerButtonGrid {
      assetInstances {
        ...AssetInstanceFragment
      }
    }
    ${fragment}
  `
)(TimerButtonGrid);
