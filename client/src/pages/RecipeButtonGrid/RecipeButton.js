import React from 'react';
import Typography from '@material-ui/core/Typography';
import { propType } from 'graphql-anywhere';
import PropTypes from 'prop-types';
import bind from 'memoize-bind';
import gql from 'graphql-tag';
import HoverPopper from '../../components/HoverPopper/HoverPopper';
import safe from '../../shared/try_catch';
import withMutation from './withActions';
import ButtonCell from '../../components/GridButton';
import PaddedText from '../../components/PaddedText';

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

function consumablesText(r) {
  return (
    r.consumableTypes.length > 0 &&
    r.consumableTypes
      .map(t => {
        const count = safe(() => r.details.inputs[parseInt(t.id, 10)]);
        return `${count} ${t.name}`;
      })
      .join(', ')
  );
}

function RecipeButton({ recipe: r, onClick }) {
  const names = r.resultTypes.map(t => t.name).join(', ');

  return (
    <HoverPopper fadeDelay={10} onClick={bind(onClick, null, r.id, names)}>
      <ButtonCell color="#4caf50">{names}</ButtonCell>
      {r.consumableTypes.length > 0 && (
        <Typography>
          takes
          <PaddedText>{consumablesText(r)}</PaddedText>
        </Typography>
      )}
      <Typography>
        {r.duration}
        <PaddedText>seconds</PaddedText>
      </Typography>
    </HoverPopper>
  );
}

RecipeButton.propTypes = {
  recipe: propType(fragment).isRequired,
  onClick: PropTypes.func,
};

RecipeButton.defaultProps = {
  onClick: (...args) => console.log(args),
};

export default withMutation(RecipeButton);
