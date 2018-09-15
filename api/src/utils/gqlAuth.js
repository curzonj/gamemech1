export default function gqlAuth(fn) {
  return (root, args, req, info) => {
    if (!req.user) {
      throw new Error('Requires authentication');
    }

    // 99% of the time req is all we want
    return fn(req, args, root, info);
  };
}
