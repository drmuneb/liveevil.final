'use client';

import React, { useState, useTransition } from 'react';
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
  DifferentialDiagnoses,
  PatientDetails,
  Question,
  SoapNote,
  TreatmentPlan,
} from '@/lib/types';
import { Bot, Languages, Loader2, Send } from 'lucide-react';
import { SoapNoteDisplay } from './soap-note-display';
import { DifferentialDiagnosisDisplay } from './differential-diagnosis-display';
import { TreatmentPlanDisplay } from './treatment-plan-display';
import { Spinner } from '../ui/spinner';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';

type BilingualAssistantProps = {
  patientDetails: PatientDetails;
};

type Message = {
    id: string;
    type: 'question' | 'answer';
    english: string;
    persian?: string;
    translation?: string;
};


export function BilingualAssistant({ patientDetails }: BilingualAssistantProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [ddx, setDdx] = useState<DifferentialDiagnoses | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);

  const [isGeneratingQuestions, startQuestionGeneration] = useTransition();
  const [isGeneratingReport, startReportGeneration] = useTransition();
  const [isTranslating, startTranslation] = useTransition();

  const { toast } = useToast();

  const startInterview = () => {
    startQuestionGeneration(async () => {
      const result = await handleGenerateQuestions({
        patientDetails: `Chief Complaint: ${patientDetails.chiefComplaint}`,
        consciousnessLevel: patientDetails.consciousnessLevel,
      });
      if (result.success && result.data && result.data.questions.length > 0) {
        const initialQuestions = result.data.questions.map((q, i) => ({ ...q, id: `q${i}` }));
        setQuestions(initialQuestions);
        setMessages([{
            id: initialQuestions[0].id,
            type: 'question',
            english: initialQuestions[0].english,
            persian: initialQuestions[0].persian,
        }]);
        setCurrentQuestionIndex(0);
        toast({ title: 'Interview Started', description: 'AI has created a set of questions for the patient.' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Could not generate questions.',
        });
      }
    });
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const newAnswer: Message = {
        id: `a${currentQuestionIndex}`,
        type: 'answer',
        english: currentAnswer,
    };

    const nextMessages = [...messages, newAnswer];

    if (currentQuestionIndex < questions.length - 1) {
        const nextQuestion = questions[currentQuestionIndex + 1];
        nextMessages.push({
            id: nextQuestion.id,
            type: 'question',
            english: nextQuestion.english,
            persian: nextQuestion.persian,
        });
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
        // Last question answered
        setCurrentQuestionIndex(questions.length);
    }

    setMessages(nextMessages);
    setCurrentAnswer('');
  };
  
  const generateReport = () => {
    startReportGeneration(async () => {
      const patientInfoString = `Name: ${patientDetails.name}, Age: ${patientDetails.age}, Gender: ${patientDetails.gender}, DOB: ${patientDetails.dob.toDateString()}, Chief Complaint: ${patientDetails.chiefComplaint}, Consciousness: ${patientDetails.consciousnessLevel}`;
      
      const qaPairs = questions.map((q, i) => {
        const questionText = q.english;
        const answerText = messages.find(m => m.id === `a${i}`)?.english || 'Not answered';
        return `${questionText}: ${answerText}`;
      }).join('\n');
      
      const result = await handleGenerateReport({
        patientInformation: patientInfoString,
        answers: qaPairs
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

  const translateMessage = (messageId: string, text: string) => {
    if (!text) return;
    
    startTranslation(async () => {
      const result = await handleTranslate({ text, targetLanguage: 'en' });
      if (result.success && result.data) {
        setMessages(prevMessages => prevMessages.map(m => 
            m.id === messageId ? { ...m, translation: result.data!.translatedText } : m
        ));
      } else {
        toast({ variant: 'destructive', title: 'Translation Failed' });
      }
    });
  }

  const interviewStarted = questions.length > 0;
  const interviewFinished = currentQuestionIndex >= questions.length && questions.length > 0;

  return (
    <div className="grid gap-8">
      {!interviewStarted ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Start Consultation</CardTitle>
            <CardDescription>Generate AI-powered questions based on the patient's chief complaint.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={startInterview} disabled={isGeneratingQuestions}>
              {isGeneratingQuestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              Start AI Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col h-[70vh]">
            <CardHeader>
                <CardTitle>Bilingual AI Assistant</CardTitle>
                <CardDescription>Answer the questions to build the patient's report.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex items-start gap-3", msg.type === 'answer' && 'justify-end')}>
                                {msg.type === 'question' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot size={18} /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg p-3 max-w-[80%]", msg.type === 'question' ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
                                    <p className="font-medium">{msg.english}</p>
                                    {msg.persian && <p className="text-sm opacity-80 mt-1">{msg.persian}</p>}
                                    
                                    {msg.type === 'answer' && (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => translateMessage(msg.id, msg.english)} disabled={isTranslating} className="h-auto p-1 mt-2 -mb-1 text-xs text-primary-foreground/70 hover:text-primary-foreground/100">
                                                {isTranslating && !msg.translation ? 'Translating...' : 'Translate'}
                                            </Button>
                                            {msg.translation && (
                                                <p className="text-xs opacity-80 mt-1 border-t border-primary-foreground/20 pt-1">
                                                    {msg.translation}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                
                {!interviewFinished && (
                    <div className="flex gap-2 pt-4 border-t">
                        <Textarea
                            placeholder="Enter patient's answer here..."
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAnswerSubmit();
                                }
                            }}
                            className="min-h-[40px]"
                            disabled={interviewFinished}
                        />
                        <Button onClick={handleAnswerSubmit} disabled={!currentAnswer.trim() || interviewFinished} size="icon">
                            <Send />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      {interviewFinished && (
        <div className="flex justify-center">
          <Button onClick={generateReport} disabled={isGeneratingReport} size="lg">
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
