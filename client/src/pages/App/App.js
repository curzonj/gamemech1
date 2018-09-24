import React from 'react';
import styled from 'styled-components';
import RecipeButtonGrid from '../RecipeButtonGrid';
import AssetList from '../AssetList';
import TimerButtonGrid from '../TimerButtonGrid';
import AppBar from './AppBar';
import MaterialTheme from './MaterialTheme';
import Notifications from '../../components/Notifications/Notifications';

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
        <TimerButtonGrid />
      </Wrapper>

      <Notifications />
    </MaterialTheme>
  );
}
