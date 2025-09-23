'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  handleGenerateReport,
  handleTranslate,
  handleGenerateNextQuestion,
} from '@/lib/actions';
import type {
  DifferentialDiagnoses,
  PatientDetails,
  SoapNote,
  TreatmentPlan,
} from '@/lib/types';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { SoapNoteDisplay } from './soap-note-display';
import { DifferentialDiagnosisDisplay } from './differential-diagnosis-display';
import { TreatmentPlanDisplay } from './treatment-plan-display';
import { Spinner } from '../ui/spinner';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type BilingualAssistantProps = {
  patientDetails: PatientDetails;
};

type Message = {
    id: string;
    type: 'question' | 'answer';
    english: string;
    persian?: string;
    translation?: string;
    options?: { english: string; persian: string }[];
};

export function BilingualAssistant({ patientDetails }: BilingualAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [ddx, setDdx] = useState<DifferentialDiagnoses | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [initialQuestionFetched, setInitialQuestionFetched] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const { toast } = useToast();

  const patientInfoString = Object.entries(patientDetails)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  const fetchNextQuestion = async (history: Message[]) => {
    setIsGenerating(true);
    const conversation = history.map(m => ({
      role: m.type === 'question' ? 'model' : 'user',
      content: m.english,
    }));

    const result = await handleGenerateNextQuestion({
      patientInformation: patientInfoString,
      conversationHistory: conversation,
    });

    if (result.success && result.data) {
      if (result.data.isComplete) {
        setInterviewFinished(true);
        toast({ title: "Interview Complete", description: "You can now generate the full report." });
      } else if (result.data.nextQuestion) {
        const { english, persian, options } = result.data.nextQuestion;
        setMessages(prev => [...prev, {
          id: `q${prev.length}`,
          type: 'question',
          english,
          persian,
          options,
        }]);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not generate the next question.',
      });
    }
    setIsGenerating(false);
  };
  
  useEffect(() => {
    if (!initialQuestionFetched) {
        setInitialQuestionFetched(true);
        fetchNextQuestion([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestionFetched]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isGenerating]);


  const handleAnswerSubmit = (answerText?: string) => {
    const answer = (answerText || currentAnswer).trim();
    if (!answer) return;

    const newAnswer: Message = {
        id: `a${messages.filter(m => m.type === 'answer').length}`,
        type: 'answer',
        english: answer,
    };
    
    const updatedMessages = [...messages, newAnswer];
    setMessages(updatedMessages);
    setCurrentAnswer('');

    fetchNextQuestion(updatedMessages);
  };
  
  const generateReport = async () => {
    setIsGeneratingReport(true);
    const qaPairs = messages.filter(m => m.type === 'question' || m.type === 'answer')
      .reduce((acc, m, i, arr) => {
          if (m.type === 'question') {
              const qText = m.english;
              const aText = arr[i+1]?.type === 'answer' ? arr[i+1].english : 'Not answered';
              acc.push(`${qText}: ${aText}`);
          }
          return acc;
      }, [] as string[]).join('\n');
    
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
    setIsGeneratingReport(false);
  };

  const translateMessage = async (messageId: string, text: string) => {
    if (!text) return;
    
    setIsTranslating(true);
    const result = await handleTranslate({ text, targetLanguage: 'fa' });
    if (result.success && result.data) {
      setMessages(prevMessages => prevMessages.map(m => 
          m.id === messageId ? { ...m, translation: result.data!.translatedText } : m
      ));
    } else {
      toast({ variant: 'destructive', title: 'Translation Failed' });
    }
    setIsTranslating(false);
  }

  const interviewStarted = messages.length > 0;
  const lastMessage = messages.length > 0 ? messages[messages.length-1] : null;
  const isLastMessageQuestion = lastMessage?.type === 'question';

  return (
    <div className="grid gap-8">
      {!interviewStarted && isGenerating ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Starting Consultation</CardTitle>
            <CardDescription>Generating the first question...</CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center'>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col h-[75vh]">
            <CardHeader>
                <CardTitle>Bilingual AI Assistant</CardTitle>
                <CardDescription>Answer the questions to build the patient's report.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex items-start gap-3", msg.type === 'answer' && 'justify-end')}>
                                {msg.type === 'question' && (
                                    <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10">
                                        <AvatarFallback className='bg-transparent'><Sparkles className="h-5 w-5 text-primary" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "rounded-lg p-3 max-w-[80%]", 
                                    msg.type === 'question' ? 'bg-secondary' : 'bg-primary text-primary-foreground',
                                )}>
                                    <p className="font-medium">{msg.english}</p>
                                    {msg.persian && <p className="text-sm opacity-80 mt-1">{msg.persian}</p>}
                                    
                                    {msg.type === 'answer' && (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => translateMessage(msg.id, msg.english)} disabled={isTranslating} className="h-auto p-1 mt-2 -mb-1 text-xs text-primary-foreground/70 hover:text-primary-foreground/100">
                                                {isTranslating ? 'Translating...' : 'Translate to Persian'}
                                            </Button>
                                            {msg.translation && (
                                                <p className="text-xs opacity-80 mt-1 border-t border-primary-foreground/20 pt-1" dir='rtl'>
                                                    {msg.translation}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                         {isGenerating && !interviewFinished && (
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10">
                                    <AvatarFallback className='bg-transparent'><Sparkles className="h-5 w-5 text-primary" /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg p-3 bg-secondary">
                                    <Spinner className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                         )}
                    </div>
                </ScrollArea>
                
                {interviewStarted && !interviewFinished && (
                    <div className="flex flex-col gap-3 pt-4 border-t">
                        {isLastMessageQuestion && lastMessage.options && lastMessage.options.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                                {lastMessage.options.map(opt => (
                                    <Button key={opt.english} variant='outline' size='sm' className='h-auto bg-background hover:bg-primary/10 hover:border-primary border-input transition-all' onClick={() => handleAnswerSubmit(opt.english)}>
                                        {opt.english}
                                        <span className='text-xs opacity-70 ml-2'>({opt.persian})</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Textarea
                                placeholder="Describe your answer here..."
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAnswerSubmit();
                                    }
                                }}
                                className="min-h-[40px]"
                                disabled={isGenerating || !isLastMessageQuestion}
                            />
                            <Button onClick={() => handleAnswerSubmit()} disabled={!currentAnswer.trim() || isGenerating || !isLastMessageQuestion} size="icon">
                                <Send />
                            </Button>
                        </div>
                    </div>
                )}
                 {interviewFinished && (
                    <div className="text-center pt-4 border-t">
                        <Badge variant="secondary" className="text-base py-2 px-4">
                           Interview Complete
                        </Badge>
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
