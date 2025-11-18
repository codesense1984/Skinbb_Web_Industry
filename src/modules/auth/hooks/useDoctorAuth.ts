// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { useNavigate } from "react-router";
// import { QK, type AuthQueryData, logout } from "../services/auth.service";
// import type { DoctorInfo } from "../types/doctor.type";
// import { AUTH_ROUTES } from "../routes/constants";

// export const useDoctorAuth = () => {
//   const qc = useQueryClient();
//   const navigate = useNavigate();

//   // Get current user data
//   const authData = qc.getQueryData<AuthQueryData>(QK.ME);
//   const isDoctor = authData?.user?.roleValue === "doctor";

//   // Query for doctor info using useQuery
//   const doctorQuery = useQuery<DoctorInfo>({
//     queryKey: [...QK.DOCTOR_INFO, authData?.user?._id],
//     queryFn: async () => {
//       if (!authData?.user?._id) {
//         throw new Error("User ID not found in auth data");
//       }

//       const response = await getDoctorInfo(authData.user._id);
//       return response.data;
//     },
//     enabled: isDoctor && !!authData?.user?._id,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 30 * 60 * 1000, // 30 minutes
//     retry: 1,
//   });

//   // Update ME query data when doctor info is successfully fetched
//   useEffect(() => {
//     if (doctorQuery.data && authData) {
//       qc.setQueryData(QK.ME, {
//         ...authData,
//         doctorInfo: doctorQuery.data,
//       });
//     }
//   }, [doctorQuery.data, authData, qc]);

//   // Handle errors - redirect to logout if API fails
//   useEffect(() => {
//     if (doctorQuery.isError) {
//       console.error("Doctor info fetch failed:", doctorQuery.error);
//       // Clear auth and redirect to login
//       logout(qc);
//       navigate(AUTH_ROUTES.SIGN_IN, { replace: true });
//     }
//   }, [doctorQuery.isError, doctorQuery.error, qc, navigate]);

//   return {
//     doctorInfo: doctorQuery.data,
//     isLoading: doctorQuery.isLoading,
//     isError: doctorQuery.isError,
//     error: doctorQuery.error,
//     isDoctor,
//     refetch: doctorQuery.refetch,
//   };
// };

