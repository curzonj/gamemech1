export default function(...chain) {
  return wrapped => chain.reduce((prev, hoc) => hoc(prev), wrapped);
}
