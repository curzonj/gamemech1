import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import AssetList, { fragment } from './AssetList';

export default graphql(
  gql`
    query AssetList {
      assets {
        ...AssetListFragment
      }
    }
    ${fragment}
  `
)(AssetList);
