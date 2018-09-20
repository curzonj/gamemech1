export async function each(list, fn) {
  await list.reduce(async (prev, row, idx) => {
    await prev;
    await Promise.resolve(fn(row, idx)).catch(e => {
      console.log(row);
      throw e;
    });
  }, Promise.resolve());
}
