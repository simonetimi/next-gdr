export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const createLocationCode = (str: string) => {
  str.toLowerCase().replaceAll(" ", "-");
};
