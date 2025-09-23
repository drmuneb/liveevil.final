'use client';

import { Button } from '@/components/ui/button';
import { History, Printer, Settings } from 'lucide-react';
import { Logo } from '../icons/logo';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AppHeaderProps = {
  onPrint: () => void;
  onShowHistory: () => void;
};

export function AppHeader({ onPrint, onShowHistory }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 print:hidden">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">LiveEvil</h1>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onShowHistory}>
                <History className="mr-2 h-4 w-4" />
                <span>History</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPrint}>
                <Printer className="mr-2 h-4 w-4" />
                <span>Export PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
