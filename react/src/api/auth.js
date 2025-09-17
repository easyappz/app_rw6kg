import instance from './axios';

export async function login(data) {
  const res = await instance.post('/api/auth/login', data);
  return res.data; // { success, token, user }
}

export async function register(data) {
  const res = await instance.post('/api/auth/register', data);
  return res.data; // { success, token, user }
}

export async function me() {
  const res = await instance.get('/api/auth/me');
  return res.data; // { success, user }
}

export async function updateProfile(data) {
  const res = await instance.put('/api/auth/me', data);
  return res.data; // { success, user }
}

export async function changePassword(data) {
  const res = await instance.put('/api/auth/password', data);
  return res.data; // { success, message }
}

export default {
  login,
  register,
  me,
  updateProfile,
  changePassword,
};
