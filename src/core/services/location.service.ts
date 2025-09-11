import { Country, State, City } from "country-state-city";

export interface LocationOption {
  label: string;
  value: string;
}

export class LocationService {
  /**
   * Get all countries as options for select dropdown
   */
  static getAllCountries(): LocationOption[] {
    return Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.isoCode,
    }));
  }

  /**
   * Get all states for a specific country
   */
  static getStatesByCountry(countryCode: string): LocationOption[] {
    if (!countryCode) return [];

    return State.getStatesOfCountry(countryCode).map((state) => ({
      label: state.name,
      value: state.isoCode,
    }));
  }

  /**
   * Get all cities for a specific country and state
   */
  static getCitiesByCountryAndState(
    countryCode: string,
    stateCode: string,
  ): LocationOption[] {
    if (!countryCode || !stateCode) return [];

    return City.getCitiesOfState(countryCode, stateCode).map((city) => ({
      label: city.name,
      value: city.name, // Using name as value since cities don't have ISO codes
    }));
  }

  /**
   * Get country name by ISO code
   */
  static getCountryName(countryCode: string): string | undefined {
    const country = Country.getCountryByCode(countryCode);
    return country?.name;
  }

  /**
   * Get state name by country and state ISO codes
   */
  static getStateName(
    countryCode: string,
    stateCode: string,
  ): string | undefined {
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state?.name;
  }

  /**
   * Get city name by country, state, and city name
   */
  static getCityName(
    countryCode: string,
    stateCode: string,
    cityName: string,
  ): string | undefined {
    const cities = City.getCitiesOfState(countryCode, stateCode);
    return cities.find((city) => city.name === cityName)?.name;
  }

  /**
   * Validate if a country code exists
   */
  static isValidCountryCode(countryCode: string): boolean {
    return Country.getCountryByCode(countryCode) !== undefined;
  }

  /**
   * Validate if a state code exists for a country
   */
  static isValidStateCode(countryCode: string, stateCode: string): boolean {
    return State.getStateByCodeAndCountry(stateCode, countryCode) !== undefined;
  }

  /**
   * Validate if a city exists for a country and state
   */
  static isValidCity(
    countryCode: string,
    stateCode: string,
    cityName: string,
  ): boolean {
    const cities = City.getCitiesOfState(countryCode, stateCode);
    return cities.some((city) => city.name === cityName);
  }
}
