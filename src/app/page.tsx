'use client';

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app/header';
import { PatientDetailsForm } from '@/components/app/patient-details-form';
import { BilingualAssistant } from '@/components/app/bilingual-assistant';
import type { PatientDetails, SoapNote, DifferentialDiagnoses, TreatmentPlan, Message } from '@/lib/types';
import { HistoryDialog } from '@/components/app/history-dialog';
import { PrintableReport } from '@/components/app/printable-report';
import { ApiKeyDialog } from '@/components/app/api-key-dialog';

const API_KEY_STORAGE_KEY = 'google_ai_api_key';

export default function Home() {
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // API Key management
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsApiKeyDialogOpen(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    if (key) {
      setApiKey(key);
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      setIsApiKeyDialogOpen(false);
    }
  };

  // State for the full report
  const [messages, setMessages] = useState<Message[]>([]);
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [ddx, setDdx] = useState<DifferentialDiagnoses | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);


  const handlePrint = () => {
    window.print();
  };

  const startNewSession = () => {
    setPatientDetails(null);
    setMessages([]);
    setSoapNote(null);
    setDdx(null);
    setTreatmentPlan(null);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 print:bg-white">
      <AppHeader onPrint={handlePrint} onShowHistory={() => setIsHistoryOpen(true)} onShowSettings={() => setIsApiKeyDialogOpen(true)} />
      <main
        className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8 print:hidden"
      >
        <div className="w-full max-w-4xl mx-auto grid gap-4 md:gap-8">
          {!apiKey ? (
            <div className='text-center p-8 bg-card rounded-lg'>
              <p className='text-muted-foreground'>Please set your Google AI API key in the settings to begin.</p>
            </div>
          ) : !patientDetails ? (
            <PatientDetailsForm
              onFormSubmit={setPatientDetails}
              apiKey={apiKey}
            />
          ) : (
            <BilingualAssistant 
              apiKey={apiKey}
              patientDetails={patientDetails} 
              onSessionEnd={startNewSession}
              messages={messages}
              setMessages={setMessages}
              soapNote={soapNote}
              setSoapNote={setSoapNote}
              ddx={ddx}
              setDdx={setDdx}
              treatmentPlan={treatmentPlan}
              setTreatmentPlan={setTreatmentPlan}
            />
          )}
        </div>
      </main>
      <HistoryDialog
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        onLoadSession={(details) => {
          setPatientDetails(details);
          setIsHistoryOpen(false);
        }}
      />
       <ApiKeyDialog 
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
      <div className="hidden print:block">
        <PrintableReport
            patientDetails={patientDetails}
            messages={messages}
            soapNote={soapNote}
            ddx={ddx}
            treatmentPlan={treatmentPlan}
        />
      </div>
       <footer className="text-center p-4 text-muted-foreground text-sm print:hidden">
          Developed by <a href="https://github.com/muneebwanee" target="_blank" rel="noopener noreferrer" className="font-medium text-primary/80 hover:text-primary transition-colors">Muneeb Wani</a>
        </footer>
    </div>
  );
}
