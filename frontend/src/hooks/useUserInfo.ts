import { useAuth0 } from '@auth0/auth0-react';

export function useUserInfo() {
  const { user } = useAuth0();
  if (!user) return { userId: '', name: '', email: '' };
  return {
    userId: user.sub || '',
    name: user.name || user.nickname || user.email || '',
    email: user.email || '',
  };
}
