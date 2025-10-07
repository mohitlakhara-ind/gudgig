import { useCallback } from 'react';
import toast from 'react-hot-toast';

type ToastOptions = {
  id?: string;
  duration?: number;
};

export function useToast() {
  const success = useCallback((message: string, options?: ToastOptions) => {
    toast.success(message, options);
  }, []);

  const error = useCallback((message: string, options?: ToastOptions) => {
    toast.error(message, options);
  }, []);

  const info = useCallback((message: string, options?: ToastOptions) => {
    toast(message, options);
  }, []);

  return { success, error, info };
}

export default useToast;


