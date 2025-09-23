'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/app/header';
import { PatientDetailsForm } from '@/components/app/patient-details-form';
import { BilingualAssistant } from '@/components/app/bilingual-assistant';
import type { PatientDetails } from '@/lib/types';

export default function Home() {
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [printableArea, setPrintableArea] = useState<HTMLElement | null>(null);

  const handlePrint = () => {
    if (printableArea) {
      const printContents = printableArea.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader onPrint={handlePrint} />
      <main
        className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8"
        ref={(el) => setPrintableArea(el)}
      >
        <div className="w-full max-w-4xl mx-auto grid gap-4 md:gap-8">
          {!patientDetails ? (
            <PatientDetailsForm
              onFormSubmit={setPatientDetails}
            />
          ) : (
            <BilingualAssistant patientDetails={patientDetails} />
          )}
        </div>
      </main>
    </div>
  );
}
