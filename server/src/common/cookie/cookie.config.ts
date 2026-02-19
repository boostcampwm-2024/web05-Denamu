export const cookieConfig = {
  PROD: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  },
  LOCAL: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  },
  DEV: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  },
};
