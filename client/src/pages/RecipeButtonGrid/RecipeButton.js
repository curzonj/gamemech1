import React from 'react';
import Typography from '@material-ui/core/Typography';
import { propType } from 'graphql-anywhere';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import bind from 'memoize-bind';
import HoverPopper from '../../components/HoverPopper/HoverPopper';
import safe from '../../shared/try_catch';
import withMutation from './withMutation';
import { fragment } from './withData';

const ButtonCell = styled.button.attrs({
  type: 'button',
})`
  background-color: #4caf50; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  height: 100%;
  width: 100%;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
`;

const PaddedText = styled.span`
  margin-left: 0.25em;
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
  return (
    <HoverPopper fadeDelay={10} onClick={bind(onClick, null, r.id)}>
      <ButtonCell>{r.resultTypes.map(t => t.name).join(', ')}</ButtonCell>
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
