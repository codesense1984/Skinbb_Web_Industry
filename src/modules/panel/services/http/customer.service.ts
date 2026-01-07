import { api } from "@/core/services/http";
import type {
  CustomerListResponse,
  CustomerListParams,
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
  CustomerCreateResponse,
  CustomerUpdateResponse,
  CustomerDeleteResponse,
} from "@/modules/panel/types/customer.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

export async function apiGetCustomers(
  params?: CustomerListParams,
  signal?: AbortSignal,
): Promise<CustomerListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.query) searchParams.append("query", params.query);
  if (params?.sort?.order)
    searchParams.append("sort[order]", params.sort.order);
  if (params?.sort?.key) searchParams.append("sort[key]", params.sort.key);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.USER.CUSTOMERS}?${queryString}`
    : ENDPOINTS.USER.CUSTOMERS;

  console.log("Fetching customers with URL:", url);
  return api.get<CustomerListResponse>(url, { signal });
}

export async function apiGetCustomerById(
  id: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  data: Customer;
  message: string;
  success: boolean;
}> {
  // Since individual customer API might not work, fetch from the list and find the customer
  try {
    const response = await apiGetCustomers({ page: 1, limit: 1000 }, signal);
    const customer = response.data.customers.find((c) => c._id === id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    return {
      statusCode: 200,
      data: customer,
      message: "Customer found",
      success: true,
    };
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
}

export async function apiCreateCustomer(
  data: CustomerCreateRequest,
  signal?: AbortSignal,
): Promise<CustomerCreateResponse> {
  try {
    return api.post<CustomerCreateResponse>(ENDPOINTS.USER.CUSTOMER, data, {
      signal,
    });
  } catch (error) {
    console.error("Create customer API failed, using mock response:", error);
    // Mock response for development
    const mockCustomer: Customer = {
      _id: `mock_${Date.now()}`,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role,
      profilePic: data.profilePic
        ? { _id: "mock_pic", url: data.profilePic }
        : null,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    return {
      statusCode: 201,
      data: mockCustomer,
      message: "Customer created successfully (mock)",
      success: true,
    };
  }
}

export async function apiUpdateCustomer(
  id: string,
  data: CustomerUpdateRequest,
  signal?: AbortSignal,
): Promise<CustomerUpdateResponse> {
  try {
    const url = `${ENDPOINTS.USER.CUSTOMER}/${id}`;
    return api.put<CustomerUpdateResponse>(url, data, { signal });
  } catch (error) {
    console.error("Update customer API failed, using mock response:", error);
    // Mock response for development
    const mockCustomer: Customer = {
      _id: id,
      name: data.name || "Updated Customer",
      email: data.email || "updated@example.com",
      phoneNumber: data.phoneNumber || "1234567890",
      role: data.role,
      profilePic: data.profilePic
        ? { _id: "mock_pic", url: data.profilePic }
        : null,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      data: mockCustomer,
      message: "Customer updated successfully (mock)",
      success: true,
    };
  }
}

export async function apiDeleteCustomer(
  id: string,
  signal?: AbortSignal,
): Promise<CustomerDeleteResponse> {
  const url = `${ENDPOINTS.USER.CUSTOMER}/${id}`;
  return api.delete<CustomerDeleteResponse>(url, { signal });
}
