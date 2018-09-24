import React from 'react';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import gql from 'graphql-tag';
import { propType } from 'graphql-anywhere';
import HoverPopper from '../../components/HoverPopper/HoverPopper';
import safe from '../../shared/try_catch';
import Cell from '../../components/GridButton';
import PaddedText from '../../components/PaddedText';

export default function Timer({ asset: a }) {
  const currentTimer = safe(() => a.timers.filter(t => t.listHead)[0]);
  return (
    <HoverPopper fadeDelay={10}>
      <Cell color="purple">{a.type.name}</Cell>
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
          {currentTimer.triggerAt && (
            <Typography>{moment(currentTimer.triggerAt).fromNow()}</Typography>
          )}
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

export const fragment = gql`
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
`;

Timer.propTypes = {
  asset: propType(fragment).isRequired,
};
