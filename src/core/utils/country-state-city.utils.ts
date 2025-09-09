import { Country, State } from "country-state-city";

export const getCountry = (countryCode: string) => {
  return Country.getCountryByCode(countryCode);
};

export const getState = ( stateCode: string) => {
  return State.getStateByCode(stateCode);
};

