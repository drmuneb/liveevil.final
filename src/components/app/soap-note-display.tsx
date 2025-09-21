'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SoapNote } from '@/lib/types';

type SoapNoteDisplayProps = {
  data: SoapNote | null;
};

const Section = ({ title, content }: { title: string; content?: string }) => (
  <div className="grid gap-1">
    <h4 className="font-semibold text-primary">{title}</h4>
    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content || 'N/A'}</p>
  </div>
);

const ParsedSoapNote = ({ note }: { note: string }) => {
    const sections = {
        S: '',
        O: '',
        A: '',
        P: '',
    };

    const lines = note.split('\n');
    let currentSection: 'S' | 'O' | 'A' | 'P' | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('S:') || trimmedLine.startsWith('Subjective:')) {
            currentSection = 'S';
        } else if (trimmedLine.startsWith('O:') || trimmedLine.startsWith('Objective:')) {
            currentSection = 'O';
        } else if (trimmedLine.startsWith('A:') || trimmedLine.startsWith('Assessment:')) {
            currentSection = 'A';
        } else if (trimmedLine.startsWith('P:') || trimmedLine.startsWith('Plan:')) {
            currentSection = 'P';
        }

        if (currentSection) {
            // Remove the prefix from the line
            const content = line.replace(/^(S:|O:|A:|P:|Subjective:|Objective:|Assessment:|Plan:)\s*/, '');
            sections[currentSection] += content + '\n';
        }
    }
    
    return (
        <div className="space-y-4">
            <Section title="Subjective" content={sections.S.trim()} />
            <Separator />
            <Section title="Objective" content={sections.O.trim()} />
            <Separator />
            <Section title="Assessment" content={sections.A.trim()} />
            <Separator />
            <Section title="Plan" content={sections.P.trim()} />
        </div>
    );
};


export function SoapNoteDisplay({ data }: SoapNoteDisplayProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SOAP Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No SOAP note data available. Generate a report to see it.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SOAP Note</CardTitle>
        <CardDescription>
          A structured clinical note in both English and Persian.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="english" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="persian">Persian (فارسی)</TabsTrigger>
          </TabsList>
          <TabsContent value="english" className="pt-4">
            <ParsedSoapNote note={data.soapNoteEnglish} />
          </TabsContent>
          <TabsContent value="persian" className="pt-4 text-right" dir="rtl">
            <ParsedSoapNote note={data.soapNotePersian} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
