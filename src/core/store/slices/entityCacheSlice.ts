import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Company {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
}

interface EntityCacheState {
  companies: Record<string, Company>; // key: companyId, value: Company
  locations: Record<string, Location>; // key: locationId, value: Location
  users: Record<string, User>; // key: userId, value: User
}

const initialState: EntityCacheState = {
  companies: {},
  locations: {},
  users: {},
};

const entityCacheSlice = createSlice({
  name: "entityCache",
  initialState,
  reducers: {
    setCompany: (state, action: PayloadAction<Company>) => {
      state.companies[action.payload.id] = action.payload;
    },
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      action.payload.forEach((company) => {
        state.companies[company.id] = company;
      });
    },
    setLocation: (state, action: PayloadAction<Location>) => {
      state.locations[action.payload.id] = action.payload;
    },
    setLocations: (state, action: PayloadAction<Location[]>) => {
      action.payload.forEach((location) => {
        state.locations[location.id] = location;
      });
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.users[action.payload.id] = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      action.payload.forEach((user) => {
        state.users[user.id] = user;
      });
    },
    clearCompanies: (state) => {
      state.companies = {};
    },
    clearLocations: (state) => {
      state.locations = {};
    },
    clearUsers: (state) => {
      state.users = {};
    },
    clearAll: (state) => {
      state.companies = {};
      state.locations = {};
      state.users = {};
    },
  },
});

export const {
  setCompany,
  setCompanies,
  setLocation,
  setLocations,
  setUser,
  setUsers,
  clearCompanies,
  clearLocations,
  clearUsers,
  clearAll,
} = entityCacheSlice.actions;

// Selectors
export const selectCompany = (
  state: { entityCache: EntityCacheState },
  id: string,
): Company | undefined => state.entityCache.companies[id];

export const selectLocation = (
  state: { entityCache: EntityCacheState },
  id: string,
): Location | undefined => state.entityCache.locations[id];

export const selectUser = (
  state: { entityCache: EntityCacheState },
  id: string,
): User | undefined => state.entityCache.users[id];

export const selectCompanyName = (
  state: { entityCache: EntityCacheState },
  id: string,
): string => state.entityCache.companies[id]?.name || "";

export const selectLocationName = (
  state: { entityCache: EntityCacheState },
  id: string,
): string => state.entityCache.locations[id]?.name || "";

export const selectUserName = (
  state: { entityCache: EntityCacheState },
  id: string,
): string => state.entityCache.users[id]?.name || "";

export default entityCacheSlice.reducer;
