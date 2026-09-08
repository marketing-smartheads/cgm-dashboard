import { google } from 'googleapis';

export function getGoogleAuth(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  // Fallback als iemand toch de oude JSON in GOOGLE_APPLICATION_CREDENTIALS heeft gezet
  const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (clientEmail && privateKey) {
    // Zorg ervoor dat \n letterlijke tekens worden omgezet naar echte regeleinden
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

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
      return new google.auth.GoogleAuth({
        credentials,
        scopes,
      });
    } else {
      return new google.auth.GoogleAuth({
        keyFile: credentialsEnv,
        scopes,
      });
    }
  }

  throw new Error('Geen geldige Google credentials gevonden in environment variables.');
}