import React from 'react';
import Typography from '@material-ui/core/Typography';
import gql from 'graphql-tag';
import { propType } from 'graphql-anywhere';
import styled from 'styled-components';
import HoverPopper from '../../components/HoverPopper/HoverPopper';

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

export default function Recipe({ recipe: r }) {
  return (
    <HoverPopper fadeDelay={10}>
      <ButtonCell>{r.resultTypes.map(t => t.name).join(', ')}</ButtonCell>
      {r.consumableTypes.length > 0 && (
        <Typography>
          from
          <PaddedText>
            {r.consumableTypes.map(t => t.name).join(', ')}
          </PaddedText>
        </Typography>
      )}
    </HoverPopper>
  );
}

Recipe.fragments = {
  recipe: gql`
    fragment RecipeFragment on Recipe {
      id
      facilityType {
        name
      }
      dependencyTypes {
        name
      }
      consumableTypes {
        name
      }
      resultTypes {
        name
      }
      resultHandler
      manual
      duration
    }
  `,
};

Recipe.propTypes = {
  recipe: propType(Recipe.fragments.recipe).isRequired,
};
