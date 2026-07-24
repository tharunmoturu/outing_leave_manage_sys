import API from './api';
import type { User } from '../contexts/AuthContext';

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await API.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await API.put('/users/profile', data);
    return response.data;
  }
};
