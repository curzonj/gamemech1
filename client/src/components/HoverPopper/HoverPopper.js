import React from 'react';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import bind from 'memoize-bind';
import styled from 'styled-components';

const TightOuterWrap = styled.div``;

const TightInnerWrap = styled.div`
  position: relative;
  display: inline-block;
  /* if you need ie6/7 support */
  *display: inline;
  zoom: 1;
`;

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
    const id = open ? 'simple-popper' : null;

    return (
      <div>
        <TightOuterWrap>
          <TightInnerWrap
            onMouseEnter={bind(this.handleMouseEnter, this)}
            onMouseLeave={bind(this.handleMouseLeave, this)}
          >
            {this.props.children[0]}
          </TightInnerWrap>
        </TightOuterWrap>
        <Popper id={id} open={open} anchorEl={anchorEl} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              {this.props.children[1]}
            </Fade>
          )}
        </Popper>
      </div>
    );
  }
}

export default HoverPopper;
