import jaDictionary from "../en.json";

type Dictionary = {
  [key: string]: string;
};

const jaDict: Dictionary = jaDictionary;

export const jaTranslate = (key: string): string => {
  if (jaDict[key]) {
    return jaDict[key];
  }
  return key;
};

const enDict: Dictionary = Object.fromEntries(
  Object.entries(jaDictionary).map(([en, ja]) => [ja, en]),
);

export const enTranslate = (key: string): string => {
  if (enDict[key]) {
    return enDict[key];
  }
  return key;
};
