
import { apiRequest } from './api';

// Send login credentials to Express backend.
export async function loginStaff(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  });
}
