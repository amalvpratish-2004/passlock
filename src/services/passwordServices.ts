import { encryptionService } from "@/lib/encryption";

export interface PasswordItem {
  id: string;
  title: string;
  username: string;
  password: string; 
  url?: string;
  notes?: string;
  lastModified: string;
  created: string;
}

export interface CreatePasswordData {
  title: string;
  username: string;
  password: string; 
  url?: string;
  notes?: string;
  userId: string;
}

export interface UpdatePasswordData {
  title?: string;
  username?: string;
  password?: string; 
  url?: string;
  notes?: string;
}

export class PasswordService {
  static async createPassword(data: CreatePasswordData): Promise<{ success: boolean; id: string }> {
    const encryptedPassword = await encryptionService.encryptPasswordForStorage(data.password);
    const encryptedTitle = await encryptionService.encryptPasswordForStorage(data.title);
    const encryptedUsername = await encryptionService.encryptPasswordForStorage(data.username);
    const encryptedUrl = data.url ? await encryptionService.encryptPasswordForStorage(data.url) : null;
    const encryptedNotes = data.notes ? await encryptionService.encryptPasswordForStorage(data.notes) : null;
    const encryptedData = {
      title: encryptedTitle,
      username: encryptedUsername,
      password: encryptedPassword, 
      url: encryptedUrl,
      notes: encryptedNotes,
      userId: data.userId,
    }
    const response = await fetch('/api/passwords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedData),
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

    const data = await response.json();
    
    // Decrypt each password item in the array
    const decryptedPasswords = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.passwords.map(async (password: any) => {
        const decryptedTitle = await encryptionService.decryptPasswordFromStorage(password.title);
        const decryptedUsername = await encryptionService.decryptPasswordFromStorage(password.username);
        const decryptedPassword = await encryptionService.decryptPasswordFromStorage(password.password);
        const decryptedUrl = password.url ? await encryptionService.decryptPasswordFromStorage(password.url) : undefined;
        const decryptedNotes = password.notes ? await encryptionService.decryptPasswordFromStorage(password.notes) : undefined;

        return {
          id: password.id,
          title: decryptedTitle,
          username: decryptedUsername,
          password: decryptedPassword,
          url: decryptedUrl,
          notes: decryptedNotes,
          lastModified: password.lastModified,
          created: password.created
        };
      })
    );

    return { passwords: decryptedPasswords };
  }

  static async updatePassword(id: string, userId: string, data: UpdatePasswordData): Promise<PasswordItem> {
    // Encrypt the data before sending to API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const encryptedData: any = {};
    
    if (data.title !== undefined) {
      encryptedData.title = await encryptionService.encryptPasswordForStorage(data.title);
    }
    if (data.username !== undefined) {
      encryptedData.username = await encryptionService.encryptPasswordForStorage(data.username);
    }
    if (data.password !== undefined) {
      encryptedData.password = await encryptionService.encryptPasswordForStorage(data.password);
    }
    if (data.url !== undefined) {
      encryptedData.url = data.url ? await encryptionService.encryptPasswordForStorage(data.url) : null;
    }
    if (data.notes !== undefined) {
      encryptedData.notes = data.notes ? await encryptionService.encryptPasswordForStorage(data.notes) : null;
    }

    const response = await fetch(`/api/passwords/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...encryptedData,
        userId // Include userId for verification
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update password');
    }

    const result = await response.json();
    
    // Decrypt the returned password for client use
    const decryptedPassword = {
      id: result.password.id,
      title: await encryptionService.decryptPasswordFromStorage(result.password.title),
      username: await encryptionService.decryptPasswordFromStorage(result.password.username),
      password: await encryptionService.decryptPasswordFromStorage(result.password.password),
      url: result.password.url ? await encryptionService.decryptPasswordFromStorage(result.password.url) : undefined,
      notes: result.password.notes ? await encryptionService.decryptPasswordFromStorage(result.password.notes) : undefined,
      lastModified: result.password.lastModified,
      created: result.password.created
    };

    return decryptedPassword;
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