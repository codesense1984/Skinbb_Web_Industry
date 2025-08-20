import { api } from "@/core/services/http";
import type { LoggedUser } from "../../types/user.type";

export interface LoginPayload {
  phoneNumber: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type LoginSuccess = {
  data: { user: LoggedUser[] | LoggedUser } & TokenResponse;
};

const login = async (payload: LoginPayload): Promise<LoginSuccess> => {
  return await api.post<LoginSuccess>("/api/v1/users/login", payload);
  // if (payload.phoneNumber !== "9999999999" || payload.password !== "root")
  //   return { data: null, error: "Phone number or password doesn't match!" };

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     if (payload.phoneNumber !== "9999999999" || payload.password !== "root") {
  //       return resolve({
  //         data: null,
  //         error: "Phone number or password doesn't match!",
  //       });
  //     } else {
  //       resolve({
  //         data: {
  //           data: {
  //             user: [
  //               {
  //                 _id: "66a12d345ae7258e83710d17",
  //                 firstName: "Jane",
  //                 lastName: "Yok",
  //                 email: "jane.yok@gmail.com",
  //                 phoneNumber: "9923999267",
  //                 profilePic: [
  //                   {
  //                     _id: "683847249906ee6136afd84e",
  //                     url: "https://sbb-dev-media.s3.ap-south-1.amazonaws.com/images/770088_people_512x512-1748518692461.png",
  //                   },
  //                 ],
  //                 roleLabel: "Admin",
  //                 roleValue: "admin",
  //                 permissions: [
  //                   {
  //                     page: "community-category",
  //                     action: ["create", "view", "update", "delete"],
  //                   },
  //                   {
  //                     page: "settings",
  //                     action: ["view", "create", "update"],
  //                   },
  //                   {
  //                     page: "routine",
  //                     action: ["create", "view", "update", "delete"],
  //                   },
  //                   {
  //                     page: "scan-overview",
  //                     action: ["view"],
  //                   },
  //                   {
  //                     page: "media",
  //                     action: ["create", "view", "update"],
  //                   },
  //                   {
  //                     page: "content-type",
  //                     action: ["view", "create", "update"],
  //                   },
  //                   {
  //                     page: "sitemap",
  //                     action: ["view", "update"],
  //                   },
  //                   {
  //                     page: "ingredients",
  //                     action: ["create", "view", "update", "delete"],
  //                   },
  //                   {
  //                     page: "products",
  //                     action: ["create", "view", "update", "delete"],
  //                   },
  //                   {
  //                     page: "brands",
  //                     action: ["create", "view", "update"],
  //                   },
  //                   {
  //                     page: "doctors",
  //                     action: ["view", "update"],
  //                   },
  //                   {
  //                     page: "posts",
  //                     action: ["view", "create", "update", "delete"],
  //                   },
  //                   {
  //                     page: "algorithms",
  //                     action: ["view", "create", "update", "delete"],
  //                   },
  //                   {
  //                     page: "transactions",
  //                     action: ["view", "create", "update", "delete"],
  //                   },
  //                   {
  //                     page: "permissions",
  //                     action: ["view"],
  //                   },
  //                   {
  //                     page: "tags",
  //                     action: ["view", "create", "update", "delete"],
  //                   },
  //                   {
  //                     page: "pages",
  //                     action: ["view", "create", "update", "delete"],
  //                   },
  //                   {
  //                     page: "categories",
  //                     action: ["view", "create", "update", "delete"],
  //                   },
  //                   {
  //                     page: "users",
  //                     action: ["view", "create", "update", "delete"],
  //                   },
  //                   {
  //                     page: "shelf",
  //                     action: ["view", "delete"],
  //                   },
  //                   {
  //                     page: "searches",
  //                     action: ["view"],
  //                   },
  //                   {
  //                     page: "notifications",
  //                     action: ["create"],
  //                   },
  //                   {
  //                     page: "analysis-question",
  //                     action: ["create", "view"],
  //                   },
  //                   {
  //                     page: "community",
  //                     action: ["view", "update", "delete", "create"],
  //                   },
  //                   {
  //                     page: "roles",
  //                     action: ["view", "create", "update"],
  //                   },
  //                 ],
  //               },
  //             ],
  //             accessToken:
  //               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmExMmQzNDVhZTcyNThlODM3MTBkMTciLCJlbWFpbCI6InBvb2phLm1pc3RyeTIwQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbeyJwYWdlIjoiY29tbXVuaXR5LWNhdGVnb3J5IiwiYWN0aW9uIjpbImNyZWF0ZSIsInZpZXciLCJ1cGRhdGUiLCJkZWxldGUiXX0seyJwYWdlIjoic2V0dGluZ3MiLCJhY3Rpb24iOlsidmlldyIsImNyZWF0ZSIsInVwZGF0ZSJdfSx7InBhZ2UiOiJyb3V0aW5lIiwiYWN0aW9uIjpbImNyZWF0ZSIsInZpZXciLCJ1cGRhdGUiLCJkZWxldGUiXX0seyJwYWdlIjoic2Nhbi1vdmVydmlldyIsImFjdGlvbiI6WyJ2aWV3Il19LHsicGFnZSI6Im1lZGlhIiwiYWN0aW9uIjpbImNyZWF0ZSIsInZpZXciLCJ1cGRhdGUiXX0seyJwYWdlIjoiY29udGVudC10eXBlIiwiYWN0aW9uIjpbInZpZXciLCJjcmVhdGUiLCJ1cGRhdGUiXX0seyJwYWdlIjoic2l0ZW1hcCIsImFjdGlvbiI6WyJ2aWV3IiwidXBkYXRlIl19LHsicGFnZSI6ImluZ3JlZGllbnRzIiwiYWN0aW9uIjpbImNyZWF0ZSIsInZpZXciLCJ1cGRhdGUiLCJkZWxldGUiXX0seyJwYWdlIjoicHJvZHVjdHMiLCJhY3Rpb24iOlsiY3JlYXRlIiwidmlldyIsInVwZGF0ZSIsImRlbGV0ZSJdfSx7InBhZ2UiOiJicmFuZHMiLCJhY3Rpb24iOlsiY3JlYXRlIiwidmlldyIsInVwZGF0ZSJdfSx7InBhZ2UiOiJkb2N0b3JzIiwiYWN0aW9uIjpbInZpZXciLCJ1cGRhdGUiXX0seyJwYWdlIjoicG9zdHMiLCJhY3Rpb24iOlsidmlldyIsImNyZWF0ZSIsInVwZGF0ZSIsImRlbGV0ZSJdfSx7InBhZ2UiOiJhbGdvcml0aG1zIiwiYWN0aW9uIjpbInZpZXciLCJjcmVhdGUiLCJ1cGRhdGUiLCJkZWxldGUiXX0seyJwYWdlIjoidHJhbnNhY3Rpb25zIiwiYWN0aW9uIjpbInZpZXciLCJjcmVhdGUiLCJ1cGRhdGUiLCJkZWxldGUiXX0seyJwYWdlIjoicGVybWlzc2lvbnMiLCJhY3Rpb24iOlsidmlldyJdfSx7InBhZ2UiOiJ1c2VycyIsImFjdGlvbiI6WyJ2aWV3IiwiY3JlYXRlIiwidXBkYXRlIiwiZGVsZXRlIl19LHsicGFnZSI6InBhZ2VzIiwiYWN0aW9uIjpbInZpZXciLCJjcmVhdGUiLCJ1cGRhdGUiLCJkZWxldGUiXX0seyJwYWdlIjoiY2F0ZWdvcmllcyIsImFjdGlvbiI6WyJ2aWV3IiwiY3JlYXRlIiwidXBkYXRlIiwiZGVsZXRlIl19LHsicGFnZSI6InRhZ3MiLCJhY3Rpb24iOlsidmlldyIsImNyZWF0ZSIsInVwZGF0ZSIsImRlbGV0ZSJdfSx7InBhZ2UiOiJzaGVsZiIsImFjdGlvbiI6WyJ2aWV3IiwiZGVsZXRlIl19LHsicGFnZSI6InNlYXJjaGVzIiwiYWN0aW9uIjpbInZpZXciXX0seyJwYWdlIjoibm90aWZpY2F0aW9ucyIsImFjdGlvbiI6WyJjcmVhdGUiXX0seyJwYWdlIjoiYW5hbHlzaXMtcXVlc3Rpb24iLCJhY3Rpb24iOlsiY3JlYXRlIiwidmlldyJdfSx7InBhZ2UiOiJjb21tdW5pdHkiLCJhY3Rpb24iOlsidmlldyIsInVwZGF0ZSIsImRlbGV0ZSIsImNyZWF0ZSJdfSx7InBhZ2UiOiJyb2xlcyIsImFjdGlvbiI6WyJ2aWV3IiwiY3JlYXRlIiwidXBkYXRlIl19XSwiaWF0IjoxNzUxODc5MDYzLCJleHAiOjE3NTE5NjU0NjN9.1cYKkBc2FLi9OB3h4wq65INRy39ZugbB6CG2wVGFYG8",
  //             refreshToken:
  //               "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmExMmQzNDVhZTcyNThlODM3MTBkMTciLCJpYXQiOjE3NTE4NzkwNjMsImV4cCI6MTc1MjA1MTg2M30.0KoZzyhWOx2umOpMzRq4ECyQPRvpUBDoFt1C7E8Fsnc",
  //           },
  //         },
  //         error: null,
  //       });
  //     }
  //   }, 2000);
  // });
};

const getUserById = async (userId: string): Promise<LoggedUser> => {
  return await api.get(`/api/v1/users/${userId}`);
};

const getAllUsers = async (
  query = "",
  page = 1,
  limit = 10,
): Promise<LoggedUser[]> => {
  const url = `/api/v1/users/all?search=${query}&page=${page}&limit=${limit}`;
  return await api.get(url);
};

export { getAllUsers, getUserById, login };
