export const authService = {
  login: async (email, password) => {
    if (email && password) {
      return { success: true, token: "JWT-MOCK-CLEARANCE-STRING" };
    }
    return { success: false, error: "Invalid structural key parameters" };
  },
  logout: async () => {
    return { success: true };
  }
};