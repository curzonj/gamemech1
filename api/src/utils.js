/* eslint import/prefer-default-export: 0 */

export function gqlAuthd(fn) {
  return (root, args, req, info) => {
    if (!req.user) {
      throw new Error('Requires authentication');
    }

    // 99% of the time req is all we want
    return fn(req, root, args, info);
  };
}
