export function gqlAuthd(fn) {
  return (root, args, req, info) => {
    if (!req.user) {
      return;
    }

    // 99% of the time req is all we want
    return fn(req, root, args, info);
  };
}
