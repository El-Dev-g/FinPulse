// src/components/dashboard/broker-error-banner.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function BrokerErrorBanner({ error }: { error?: string | null }) {
  const defaultMessage = "The investment tracking feature is currently unavailable. This is likely due to missing or incorrect Alpaca API keys in your environment variables.";
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Investment Feature Error</AlertTitle>
      <AlertDescription>
        {error || defaultMessage}
         <div className="mt-4">
            <p className="text-xs">You can get your paper trading keys from the Alpaca dashboard.</p>
            <Button asChild variant="link" className="p-0 h-auto">
                <a href="https://app.alpaca.markets/paper/dashboard/overview" target="_blank" rel="noopener noreferrer">
                    Go to Alpaca Dashboard
                </a>
            </Button>
         </div>
      </AlertDescription>
    </Alert>
  );
}
