import buildContextHoC from '../utils/buildContextHoC';

const [withUserNotifications, withNotificationsProvider] = buildContextHoC(
  setState => ({
    notificationMessage: null,
    notifyUser: msg => {
      setState(() => ({
        notificationMessage: msg,
      }));
    },
  })
);

export { withUserNotifications, withNotificationsProvider };
