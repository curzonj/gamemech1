import { injectAuthHeader } from './authentication';

export default function graphql(q) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  injectAuthHeader(headers);

  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: q }),
  }).then(async r => {
    const body = await r.json();

    if (body.errors) {
      console.log(body.errors);
      throw new Error('Graphql request failed');
    }

    return body.data;
  });
}
