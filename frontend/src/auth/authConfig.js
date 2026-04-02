export const authConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
  redirectUri: 'https://duan.bio/dashboard',
  logoutUri: 'https://duan.bio',
  scopes: ['openid', 'email', 'profile'],
};
