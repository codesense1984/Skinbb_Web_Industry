// src/services/token.service.ts
let accessToken = "";
let refreshToken = "";

export const tokenService = {
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  },
  clearTokens: () => {
    accessToken = "";
    refreshToken = "";
  },
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
};
