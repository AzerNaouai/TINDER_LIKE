const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export const signUp = async (
  email: string,
  password: string,
  userData: { first_name: string; last_name: string; role: string }
): Promise<ApiResponse<{ user: { id: string; email: string } }>> => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
      }),
    });
    const data = await response.json();
    return {
      data: data.id ? { user: { id: data.id, email } } : null,
      error: response.ok ? null : new Error(data.message || 'Registration failed'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok && data.user) {
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return { data: data.user, error: null };
    }

    return {
      data: null,
      error: new Error(data.message || 'Login failed'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const signOut = async (): Promise<ApiResponse<null>> => {
  localStorage.removeItem('auth_user');
  return { data: null, error: null };
};

export const getCurrentUser = async (): Promise<any> => {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};

export const getSession = async (): Promise<any> => {
  const user = localStorage.getItem('auth_user');
  return user ? { user: JSON.parse(user) } : null;
};

export const getProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/profiles/${userId}`);
    const data = await response.json();
    return {
      data: data.profile || null,
      error: response.ok ? null : new Error(data.message || 'Failed to load profile'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const updateProfile = async (userId: string, updates: any) => {
  try {
    const response = await fetch(`${API_BASE}/profiles/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return {
      data: data.profile || null,
      error: response.ok ? null : new Error(data.message || 'Failed to update profile'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getJobs = async (filters?: any) => {
  try {
    const response = await fetch(`${API_BASE}/jobs`);
    const data = await response.json();
    return {
      data: data.jobs || [],
      error: response.ok ? null : new Error(data.message || 'Failed to load jobs'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getJobById = async (jobId: string) => {
  try {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`);
    const data = await response.json();
    return {
      data: data.job || null,
      error: response.ok ? null : new Error(data.message || 'Failed to load job'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const swipeJob = async (userId: string, jobId: string, action: 'like' | 'pass' | 'maybe') => {
  try {
    const response = await fetch(`${API_BASE}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobSeekerId: userId, jobId, action }),
    });
    const data = await response.json();
    return {
      data: data.id ? { id: data.id } : null,
      error: response.ok ? null : new Error(data.message || 'Failed to record swipe'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getSwipedJobs = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/matches`);
    const data = await response.json();
    return {
      data: data.matches || [],
      error: response.ok ? null : new Error(data.message || 'Failed to load matches'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getBadges = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/badges`);
    const data = await response.json();
    return {
      data: data.badges || [],
      error: response.ok ? null : new Error(data.message || 'Failed to load badges'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const awardBadge = async (userId: string, badge: any) => {
  try {
    const response = await fetch(`${API_BASE}/badges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...badge }),
    });
    const data = await response.json();
    return {
      data: data.id ? { id: data.id } : null,
      error: response.ok ? null : new Error(data.message || 'Failed to award badge'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const subscribeToApplications = (_userId: string, _callback: (payload: any) => void) => {
  return { unsubscribe: () => {} };
};

export const subscribeToNotifications = (_userId: string, _callback: (payload: any) => void) => {
  return { unsubscribe: () => {} };
};

// Application helpers
export const applyToJob = async (userId: string, jobId: string, coverLetter?: string) => {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, jobId, coverLetter }),
    });
    const data = await response.json();
    return {
      data: data.id ? { id: data.id } : null,
      error: response.ok ? null : new Error(data.error || 'Failed to submit application'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getUserApplications = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/applications`);
    const data = await response.json();
    return {
      data: data.applications || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch applications'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
