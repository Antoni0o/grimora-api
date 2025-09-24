import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      sheets_limit: {
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      sheets_count: {
        type: 'number',
        required: true,
        defaultValue: 0,
      },
      plan: {
        type: 'number',
        required: true,
        defaultValue: 0,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [process.env.CORS_ORIGINS ?? ''],
});

export type UserSession = typeof auth.$Infer.Session;
