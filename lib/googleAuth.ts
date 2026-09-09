import { google } from 'googleapis';

export function getGoogleAuth(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  // Voorkeur: base64-encoded key (voorkomt newline/quote-problemen op Vercel)
  let privateKey: string | undefined;
  if (process.env.GOOGLE_PRIVATE_KEY_B64) {
    privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_B64, 'base64').toString('utf-8');
  } else if (process.env.GOOGLE_PRIVATE_KEY) {
    privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (clientEmail && privateKey) {
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes,
    });
  }

  if (credentialsEnv) {
    if (credentialsEnv.trim().startsWith('{')) {
      const credentials = JSON.parse(credentialsEnv);
      if (credentials.private_key && credentials.private_key.includes('\\n')) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      return new google.auth.GoogleAuth({ credentials, scopes });
    } else {
      return new google.auth.GoogleAuth({ keyFile: credentialsEnv, scopes });
    }
  }

  throw new Error('Geen geldige Google credentials gevonden in environment variables.');
}