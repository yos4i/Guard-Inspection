import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Use environment variable if set (for production backend on Render)
  const apiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (apiUrl) {
    return apiUrl;
  }

  // For web builds without env var, try /api (won't work on static hosting)
  if (typeof window !== 'undefined') {
    return '/api';
  }

  throw new Error(
    "No base url found. Please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
      async headers() {
        const token = await AsyncStorage.getItem('@auth_token');
        return {
          authorization: token || '',
        };
      },
    }),
  ],
});
