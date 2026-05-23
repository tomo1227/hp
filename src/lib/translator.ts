import cityDictionary from "../city.json";
import countryDictionary from "../country.json";
import jaDictionary from "../en.json";
import regionDictionary from "../region.json";

type Dictionary = {
  [key: string]: string;
};

const jaDict: Dictionary = jaDictionary;
const cityJaDict: Dictionary = cityDictionary;
const countryJaDict: Dictionary = countryDictionary;
const regionJaDict: Dictionary = regionDictionary;

const normalize = (key: string): string => key.trim();

export const jaTranslate = (key: string): string => {
  const normalizedKey = normalize(key);
  if (jaDict[normalizedKey]) {
    return jaDict[normalizedKey];
  }
  return normalizedKey;
};

const jaTranslateByDictionary = (
  key: string,
  dictionary: Dictionary,
): string => {
  const normalizedKey = normalize(key);
  if (dictionary[normalizedKey]) {
    return dictionary[normalizedKey];
  }
  return normalizedKey;
};

export const jaTranslateCountry = (key: string): string =>
  jaTranslateByDictionary(key, countryJaDict);

export const jaTranslateCity = (key: string): string =>
  jaTranslateByDictionary(key, cityJaDict);

export const jaTranslateRegion = (key: string): string =>
  jaTranslateByDictionary(key, regionJaDict);

const enDict: Dictionary = Object.fromEntries(
  Object.entries(jaDictionary).map(([en, ja]) => [ja, en]),
);

export const enTranslate = (key: string): string => {
  const normalizedKey = normalize(key);
  if (enDict[normalizedKey]) {
    return enDict[normalizedKey];
  }
  return normalizedKey;
};
