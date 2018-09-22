import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import HoverPopper from './HoverPopper';

const styles = theme => ({
  typography: {
    padding: theme.spacing.unit * 2,
  },
});

const Cell = styled.div`
  background-color: purple;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
`;

function MyComponent(props) {
  return (
    <HoverPopper>
      <Cell>Some Details</Cell>
      <Paper>
        <Typography className={props.classes.typography}>
          The content of the Popper.
        </Typography>
      </Paper>
    </HoverPopper>
  );
}

const Wrapped = withStyles(styles)(MyComponent);

MyComponent.propTypes = {
  classes: PropTypes.shape({
    typography: PropTypes.string,
  }).isRequired,
};

storiesOf('HoverPopper', module).add('basic', () => <Wrapped />);
