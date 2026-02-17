import axiosInstance from './axiosInstance';

export const loginAPI = (data) => axiosInstance.post('/auth/login', data);
export const registerAPI = (data) => axiosInstance.post('/auth/register', data);
export const getMeAPI = () => axiosInstance.get('/auth/me');
