import withApolloProvider from './withApolloProvider';
import { withNotificationsProvider } from './NotificationContext';
import chain from '../utils/chainHoC';

export default chain(withNotificationsProvider, withApolloProvider);
