import instance from './axios';

export async function getMe() {
  const res = await instance.get('/api/users/me');
  return res.data; // { success, user }
}

export async function updateMe(data) {
  // Alias to /api/auth/me update
  const res = await instance.put('/api/auth/me', data);
  return res.data; // { success, user }
}

export default { getMe, updateMe };
