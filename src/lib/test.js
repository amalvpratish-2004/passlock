// generate-key.js
import sodium from 'libsodium-wrappers'

async function generateKey() {
    await sodium.ready;
    
    // Generate a random 32-byte key
    const key = sodium.crypto_secretbox_keygen();
    
    // Convert to hexadecimal string
    const keyHex = sodium.to_hex(key);
    
    console.log('=================================');
    console.log('ENCRYPTION KEY GENERATED');
    console.log('=================================');
    console.log('Add this to your .env.local file:');
    console.log(`ENCRYPTION_KEY=${keyHex}`);
    console.log('=================================');
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('1. Keep this key secure and never commit it to version control');
    console.log('2. Backup this key securely');
    console.log('3. Use the same key across all environments for the same database');
    console.log('4. If you lose this key, all encrypted data will be unrecoverable');
    console.log('=================================');
}

generateKey().catch(console.error);