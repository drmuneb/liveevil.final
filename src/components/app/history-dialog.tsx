
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { HistoryEntry, PatientDetails } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SoapNoteDisplay } from './soap-note-display';
import { DifferentialDiagnosisDisplay } from './differential-diagnosis-display';
import { TreatmentPlanDisplay } from './treatment-plan-display';


type HistoryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoadSession: (patientDetails: PatientDetails) => void;
};

export function HistoryDialog({
  isOpen,
  onOpenChange,
  onLoadSession,
}: HistoryDialogProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const storedHistory = JSON.parse(
          localStorage.getItem('medic_assist_history') || '[]'
        );
        setHistory(storedHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
        setHistory([]);
      }
    }
  }, [isOpen]);

  const deleteEntry = (id: string) => {
    const updatedHistory = history.filter((entry) => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('medic_assist_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('medic_assist_history');
  }

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  }

  const handleViewDetails = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
  };

  if (selectedEntry) {
    return (
       <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Report for {selectedEntry.patientDetails.name} {selectedEntry.patientDetails.familyName}</DialogTitle>
            <DialogDescription>
              Generated on {formatTimestamp(selectedEntry.timestamp)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className='h-full'>
                <div className='pr-6 space-y-4'>
                    <Tabs defaultValue="soap" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="soap">SOAP Note</TabsTrigger>
                        <TabsTrigger value="ddx">Differential Diagnosis</TabsTrigger>
                        <TabsTrigger value="plan">Treatment Plan</TabsTrigger>
                        </TabsList>
                        <TabsContent value="soap">
                            <SoapNoteDisplay data={selectedEntry.soapNote} />
                        </TabsContent>
                        <TabsContent value="ddx">
                            <DifferentialDiagnosisDisplay data={selectedEntry.ddx} />
                        </TabsContent>
                        <TabsContent value="plan">
                            <TreatmentPlanDisplay data={selectedEntry.treatmentPlan} />
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEntry(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session History</DialogTitle>
          <DialogDescription>
            Here are your previously saved patient reports.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-4 pr-6">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No history found.
              </p>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {entry.patientDetails.name} {entry.patientDetails.familyName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(entry)}
                    >
                      View
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className='h-8 w-8'>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this history entry.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEntry(entry.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter className='sm:justify-between'>
            {history.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Clear All History</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all your saved session history. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearHistory}>Yes, delete all</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
