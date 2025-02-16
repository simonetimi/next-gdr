export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const toKebabCase = (str: string) =>
  str.toLowerCase().replaceAll(" ", "-");

export const toCamelCase = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .reduce(
      (s: string, c: string) => s + (c.charAt(0).toUpperCase() + c.slice(1)),
    );
};
