"use client";
import { UtensilsCrossed } from 'lucide-react';

export function AppLogo({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return <UtensilsCrossed className="h-7 w-7 text-primary" />;
  }
  return (
    <div className="flex items-center gap-2 p-1">
      <UtensilsCrossed className="h-8 w-8 text-primary" />
      <div className="flex flex-col">
        <h1 className="font-headline text-xl font-semibold leading-tight text-primary">
          Hora da
        </h1>
        <div className="flex items-center">
          <h2 className="font-headline text-lg font-medium leading-tight text-primary/80">
            Merenda
          </h2>
        </div>
      </div>
    </div>
  );
}
