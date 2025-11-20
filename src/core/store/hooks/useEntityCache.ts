import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../index";
import {
  selectCompany,
  selectCompanyName,
  selectLocation,
  selectLocationName,
  selectUser,
  selectUserName,
  setCompany,
  setCompanies,
  setLocation,
  setLocations,
  setUser,
  setUsers,
  type Company,
  type Location,
  type User,
} from "../slices/entityCacheSlice";

// Hook to get company name
export const useCompanyName = (companyId?: string): string => {
  return useSelector((state: RootState) =>
    companyId ? selectCompanyName(state, companyId) : "",
  );
};

// Hook to get location name
export const useLocationName = (locationId?: string): string => {
  return useSelector((state: RootState) =>
    locationId ? selectLocationName(state, locationId) : "",
  );
};

// Hook to get user name
export const useUserName = (userId?: string): string => {
  return useSelector((state: RootState) =>
    userId ? selectUserName(state, userId) : "",
  );
};

// Hook to get company
export const useCompany = (companyId?: string): Company | undefined => {
  return useSelector((state: RootState) =>
    companyId ? selectCompany(state, companyId) : undefined,
  );
};

// Hook to get location
export const useLocation = (locationId?: string): Location | undefined => {
  return useSelector((state: RootState) =>
    locationId ? selectLocation(state, locationId) : undefined,
  );
};

// Hook to get user
export const useUser = (userId?: string): User | undefined => {
  return useSelector((state: RootState) =>
    userId ? selectUser(state, userId) : undefined,
  );
};

// Hook to dispatch entity cache actions
export const useEntityCacheActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return {
    setCompany: (company: Company) => dispatch(setCompany(company)),
    setCompanies: (companies: Company[]) => dispatch(setCompanies(companies)),
    setLocation: (location: Location) => dispatch(setLocation(location)),
    setLocations: (locations: Location[]) => dispatch(setLocations(locations)),
    setUser: (user: User) => dispatch(setUser(user)),
    setUsers: (users: User[]) => dispatch(setUsers(users)),
  };
};

