'use client';

import React, { useState, useTransition } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  handleGenerateQuestions,
  handleGenerateReport,
  handleTranslate,
} from '@/lib/actions';
import type {
  Answer,
  DifferentialDiagnoses,
  PatientDetails,
  Question,
  SoapNote,
  TreatmentPlan,
} from '@/lib/types';
import { Bot, Languages, Loader2 } from 'lucide-react';
import { SoapNoteDisplay } from './soap-note-display';
import { DifferentialDiagnosisDisplay } from './differential-diagnosis-display';
import { TreatmentPlanDisplay } from './treatment-plan-display';
import { Spinner } from '../ui/spinner';

type BilingualAssistantProps = {
  patientDetails: PatientDetails;
};

export function BilingualAssistant({ patientDetails }: BilingualAssistantProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [ddx, setDdx] = useState<DifferentialDiagnoses | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [translation, setTranslation] = useState<Record<string, string>>({});

  const [isGeneratingQuestions, startQuestionGeneration] = useTransition();
  const [isGeneratingReport, startReportGeneration] = useTransition();
  const [isTranslating, startTranslation] = useTransition();

  const { toast } = useToast();

  const generateQuestions = () => {
    startQuestionGeneration(async () => {
      const result = await handleGenerateQuestions({
        patientDetails: `Chief Complaint: ${patientDetails.chiefComplaint}`,
        consciousnessLevel: patientDetails.consciousnessLevel,
      });
      if (result.success && result.data) {
        setQuestions(result.data.questions.map((q, i) => ({ ...q, id: `q${i}` })));
        toast({ title: 'Questions Generated', description: 'AI has created a set of questions for the patient.' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  };
  
  const generateReport = () => {
    startReportGeneration(async () => {
      const patientInfoString = `Name: ${patientDetails.name}, Age: ${patientDetails.age}, Gender: ${patientDetails.gender}, DOB: ${patientDetails.dob.toDateString()}, Chief Complaint: ${patientDetails.chiefComplaint}, Consciousness: ${patientDetails.consciousnessLevel}`;
      const answersString = questions.map(q => `${q.english}: ${answers[q.id] || 'Not answered'}`).join('\n');
      
      const result = await handleGenerateReport({
        patientInformation: patientInfoString,
        answers: answersString
      });

      if (result.success && result.data) {
        setSoapNote(result.data.soapNote);
        setDdx(result.data.ddx);
        setTreatmentPlan(result.data.treatmentPlan);
        toast({ title: 'Report Generated', description: 'SOAP note, DDx, and treatment plan are ready.' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Generating Report',
          description: result.error,
        });
      }
    });
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const translateAnswer = (questionId: string) => {
    const text = answers[questionId];
    if (!text) return;
    
    startTranslation(async () => {
      const result = await handleTranslate({ text, targetLanguage: 'en' });
      if (result.success && result.data) {
        setTranslation(prev => ({ ...prev, [questionId]: result.data!.translatedText }));
      } else {
        toast({ variant: 'destructive', title: 'Translation Failed' });
      }
    });
  }

  const allQuestionsAnswered = questions.length > 0 && questions.every(q => answers[q.id] && answers[q.id].trim() !== '');

  return (
    <div className="grid gap-8">
      {questions.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Start Consultation</CardTitle>
            <CardDescription>Generate AI-powered questions based on the patient's chief complaint.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateQuestions} disabled={isGeneratingQuestions}>
              {isGeneratingQuestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              Generate Questions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Bilingual Interview Questions</CardTitle>
            <CardDescription>Ask the patient the following questions and record their answers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {questions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={q.id}>
                  <AccordionTrigger>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{q.english}</span>
                      <span className="text-sm text-muted-foreground">{q.persian}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2">
                       <Textarea
                        placeholder="Enter patient's answer here..."
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-between items-center">
                        <Button variant="ghost" size="sm" onClick={() => translateAnswer(q.id)} disabled={isTranslating || !answers[q.id]}>
                          <Languages className="mr-2 h-4 w-4" />
                          {isTranslating ? 'Translating...' : 'Translate to English'}
                        </Button>
                        {isTranslating && translation[q.id] && <Spinner />}
                      </div>
                      {translation[q.id] && (
                        <p className="text-sm text-muted-foreground border p-2 rounded-md bg-secondary">
                          <strong>Translated:</strong> {translation[q.id]}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={generateReport} disabled={!allQuestionsAnswered || isGeneratingReport} size="lg">
            {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Generate Full Report
          </Button>
        </div>
      )}
      
      {(isGeneratingReport || soapNote) && (
        <Tabs defaultValue="soap" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="soap">SOAP Note</TabsTrigger>
            <TabsTrigger value="ddx">Differential Diagnosis</TabsTrigger>
            <TabsTrigger value="plan">Treatment Plan</TabsTrigger>
          </TabsList>
          <TabsContent value="soap">
            {isGeneratingReport && !soapNote ? <Card className="p-8 flex justify-center items-center min-h-[200px]"><Spinner/></Card> : <SoapNoteDisplay data={soapNote} />}
          </TabsContent>
          <TabsContent value="ddx">
            {isGeneratingReport && !ddx ? <Card className="p-8 flex justify-center items-center min-h-[200px]"><Spinner/></Card> : <DifferentialDiagnosisDisplay data={ddx} />}
          </TabsContent>
          <TabsContent value="plan">
            {isGeneratingReport && !treatmentPlan ? <Card className="p-8 flex justify-center items-center min-h-[200px]"><Spinner/></Card> : <TreatmentPlanDisplay data={treatmentPlan} />}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
