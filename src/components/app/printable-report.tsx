'use client';
import React from 'react';
import type { PatientDetails, Message, SoapNote, DifferentialDiagnoses, TreatmentPlan } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '../ui/separator';
import { Logo } from '../icons/logo';
import { cn } from '@/lib/utils';
import { SoapNoteDisplay } from './soap-note-display';
import { DifferentialDiagnosisDisplay } from './differential-diagnosis-display';
import { TreatmentPlanDisplay } from './treatment-plan-display';


type PrintableReportProps = {
    patientDetails: PatientDetails | null;
    messages: Message[];
    soapNote: SoapNote | null;
    ddx: DifferentialDiagnoses | null;
    treatmentPlan: TreatmentPlan | null;
}

const DetailItem = ({ label, value, persianLabel }: { label: string, value?: string | number, persianLabel?: string }) => (
    <div>
        <p className="text-sm text-gray-500">{label} {persianLabel && <span className="text-xs">({persianLabel})</span>}</p>
        <p className="font-semibold">{value || 'N/A'}</p>
    </div>
);


export function PrintableReport({ patientDetails, messages, soapNote, ddx, treatmentPlan }: PrintableReportProps) {
    if (!patientDetails) {
        return null; // Or a message indicating no data
    }
    
    return (
        <div className="p-8 bg-white text-black font-sans">
            <header className="flex justify-between items-center pb-4 border-b-2 border-black">
                <div className="flex items-center gap-3">
                    <Logo className="h-12 w-12 text-black" />
                    <div>
                        <h1 className="text-3xl font-bold">LiveEvil</h1>
                        <p className="text-lg text-gray-600">Patient Report</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{patientDetails.name} {patientDetails.familyName}</p>
                    <p className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
                </div>
            </header>

            <section className="mt-8">
                <Card className="border-gray-400">
                    <CardHeader>
                        <CardTitle>Patient Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
                        <DetailItem label="Name" value={patientDetails.name} persianLabel='نام' />
                        <DetailItem label="Family Name" value={patientDetails.familyName} persianLabel='نام خانوادگی' />
                        <DetailItem label="Father's Name" value={patientDetails.fatherName} persianLabel='نام پدر' />
                        <DetailItem label="Date of Birth" value={patientDetails.dob} persianLabel='تاریخ تولد' />
                        <DetailItem label="Age" value={patientDetails.age} persianLabel='سن' />
                        <DetailItem label="Gender" value={patientDetails.gender} persianLabel='جنسیت' />
                        <Separator className="col-span-full my-2 bg-gray-300"/>
                        <DetailItem label="Ward" value={patientDetails.ward} persianLabel='بخش' />
                        <DetailItem label="Room" value={patientDetails.room} persianLabel='اتاق' />
                        <DetailItem label="Bed" value={patientDetails.bed} persianLabel='تخت' />
                        <DetailItem label="Date of Admission" value={patientDetails.dateOfAdmission} persianLabel='تاریخ پذیرش' />
                        <DetailItem label="Attending Physician" value={patientDetails.attendingPhysician} persianLabel='پزشک معالج' />
                        <Separator className="col-span-full my-2 bg-gray-300"/>
                        <div className="col-span-full">
                           <DetailItem label="Chief Complaint" value={patientDetails.chiefComplaint} persianLabel='شکایت اصلی'/>
                        </div>
                    </CardContent>
                </Card>
            </section>
            
            {messages.length > 0 && (
                 <section className="mt-8">
                    <Card className="border-gray-400">
                        <CardHeader>
                            <CardTitle>Consultation History</CardTitle>
                            <CardDescription>The full Q&A session with the AI assistant.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={msg.id} className={cn("flex items-start gap-3 text-sm", msg.type === 'answer' && 'justify-end')}>
                                    {msg.type === 'question' && (
                                        <div className="font-bold text-gray-600">Q:</div>
                                    )}
                                     {msg.type === 'answer' && (
                                        <div className="font-bold text-gray-800 text-right">A:</div>
                                    )}
                                    <div className={cn(
                                        "rounded-lg p-3 max-w-[90%]", 
                                        msg.type === 'question' ? 'bg-gray-100' : 'bg-blue-100 text-right',
                                    )}>
                                        <p className="font-medium">{msg.english}</p>
                                        {msg.persian && <p className="text-xs opacity-80 mt-1">{msg.persian}</p>}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            {(soapNote || ddx || treatmentPlan) && (
                <section className="mt-8 space-y-8" style={{ breakBefore: 'page' }}>
                    {soapNote && <SoapNoteDisplay data={soapNote} />}
                    {ddx && <DifferentialDiagnosisDisplay data={ddx} />}
                    {treatmentPlan && <TreatmentPlanDisplay data={treatmentPlan} />}
                </section>
            )}
        </div>
    )
}
