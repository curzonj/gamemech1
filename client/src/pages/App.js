import React, { Component } from 'react';
import styled from 'styled-components';
import RecipeButtons from './RecipeButtons/RecipeButtons';
import AssetList from './AssetList';
import TimerList from './TimerList/TimerList';

const Wrapper = styled.div`
  text-align: center;
`;

const Header = styled.header`
  background-color: #222;
  height: 50px;
  padding: 20px;
  color: white;
`;

const Title = styled.h1`
  font-size: 1.5em;
`;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Wrapper>
        <Header>
          <Title>Welcome to gamemech1</Title>
        </Header>
        <RecipeButtons />
        <AssetList />
        <TimerList />
      </Wrapper>
    );
  }
}
