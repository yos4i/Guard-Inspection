import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // For web builds, always use /api (handled by API routes in app/api)
  if (typeof window !== 'undefined') {
    return '/api';
  }

  // For native mobile, use the env variable or throw error
  const apiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (apiUrl) {
    return apiUrl;
  }

  throw new Error(
    "No base url found for native app. Please set EXPO_PUBLIC_RORK_API_BASE_URL"
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
