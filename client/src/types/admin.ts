export type RegisterRequest = {
  loginId: string;
  password: string;
  name: string;
};

export type RegisterResponse = {
  message: string;
};

export type ChildAdmin = {
  id: number;
  loginId: string;
  name: string;
};

export type ChildAdminResponse = {
  message: string;
  data: ChildAdmin[];
};

export type DeleteChildResponse = {
  message: string;
};
