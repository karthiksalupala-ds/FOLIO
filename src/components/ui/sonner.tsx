import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      theme="light"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-surface text-fg border-border shadow-[var(--shadow-pop)]",
          title: "text-fg",
          description: "text-muted",
        },
      }}
    />
  );
}

export { Toaster };
