'use client';

import { useAuth } from './useAuth';

/**
 * Custom hook for handling protected actions
 * Only redirects to login when user actually tries to do something that requires auth
 */
export const useProtectedAction = () => {
    const { requireAuth } = useAuth();

    /**
     * Wrap any protected action with this function
     * @param action - The action to perform if authenticated
     * @returns Promise<boolean> - true if action was performed, false if auth failed
     */
    const executeProtected = async (action: () => void | Promise<void>): Promise<boolean> => {
        const isAuthorized = await requireAuth();

        if (isAuthorized) {
            await action();
            return true;
        }

        return false; // User was redirected to login
    };

    return { executeProtected };
};