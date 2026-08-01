import { create } from "zustand";

interface RegisterModalState {
  //Form Value
  blogUrl: string;
  bloggerName: string;
  userName: string;
  email: string;

  //Vaildation state
  blogUrlValid: boolean;
  bloggerNameValid: boolean;
  userNameValid: boolean;
  emailValid: boolean;

  //Setting Form Value
  setBlogUrl: (url: string) => void;
  setBloggerName: (name: string) => void;
  setUserName: (name: string) => void;
  setEmail: (email: string) => void;

  //Setting Vaildation State
  setBlogUrlValid: (valid: boolean) => void;
  setBloggerNameValid: (valid: boolean) => void;
  setUserNameValid: (valid: boolean) => void;
  setEmailValid: (valid: boolean) => void;

  //Vaildation Handler
  handleInputChange: (
    value: string,
    setValue: (value: string) => void,
    setValid: (valid: boolean) => void,
    validate: (value: string) => boolean
  ) => void;

  //Other
  resetInputs: () => void;
  isFormValid: () => boolean;
}

export const useRegisterModalStore = create<RegisterModalState>((set, get) => ({
  // Initial Form Values
  blogUrl: "",
  bloggerName: "",
  userName: "",
  email: "",

  // Initial Validation States
  blogUrlValid: false,
  bloggerNameValid: false,
  userNameValid: false,
  emailValid: false,

  // Setters Form Values
  setBlogUrl: (url) => set({ blogUrl: url }),
  setBloggerName: (name) => set({ bloggerName: name }),
  setUserName: (name) => set({ userName: name }),
  setEmail: (email) => set({ email }),

  // Setters Validation States
  setBlogUrlValid: (valid) => set({ blogUrlValid: valid }),
  setBloggerNameValid: (valid) => set({ bloggerNameValid: valid }),
  setUserNameValid: (valid) => set({ userNameValid: valid }),
  setEmailValid: (valid) => set({ emailValid: valid }),

  // Reset
  resetInputs: () =>
    set({
      blogUrl: "",
      bloggerName: "",
      userName: "",
      email: "",
      blogUrlValid: false,
      bloggerNameValid: false,
      userNameValid: false,
      emailValid: false,
    }),

  // Check Form Vaildation
  isFormValid: () => {
    const state = get();
    return state.blogUrlValid && state.bloggerNameValid && state.userNameValid && state.emailValid;
  },

  // Handle input change with validation
  handleInputChange: (value, setValue, setValid, validate) => {
    setValue(value);
    setValid(validate(value));
  },
}));
