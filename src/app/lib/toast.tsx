import { X } from "lucide-react";
import { toast as sonnerToast } from "sonner";

const createToastWithCloseButton = (message: string, options?: any) => {
  const id = sonnerToast(message, {
    ...options,
    action: {
      label: <X size={18} />,
      onClick: () => sonnerToast.dismiss(id),
    },
  });
  return id;
};

export const toast = Object.assign(createToastWithCloseButton, {
  success: (message: string, options?: any) =>
    createToastWithCloseButton(message, { ...options, type: "success" }),
  error: (message: string, options?: any) =>
    createToastWithCloseButton(message, { ...options, type: "error" }),
  loading: (message: string, options?: any) =>
    createToastWithCloseButton(message, { ...options, type: "loading" }),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
});
