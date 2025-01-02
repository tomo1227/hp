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
