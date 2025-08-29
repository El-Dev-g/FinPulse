// src/app/dashboard/calculator/page.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalculatorIcon } from "lucide-react";

export default function CalculatorPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleButtonClick = (value: string) => {
    if (value === "=") {
      try {
        const evalResult = eval(input.replace(/x/g, "*"));
        setResult(evalResult.toString());
      } catch (error) {
        setResult("Error");
      }
    } else if (value === "C") {
      setInput("");
      setResult("");
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttons = [
    "7", "8", "9", "/",
    "4", "5", "6", "x",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
    "C"
  ];

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-6 w-6" />
              Calculator
            </CardTitle>
            <CardDescription>
              A simple calculator for your financial needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-right h-20 flex flex-col justify-end">
                <div className="text-sm text-muted-foreground truncate">{input || "0"}</div>
                <div className="text-3xl font-bold">{result}</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {buttons.map((btn) => (
                  <Button
                    key={btn}
                    onClick={() => handleButtonClick(btn)}
                    variant={["/", "x", "-", "+", "="].includes(btn) ? "default" : "outline"}
                    className={`text-xl font-bold h-16 ${btn === 'C' && 'col-span-4'}`}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
