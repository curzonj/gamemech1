import React from 'react';
import { propType } from 'graphql-anywhere';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Grid from '../../components/ButtonGrid';
import Cell from '../../components/GridButton';
import PaddedText from '../../components/PaddedText';

export const fragment = gql`
  fragment AssetListFragment on Asset {
    id
    type {
      id
      name
    }
    location {
      name
    }
    quantity
  }
`;

export default function AssetList({ data: { assets } }) {
  return (
    <Grid>
      {assets &&
        assets.map(a => (
          <Cell key={a.id} color="navy">
            {a.quantity}
            <PaddedText>{a.type.name}</PaddedText>
          </Cell>
        ))}
    </Grid>
  );
}

AssetList.propTypes = {
  data: PropTypes.shape({
    assets: PropTypes.arrayOf(propType(fragment)),
  }).isRequired,
};
