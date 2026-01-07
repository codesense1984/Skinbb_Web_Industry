import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { AUTH_ROUTES } from "../routes/constants";
import {
  bootstrapAuthCache,
  logout,
  QK,
  type AuthQueryData,
} from "../services/auth.service";

export const useAuth = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const query = useQuery<AuthQueryData>({
    queryKey: QK.ME,
    queryFn: async () => {
      return bootstrapAuthCache(qc);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 0,
  });

  const signOut = async () => {
    await logout(qc);
    navigate(AUTH_ROUTES.SIGN_IN, { replace: true });
  };

  return {
    me: query.data,
    user: query.data?.user,
    userId: query.data?.user?._id,
    isLoading: query.isLoading,
    isError: query.isError,
    signOut,
    accessToken: query.data?.accessToken,
    refreshToken: query.data?.refreshToken,
    isLoggedIn: !!query.data?.user,
    role: query.data?.user.roleValue ?? "",
    permissions: query.data?.user?.permissions || [],
  };
};
