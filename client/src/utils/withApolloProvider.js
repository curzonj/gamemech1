import React from 'react';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { injectAuthHeader } from './authentication';

const httpLink = createHttpLink({
  uri: `${process.env.REACT_APP_API_ENDPOINT}/graphql`,

  fetch: (uri, options) => {
    injectAuthHeader(options.headers);
    return fetch(uri, options);
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default function(WrappedComponent) {
  return function withApolloProvider(props) {
    return (
      <ApolloProvider client={client}>
        <WrappedComponent {...props} />
      </ApolloProvider>
    );
  };
}
