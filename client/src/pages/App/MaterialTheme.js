import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import purple from '@material-ui/core/colors/purple';

const theme = createMuiTheme({
  palette: {
    primary: { main: purple[500] }, // Purple and green play nicely together.
    secondary: { main: '#11cb5f' }, // This is just green.A700 as hex.
  },
});

export default function MaterialTheme(props) {
  return <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>;
}

MaterialTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
