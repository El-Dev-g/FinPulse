// src/components/dashboard/broker-error-banner.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BrokerErrorBanner() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Feature Temporarily Unavailable</AlertTitle>
      <AlertDescription>
        The investment tracking feature is currently offline due to a technical
        issue with our brokerage partner integration. We are working to resolve this.
      </AlertDescription>
    </Alert>
  );
}
