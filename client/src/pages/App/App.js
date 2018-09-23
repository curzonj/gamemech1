import React from 'react';
import styled from 'styled-components';
import RecipeButtonGrid from '../RecipeButtonGrid/RecipeButtonGrid';
import AssetList from '../AssetList';
import TimerList from '../TimerList/TimerList';
import AppBar from './AppBar';
import MaterialTheme from './MaterialTheme';

// This gives the AppBar enough space at the bottom
const Wrapper = styled.div`
  min-height: 400px;
  margin-bottom: 100px;
  clear: both;
`;

export default function() {
  return (
    <MaterialTheme>
      <AppBar />

      <Wrapper>
        <RecipeButtonGrid />
        <AssetList />
        <TimerList />
      </Wrapper>
    </MaterialTheme>
  );
}
