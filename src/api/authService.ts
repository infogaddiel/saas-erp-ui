import axiosInstance from './axiosInstance';
const API_PATH = '/auth';
// Define types for your API responses
export interface LoginResponse {
  token: string;
  message?: string;
}

export const authService = {
  // Method for Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(API_PATH+'/login', {
      email,
      password,
    });
    return response.data;
  },

  // Method for OTP Verification
  verifyOtp: async (otp: string): Promise<any> => {
    const response = await axiosInstance.post(API_PATH+'/verify-otp', { otp });
    return response.data;
  },
   getRoles: async (): Promise<any> => {
    const response = await axiosInstance.get(API_PATH+'/roles');
    return response.data;
  },
};