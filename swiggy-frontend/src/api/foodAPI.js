import axiosInstance from './axiosInstance';

export const getFoodsAPI = (category = '', search = '') => {
  const params = {};
  if (category) params.category = category;
  if (search) params.search = search;
  return axiosInstance.get('/foods', { params });
};

export const getFoodByIdAPI = (id) => axiosInstance.get(`/foods/${id}`);
export const getCategoriesAPI = () => axiosInstance.get('/foods/categories');
export const createFoodAPI = (data) => axiosInstance.post('/foods', data);
export const updateFoodAPI = (id, data) => axiosInstance.put(`/foods/${id}`, data);
export const deleteFoodAPI = (id) => axiosInstance.delete(`/foods/${id}`);
