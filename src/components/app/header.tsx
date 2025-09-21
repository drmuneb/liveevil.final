'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Logo } from '../icons/logo';

type AppHeaderProps = {
  onPrint: () => void;
};

export function AppHeader({ onPrint }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">Bilingual SOAP Assistant</h1>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <Button onClick={onPrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </header>
  );
}
