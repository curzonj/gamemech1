import { injectAuthHeader } from './authentication';

export function post(q, v = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  injectAuthHeader(headers);

  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: q,
      variables: v,
    }),
  }).then(async r => {
    const body = await r.json();

    return { data: body.data, errors: body.errors };
  });
}

export default function graphql([q]) {
  return post(q);
}
