import React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '@material-ui/core/Button';
import bind from 'memoize-bind';
import Notifications from './Notifications';
import {
  withUserNotifications,
  withNotificationsProvider,
} from '../../providers/NotificationContext';

const MyButton = withUserNotifications(({ notifyUser, message }) => (
  <Button onClick={bind(notifyUser, null, message)}>Show {message}</Button>
));

const stories = storiesOf('Notifications', module);
stories.add(
  'basic',
  withNotificationsProvider(() => (
    <div>
      <MyButton message="message 1" />
      <MyButton message="message 2" />
      <Notifications />
    </div>
  ))
);
