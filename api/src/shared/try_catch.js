export default function(fn, alt) {
  try {
    const result = fn();
    if (result === undefined) {
      return alt;
    }

    return result;
  } catch (e) {
    return alt;
  }
}
