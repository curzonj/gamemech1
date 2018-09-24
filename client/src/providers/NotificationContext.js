import buildContextHoC from '../utils/buildContextHoC';

const [withUserNotifications, withNotificationsProvider] = buildContextHoC(
  setState => ({
    notificationMessageKey: null,
    notificationMessage: null,

    notifyUser: msg => {
      setState(() => ({
        notificationMessageKey: new Date().getTime(),
        notificationMessage: msg,
      }));
    },
  })
);

export { withUserNotifications, withNotificationsProvider };
