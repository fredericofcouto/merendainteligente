"use client";
import { UtensilsCrossed, Sparkles } from 'lucide-react';

export function AppLogo({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return <UtensilsCrossed className="h-7 w-7 text-primary" />;
  }
  return (
    <div className="flex items-center gap-2 p-1">
      <UtensilsCrossed className="h-8 w-8 text-primary" />
      <div className="flex flex-col">
        <h1 className="font-headline text-xl font-semibold leading-tight text-primary">
          Merenda
        </h1>
        <div className="flex items-center">
          <h2 className="font-headline text-lg font-medium leading-tight text-primary/80">
            Inteligente
          </h2>
          <Sparkles className="ml-1 h-3 w-3 text-accent" />
        </div>
      </div>
    </div>
  );
}
