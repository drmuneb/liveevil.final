'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TreatmentPlan } from '@/lib/types';
import 'tailwindcss/tailwind.css';

type TreatmentPlanDisplayProps = {
  data: TreatmentPlan | null;
};

const MarkdownRenderer = ({ content, isRtl = false }: { content: string, isRtl?: boolean }) => {
  // A simple markdown to HTML converter for demonstration.
  // In a real app, you would use a library like 'marked' or 'react-markdown'.
  const htmlContent = content
    .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-primary mt-4 mb-2">$1</h3>')
    .replace(/## (.*)/g, '<h2 class="text-xl font-bold border-b pb-2 mb-2">$1</h2>')
    .replace(/\* \*\*(.*)\*\*: (.*)/g, '<li class="ml-4 list-disc"><strong>$1:</strong> $2</li>')
    .replace(/\* (.*)/g, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, '<br />');

  return (
    <div 
      className={`prose prose-sm max-w-none text-muted-foreground ${isRtl ? 'rtl' : 'ltr'}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};


export function TreatmentPlanDisplay({ data }: TreatmentPlanDisplayProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treatment Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No treatment plan available. Generate a report to see suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Treatment Plan</CardTitle>
        <CardDescription>
          Includes medications, dosage adjustments, and test recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="english" className="w-full">
          <AccordionItem value="english">
            <AccordionTrigger>
                <div className="text-left">
                    <h3 className="font-semibold">English Plan</h3>
                    <p className="text-sm text-muted-foreground">Click to view details</p>
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-secondary/30 rounded-md border">
                <MarkdownRenderer content={data.treatmentPlanEnglish} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="persian">
            <AccordionTrigger>
                <div className="text-left">
                    <h3 className="font-semibold">Persian Plan (طرح درمان)</h3>
                    <p className="text-sm text-muted-foreground">برای مشاهده جزئیات کلیک کنید</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="text-right" dir="rtl">
              <div className="p-4 bg-secondary/30 rounded-md border">
                <MarkdownRenderer content={data.treatmentPlanPersian} isRtl={true} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
