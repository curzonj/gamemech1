import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

// Taken from https://github.com/oliviertassinari/material-ui/blob/56efe9fbd675bad84dcdb65faa2aae2ff5c9473d/docs/src/pages/customization/StyledComponents.js

export default function materialStyled(Component) {
  return (style, options) => {
    function StyledComponent(props) {
      const { classes, className, ...other } = props;
      return (
        <Component className={classNames(classes.root, className)} {...other} />
      );
    }
    StyledComponent.propTypes = {
      classes: PropTypes.shape({
        root: PropTypes.string,
      }).isRequired,
      className: PropTypes.string,
    };
    StyledComponent.defaultProps = {
      className: null,
    };
    const styles =
      typeof style === 'function'
        ? theme => ({ root: style(theme) })
        : { root: style };
    return withStyles(styles, options)(StyledComponent);
  };
}
