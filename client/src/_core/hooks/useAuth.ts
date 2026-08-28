import { trpc } from "@/lib/trpc";

export type User = {
  id?: number;
  openId?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  avatarUrl?: string | null;
  loginMethod?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastSignedIn?: string | Date;
} | null;

export function useAuth() {
  const utils = trpc.useUtils();
  const { data: user, isLoading: loading, error, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      window.location.href = "/";
    },
  });

  return {
    user: (user as User) ?? null,
    loading,
    error,
    isAuthenticated: Boolean(user),
    refetch,
    logout: () => logoutMutation.mutate(),
  };
}
