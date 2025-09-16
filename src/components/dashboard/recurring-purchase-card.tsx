// src/components/dashboard/recurring-purchase-card.tsx

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function RecurringPurchaseCard() {
  return (
    <Card className="bg-primary/90 text-primary-foreground overflow-hidden">
      <CardContent className="p-4">
        <Link href="#" className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Image 
                src="/coins.png" 
                alt="Recurring Purchase" 
                width={64} 
                height={64}
                data-ai-hint="coins illustration"
            />
            <div>
              <h3 className="font-semibold">Set a recurring purchase</h3>
              <p className="text-sm text-primary-foreground/80">Automate your investing</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </CardContent>
    </Card>
  );
}
