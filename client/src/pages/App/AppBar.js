import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import styled from 'styled-components';

const Root = styled.div`
  flex-grow: 1;

  @media (max-width: 600px) {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
  }
`;

const MenuButton = styled(IconButton)`
  margin-left: -12,
  margin-right: 20,
`;

const StretchTypography = styled(Typography)`
  flex-grow: 1;
`;

export default function MyAppBar() {
  return (
    <Root>
      <AppBar color="default" position="static">
        <Toolbar>
          <MenuButton color="inherit" aria-label="Menu">
            <MenuIcon />
          </MenuButton>
          <StretchTypography color="inherit" variant="title" />
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Root>
  );
}
