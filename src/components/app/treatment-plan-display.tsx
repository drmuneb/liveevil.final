'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TreatmentPlan } from '@/lib/types';

type TreatmentPlanDisplayProps = {
  data: TreatmentPlan | null;
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
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {data.treatmentPlanEnglish}
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
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {data.treatmentPlanPersian}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
