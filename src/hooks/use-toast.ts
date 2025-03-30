
import * as ToastPrimitive from "@/components/ui/toast";

// Export the correct toast components and hooks
export const useToast = () => {
  return {
    toast: (props: ToastPrimitive.ToastProps) => {
      // Use the internal showToast function from Toast component
      return ToastPrimitive.toast(props);
    }
  };
};

export const toast = ToastPrimitive.toast;

export default { useToast, toast };
