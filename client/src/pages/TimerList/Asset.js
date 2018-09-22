import React from 'react';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import gql from 'graphql-tag';
import { propType } from 'graphql-anywhere';
import styled from 'styled-components';
import HoverPopper from '../../components/HoverPopper/HoverPopper';
import safe from '../../shared/try_catch';

const Cell = styled.div`
  background-color: purple;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
`;

const PaddedText = styled.span`
  margin-left: 0.25em;
`;

export default function Asset({ asset: a }) {
  const currentTimer = safe(() => a.timers.filter(t => t.listHead)[0]);
  return (
    <HoverPopper fadeDelay={10}>
      <Cell>{a.type.name}</Cell>
      {a.timerBlockedType && (
        <Typography>
          Blocked on:
          <PaddedText>{a.timerBlockedType.name}</PaddedText>
        </Typography>
      )}
      {currentTimer && (
        <div>
          <Typography>
            Producing
            <PaddedText>
              {currentTimer.recipe.resultTypes.map(t => t.name).join(', ')}
            </PaddedText>
          </Typography>
          <Typography>{moment(currentTimer.triggerAt).fromNow()}</Typography>
          {currentTimer.recipe.consumableTypes.length > 0 && (
            <Typography>
              from
              <PaddedText>
                {currentTimer.recipe.consumableTypes
                  .map(t => t.name)
                  .join(', ')}
              </PaddedText>
            </Typography>
          )}
        </div>
      )}
    </HoverPopper>
  );
}

Asset.fragments = {
  asset: gql`
    fragment AssetInstanceFragment on AssetInstance {
      id
      type {
        name
      }
      timerBlockedType {
        id
        name
      }
      timerBlockedQuantity
      timers {
        id
        triggerAt
        retries
        nextId
        listHead
        runs
        recipe {
          resultTypes {
            name
          }
          consumableTypes {
            name
          }
        }
      }
    }
  `,
};

Asset.propTypes = {
  asset: propType(Asset.fragments.asset).isRequired,
};
