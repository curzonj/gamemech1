import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import HoverPopper from './HoverPopper';
import Grid from '../ButtonGrid';
import Cell from '../GridButton';

const Wrapper = styled.div`
  display: inline-block;
`;

const stories = storiesOf('HoverPopper', module);
stories.add('basic', () => (
  <Wrapper>
    <HoverPopper>
      <Cell>Some Details</Cell>
      <div>The content of the Popper.</div>
    </HoverPopper>
  </Wrapper>
));
stories.add('grid', () => (
  <Grid>
    <HoverPopper fadeDelay={10}>
      <Cell>Some Details</Cell>
      <div>The content of the Popper.</div>
    </HoverPopper>
    <HoverPopper fadeDelay={10}>
      <Cell>Some Details</Cell>
      <div>The content of the Popper.</div>
    </HoverPopper>
    <HoverPopper fadeDelay={10}>
      <Cell>Some Details</Cell>
      <div>The content of the Popper.</div>
    </HoverPopper>
  </Grid>
));
