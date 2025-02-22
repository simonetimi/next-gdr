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

export const fromCamelCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
};

export const fromKebabCase = (str: string) => {
  return str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const enhanceTextWithSquareBrackets = (text: string) => {
  // makes text in square brackets bold
  return text.replace(/\[(.*?)\]/g, '<span class="font-bold">$1</span>');
};

export const enchanceCharacterName = (text: string, name: string) => {
  return text.replaceAll(
    name,
    `<span class="font-bold underline">${name}</span>`,
  );
};
