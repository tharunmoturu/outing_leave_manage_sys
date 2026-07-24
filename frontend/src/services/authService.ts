import API from './api';

export const authService = {
  googleLogin: async (token: string) => {
    const response = await API.post('/auth/google', { token });
    return response.data;
  },
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  }
};
