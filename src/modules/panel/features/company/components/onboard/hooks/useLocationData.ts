import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  LocationService,
  type LocationOption,
} from "../../../../../../../core/services/location.service";

interface UseLocationDataProps {
  addressIndex: number;
}

interface UseLocationDataReturn {
  countries: LocationOption[];
  states: LocationOption[];
  cities: LocationOption[];
  selectedCountry: string;
  selectedState: string;
  isLoading: boolean;
}

export const useLocationData = ({
  addressIndex,
}: UseLocationDataProps): UseLocationDataReturn => {
  const { control, setValue } = useFormContext();

  const selectedCountry = useWatch({
    control,
    name: `address.${addressIndex}.country`,
    defaultValue: "",
  });

  const selectedState = useWatch({
    control,
    name: `address.${addressIndex}.state`,
    defaultValue: "",
  });

  // Get all countries (static data)
  const countries = useMemo(() => {
    return LocationService.getAllCountries();
  }, []);

  // Get states based on selected country
  const states = useMemo(() => {
    if (!selectedCountry) return [];
    return LocationService.getStatesByCountry(selectedCountry);
  }, [selectedCountry]);

  // Get cities based on selected country and state
  const cities = useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    return LocationService.getCitiesByCountryAndState(
      selectedCountry,
      selectedState,
    );
  }, [selectedCountry, selectedState]);

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    // Reset state when country changes
    if (selectedCountry && selectedState) {
      const availableStates =
        LocationService.getStatesByCountry(selectedCountry);
      const stateExists = availableStates.some(
        (state) => state.value === selectedState,
      );

      if (!stateExists) {
        // Reset state field if current state is not available for selected country
        setValue(`address.${addressIndex}.state`, "");
      }
    }
  }, [selectedCountry, selectedState, addressIndex, setValue]);

  return {
    countries,
    states,
    cities,
    selectedCountry,
    selectedState,
    isLoading: false,
  };
};
