export interface PasswordItem {
  id: string;
  title: string;
  username: string;
  password: string; // Plain password (decrypted by API)
  url?: string;
  notes?: string;
  lastModified: string;
  created: string;
}

export interface CreatePasswordData {
  title: string;
  username: string;
  password: string; // Plain password - API will encrypt it
  url?: string;
  notes?: string;
  userId: string;
}

export interface UpdatePasswordData {
  title?: string;
  username?: string;
  password?: string; // Plain password - API will encrypt it if provided
  url?: string;
  notes?: string;
}

export class PasswordService {
  static async createPassword(data: CreatePasswordData): Promise<{ success: boolean; id: string }> {
    const response = await fetch('/api/passwords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create password');
    }

    return response.json();
  }

  static async getUserPasswords(userId: string): Promise<{ passwords: PasswordItem[] }> {
    const response = await fetch(`/api/passwords?userId=${encodeURIComponent(userId)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch passwords');
    }

    return response.json();
  }

  static async updatePassword(id: string, userId: string, data: UpdatePasswordData): Promise<PasswordItem> {
    const response = await fetch(`/api/passwords/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        userId // Include userId for verification
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update password');
    }

    const result = await response.json();
    return result.password; // Return the updated password object
  }

  static async deletePassword(id: string, userId: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/passwords/${id}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete password');
    }

    return response.json();
  }
}