import sodium from 'libsodium-wrappers';

export interface EncryptedData {
  encrypted: string;
  nonce: string;
}

class EncryptionService {
  private key: Uint8Array | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await sodium.ready;
    
    const keyFromEnv = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    
    if (!keyFromEnv) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    try {
      this.key = sodium.from_hex(keyFromEnv);
      if (this.key.length !== sodium.crypto_secretbox_KEYBYTES) {
        throw new Error('Invalid key length');
      }
    } catch (error) {
        console.log(error);
      throw new Error('Invalid encryption key format');
    }
  }

  private async ensureReady() {
    if (!this.key) {
      await this.initialize();
    }
  }

  async encryptPassword(password: string): Promise<EncryptedData> {
    await this.ensureReady();
    
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }

    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const encrypted = sodium.crypto_secretbox_easy(password, nonce, this.key);

    return {
      encrypted: sodium.to_hex(encrypted),
      nonce: sodium.to_hex(nonce)
    };
  }

  async decryptPassword(encryptedData: EncryptedData): Promise<string> {
    await this.ensureReady();
    
    if (!this.key) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const decrypted = sodium.crypto_secretbox_open_easy(
        sodium.from_hex(encryptedData.encrypted),
        sodium.from_hex(encryptedData.nonce),
        this.key
      );

      return sodium.to_string(decrypted);
    } catch (error) {
        console.log(error);
      throw new Error('Failed to decrypt password');
    }
  }

  async encryptPasswordForStorage(password: string): Promise<string> {
    const encryptedData = await this.encryptPassword(password);
    return JSON.stringify(encryptedData);
  }

  async decryptPasswordFromStorage(storageString: string): Promise<string> {
    const encryptedData: EncryptedData = JSON.parse(storageString);
    return this.decryptPassword(encryptedData);
  }
}

export const encryptionService = new EncryptionService();