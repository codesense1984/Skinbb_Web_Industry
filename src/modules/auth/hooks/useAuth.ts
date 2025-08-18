import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export const useAuth = () => {
  const { user, accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth,
  );

  const isLoggedIn = !!user;

  return {
    user: user?.[0],
    accessToken,
    refreshToken,
    isLoggedIn,
    role: user?.[0]?.roleValue,
    permissions: user?.[0]?.permissions || [],
  };
};
