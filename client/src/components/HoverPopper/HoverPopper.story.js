import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import HoverPopper from './HoverPopper';

const Wrapper = styled.div`
  display: inline-block;
`;

const Cell = styled.div`
  background-color: purple;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
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

const Grid = styled.div`
  margin: auto;
  margin-top: 20px;
  width: 50%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 20px;
`;

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
