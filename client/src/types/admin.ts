export type RegisterRequest = {
  password: string;
  name: string;
  email: string;
};

export type RegisterResponse = {
  message: string;
};

export type ChildAdmin = {
  id: number;
  email: string;
  name: string;
};

export type ChildAdminResponse = {
  message: string;
  data: ChildAdmin[];
};

export type DeleteChildResponse = {
  message: string;
};
