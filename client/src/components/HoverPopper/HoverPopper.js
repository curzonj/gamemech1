import React from 'react';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import bind from 'memoize-bind';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import styledMaterial from '../../utils/styledMaterial';

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const StyledPaper = styledMaterial(Paper)(theme => ({
  padding: theme.spacing.unit * 2,
}));

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

  handleClick(...args) {
    if (this.props.onClick) {
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
          onClick={bind(this.handleClick, this)}
        >
          {content}
        </ContentWrapper>
        {popoverContent.length > 0 && (
          <Popper id={id} open={open} anchorEl={anchorEl} transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={this.props.fadeDelay}>
                <StyledPaper>{popoverContent}</StyledPaper>
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
