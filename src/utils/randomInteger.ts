export const randomInteger = (min = 0, max = 1) => {
  const delta = Math.floor(max) - Math.floor(min);
  return Math.floor(min + Math.random() * delta);
};
