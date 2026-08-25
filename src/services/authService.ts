export interface UserSession {
  email: string;
  role?: string;
  goal?: string;
}

export const authService = {
  signUp: async (email: string): Promise<UserSession> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const session: UserSession = { email: email || 'student@edupye.com' };
    localStorage.setItem('userEmail', session.email);
    localStorage.setItem('user', JSON.stringify(session));
    return session;
  },

  setOnboardingGoal: async (goal: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    localStorage.setItem('userGoal', goal);
  },

  logout: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userGoal');
  },

  getCurrentUser: (): UserSession | null => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      const email = localStorage.getItem('userEmail');
      return email ? { email } : null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};
