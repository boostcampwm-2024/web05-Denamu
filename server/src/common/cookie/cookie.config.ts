export const cookieConfig = {
  PROD: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  },
  LOCAL: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  },
  DEV: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  },
};
