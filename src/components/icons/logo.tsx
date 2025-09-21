import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-stethoscope", className)}
    >
      <path d="M4 8v5a4 4 0 0 0 4 4h1" />
      <path d="M8 8v4" />
      <path d="M19 10a7 7 0 1 1-14 0" />
      <path d="m21 10-2 2-2-2" />
      <path d="m15 10-2 2-2-2" />
      <circle cx="18" cy="4" r="2" />
    </svg>
  );
  