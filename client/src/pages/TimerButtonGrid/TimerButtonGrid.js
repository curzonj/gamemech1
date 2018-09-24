import React from 'react';
import { propType } from 'graphql-anywhere';
import PropTypes from 'prop-types';
import Timer, { fragment } from './Timer';
import Grid from '../../components/ButtonGrid';

export default function TimerButtonGrid({ data: { assetInstances } }) {
  return (
    <Grid>
      {assetInstances &&
        assetInstances.map(a => <Timer key={a.id} asset={a} />)}
    </Grid>
  );
}

TimerButtonGrid.propTypes = {
  data: PropTypes.shape({
    assetInstances: PropTypes.arrayOf(propType(fragment)),
  }).isRequired,
};
