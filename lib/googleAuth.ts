import { google } from 'googleapis';

export function getGoogleAuth(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Google service account environment variables (CLIENT_EMAIL or PRIVATE_KEY) are missing.');
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      // Vervang eventuele letterlijke \n tekens netjes door echte regeleinden
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes,
  });
}