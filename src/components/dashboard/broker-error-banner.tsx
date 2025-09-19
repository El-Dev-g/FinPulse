// src/components/dashboard/broker-error-banner.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BrokerErrorBanner({ error }: { error?: string | null }) {
  const defaultMessage = "The investment tracking feature is currently unavailable. This is likely due to missing or incorrect Alpaca API keys in your environment variables. Please check your configuration.";
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Investment Feature Error</AlertTitle>
      <AlertDescription>
        {error || defaultMessage}
      </AlertDescription>
    </Alert>
  );
}
