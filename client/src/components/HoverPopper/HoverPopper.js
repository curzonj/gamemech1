import React from 'react';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import bind from 'memoize-bind';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

function PopoverDetailsInner({ classes, children }) {
  return <Paper className={classes.padding}>{children}</Paper>;
}

PopoverDetailsInner.propTypes = {
  classes: PropTypes.shape({
    padding: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  padding: {
    padding: theme.spacing.unit * 2,
  },
});

const PopoverDetails = withStyles(styles)(PopoverDetailsInner);

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

  handleButtonPress(e) {
    this.buttonPressTimer = setTimeout(() => {
      if (!this.state.open) {
        this.handleMouseEnter(e);
      }
      this.longPressed = true;
    }, 1000);
  }

  handleButtonRelease(e) {
    if (this.state.open) {
      this.handleMouseLeave(e);
    }
    clearTimeout(this.buttonPressTimer);
  }

  handleClick(...args) {
    if (this.longPressed) {
      delete this.longPressed;
    } else if (this.props.onClick) {
      this.props.onClick(...args);
    }
  }

  render() {
    const { anchorEl, open } = this.state;

    // TODO this may need to become a prop, but I'd have to figure out what it's for
    const id = open ? 'simple-popper' : null;

    // eslint-disable-next-line prefer-const
    let [content, ...popoverContent] = this.props.children;
    popoverContent = popoverContent.filter(c => !!c);

    return (
      <OuterWrapper>
        <ContentWrapper
          onMouseEnter={bind(this.handleMouseEnter, this)}
          onMouseLeave={bind(this.handleMouseLeave, this)}
          onTouchStart={bind(this.handleButtonPress, this)}
          onTouchEnd={bind(this.handleButtonRelease, this)}
          onMouseDown={bind(this.handleButtonPress, this)}
          onMouseUp={bind(this.handleButtonRelease, this)}
          onClick={bind(this.handleClick, this)}
        >
          {content}
        </ContentWrapper>
        {popoverContent.length > 0 && (
          <Popper id={id} open={open} anchorEl={anchorEl} transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={this.props.fadeDelay}>
                <PopoverDetails>{popoverContent}</PopoverDetails>
              </Fade>
            )}
          </Popper>
        )}
      </OuterWrapper>
    );
  }
}

HoverPopper.propTypes = {
  fadeDelay: PropTypes.number,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

HoverPopper.defaultProps = {
  fadeDelay: 350,
  onClick: () => null,
};

export default HoverPopper;