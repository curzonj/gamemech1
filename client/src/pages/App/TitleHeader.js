import React from 'react';
import styled from 'styled-components';

const Header = styled.header`
  background-color: #222;
  height: 50px;
  padding: 20px;
  color: white;

  /* These bits make the "header" stay at the bottom of the page */
  /*  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%; */
`;

const Title = styled.h1`
  font-size: 1.5em;
`;

export default function() {
  return (
    <Header>
      <Title>Welcome to gamemech1</Title>
    </Header>
  );
}
