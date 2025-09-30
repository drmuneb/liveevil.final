'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiKeyDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (apiKey: string) => void;
    currentKey: string | null;
}

export function ApiKeyDialog({ isOpen, onOpenChange, onSave, currentKey }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState(currentKey || '');

  const handleSave = () => {
    if(apiKey.trim()){
      onSave(apiKey.trim());
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Google AI API Key</DialogTitle>
          <DialogDescription>
            Enter your API key to use the generative features of this application. Your key is stored securely in your browser's local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={!apiKey.trim()}>Save Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
