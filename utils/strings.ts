export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const toKebabCase = (str: string) =>
  str.toLowerCase().replaceAll(" ", "-");

export const toCamelCase = (str: string) => {
  if (/^[a-z]+([A-Z][a-z]*)*$/.test(str)) return str; // return if camelcase
  return str
    .toLowerCase()
    .split(/[-_\s]/)
    .reduce((s: string, c: string, index: number) =>
      index === 0 ? c : s + c.charAt(0).toUpperCase() + c.slice(1),
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

export const replaceAngleBrackets = (text: string) => {
  // replaces angle brackets with «...»
  return text.replace(/<(.*?)>/g, "&laquo;$1&raquo;");
};

export const shortenText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const stripTags = (text: string) => {
  return text.replace(/<\/?[^>]+(>|$)/g, "");
};
