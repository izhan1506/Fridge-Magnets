import { X } from "lucide-react";
import { toast as sonnerToast } from "sonner";

export function toast(message: string, options?: any) {
  const id = sonnerToast(message, {
    ...options,
    action: {
      label: <X size={18} />,
      onClick: () => sonnerToast.dismiss(id),
    },
  });
  return id;
}
