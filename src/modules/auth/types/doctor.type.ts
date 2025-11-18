export interface DoctorInfo {
  doctorId: string;
  doctorName: string;
  doctorStatus: string;
  specialization?: string;
  qualifications?: string[];
}

export interface DoctorInfoResponse {
  statusCode: number;
  data: DoctorInfo;
  message: string;
}

