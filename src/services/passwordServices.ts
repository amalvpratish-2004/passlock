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

export class PasswordService {
  static async createPassword(data: CreatePasswordData): Promise<{ success: boolean; id: string }> {
    // Send plain password to API - server will encrypt it
    const response = await fetch('/api/passwords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // Send plain password, API handles encryption
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

    // API returns already decrypted passwords
    return response.json();
  }

  static async updatePassword(id: string, data: Partial<CreatePasswordData>): Promise<{ success: boolean }> {
    // Send plain password to API - server will encrypt it if provided
    const response = await fetch(`/api/passwords/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update password');
    }

    return response.json();
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