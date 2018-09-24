import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import bind from 'memoize-bind';
import { withUserNotifications } from '../../providers/NotificationContext';

const styles = theme => ({
  close: {
    padding: theme.spacing.unit / 2,
  },
});

class ConsecutiveSnackbars extends React.Component {
  constructor(props) {
    super(props);
    this.queue = [];
    this.state = {
      open: false,
      messageInfo: {},
    };
  }

  componentDidUpdate({ notificationMessageKey: prev }) {
    const { notificationMessageKey } = this.props;

    if (!notificationMessageKey) {
      return;
    }

    if (prev === notificationMessageKey) {
      return;
    }

    this.queue.push({
      message: this.props.notificationMessage,
      key: this.props.notificationMessageKey,
    });

    // immediately begin dismissing current message
    // to start showing new one
    if (this.state.open) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ open: false });
    } else {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length > 0) {
      this.setState({
        messageInfo: this.queue.shift(),
        open: true,
      });
    }
  }

  handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
  }

  handleExited() {
    this.processQueue();
  }

  render() {
    const { classes } = this.props;
    const { message, key } = this.state.messageInfo;
    return (
      <div>
        <Snackbar
          key={key}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.open}
          autoHideDuration={6000}
          onClose={bind(this.handleClose, this)}
          onExited={bind(this.handleExited, this)}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{message}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={bind(this.handleClose, this)}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    );
  }
}

ConsecutiveSnackbars.propTypes = {
  notificationMessage: PropTypes.string,
  notificationMessageKey: PropTypes.number,
};

ConsecutiveSnackbars.defaultProps = {
  notificationMessage: null,
  notificationMessageKey: null,
};

export default withUserNotifications(withStyles(styles)(ConsecutiveSnackbars));
