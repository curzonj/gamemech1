import React from 'react';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import bind from 'memoize-bind';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

function PopoverDetailsInner({ classes, children }) {
  return (
    <Paper>
      <Typography className={classes.typography}>{children}</Typography>
    </Paper>
  );
}

const styles = theme => ({
  typography: {
    padding: theme.spacing.unit * 2,
  },
});

const PopoverDetails = withStyles(styles)(PopoverDetailsInner);

PopoverDetailsInner.propTypes = {
  classes: PropTypes.shape({
    typography: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

class HoverPopper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      open: false,
    };
  }

  handleMouseEnter(event) {
    const { currentTarget } = event;
    this.setState(() => ({
      anchorEl: currentTarget,
      open: true,
    }));
  }

  handleMouseLeave() {
    this.setState(() => ({
      anchorEl: null,
      open: false,
    }));
  }

  render() {
    const { anchorEl, open } = this.state;

    // TODO this may need to become a prop, but I'd have to figure out what it's for
    const id = open ? 'simple-popper' : null;

    return (
      <div>
        <div
          onMouseEnter={bind(this.handleMouseEnter, this)}
          onMouseLeave={bind(this.handleMouseLeave, this)}
        >
          {this.props.children[0]}
        </div>
        <Popper id={id} open={open} anchorEl={anchorEl} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={this.props.fadeDelay}>
              <PopoverDetails>{this.props.children[1]}</PopoverDetails>
            </Fade>
          )}
        </Popper>
      </div>
    );
  }
}

HoverPopper.propTypes = {
  fadeDelay: PropTypes.number,
  children: PropTypes.node.isRequired,
};

HoverPopper.defaultProps = {
  fadeDelay: 350,
};

export default HoverPopper;
