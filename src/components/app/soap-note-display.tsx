'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SoapNote } from '@/lib/types';
import 'tailwindcss/tailwind.css';

type SoapNoteDisplayProps = {
  data: SoapNote | null;
};

// This is a simple markdown renderer. For a production app, a more robust library
// like 'react-markdown' would be better.
const MarkdownRenderer = ({ content, isRtl = false }: { content: string, isRtl?: boolean }) => {
  const htmlContent = content
    .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-primary mt-4 mb-2">$1</h3>')
    .replace(/## (.*)/g, '<h2 class="text-xl font-bold border-b pb-2 mb-2">$1</h2>')
    .replace(/\* \*\*(.*)\*\*: (.*)/g, '<li class="ml-4 list-disc"><strong>$1:</strong> $2</li>')
    .replace(/\* (.*)/g, '<li class="ml-4 list-disc">$1</li>')
    .replace(/1\. (.*)/g, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/2\. (.*)/g, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/3\. (.*)/g, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n/g, '<br />');

  return (
    <div 
      className={`prose prose-sm max-w-none text-muted-foreground ${isRtl ? 'rtl' : 'ltr'}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
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
            <MarkdownRenderer content={data.soapNoteEnglish} />
          </TabsContent>
          <TabsContent value="persian" className="pt-4 text-right" dir="rtl">
            <MarkdownRenderer content={data.soapNotePersian} isRtl={true} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
