import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

export interface MediaUploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    url: string;
    filename: string;
    size: number;
    type: string;
  };
}

export async function apiUploadMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<MediaUploadResponse>(ENDPOINTS.MEDIA.UPLOAD, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function apiUploadMultipleMedia(files: File[]): Promise<MediaUploadResponse[]> {
  const uploadPromises = files.map(file => apiUploadMedia(file));
  return Promise.all(uploadPromises);
}
