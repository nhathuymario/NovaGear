import { create } from "zustand"

interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
}

interface UIStoreState {
    // Loading State
    isLoading: boolean
    loadingMessage?: string
    showLoading: (message?: string) => void
    hideLoading: () => void

    // Confirm Dialog State
    confirmConfig: ConfirmOptions | null
    confirmResolver: ((value: boolean) => void) | null
    requestConfirm: (options: ConfirmOptions | string) => Promise<boolean>
    resolveConfirm: (value: boolean) => void
}

export const useUIStore = create<UIStoreState>((set, get) => ({
    // Loading
    isLoading: false,
    loadingMessage: undefined,
    showLoading: (message?: string) => set({ isLoading: true, loadingMessage: message }),
    hideLoading: () => set({ isLoading: false, loadingMessage: undefined }),

    // Confirm
    confirmConfig: null,
    confirmResolver: null,
    requestConfirm: (options) => {
        return new Promise<boolean>((resolve) => {
            const config = typeof options === "string" ? { message: options } : options
            set({
                confirmConfig: config,
                confirmResolver: resolve,
            })
        })
    },
    resolveConfirm: (value: boolean) => {
        const { confirmResolver } = get()
        if (confirmResolver) {
            confirmResolver(value)
        }
        set({
            confirmConfig: null,
            confirmResolver: null,
        })
    },
}))
