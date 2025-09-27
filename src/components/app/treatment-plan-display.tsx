'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TreatmentPlan } from '@/lib/types';

type TreatmentPlanDisplayProps = {
  data: TreatmentPlan | null;
};

const MarkdownRenderer = ({ content, isRtl = false }: { content: string, isRtl?: boolean }) => {
  const processLine = (line: string) => {
    return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  const lines = content.split('\n');
  const elements = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const isListItem = trimmedLine.startsWith('* ') || trimmedLine.match(/^\d+\.\s/);

    if (isListItem) {
      const currentListType = trimmedLine.startsWith('* ') ? 'ul' : 'ol';
      if (listType && currentListType !== listType) {
        // End previous list
        const ListTag = listType;
        elements.push(
          <ListTag key={`list-${index}-prev`} className="list-inside space-y-1">
            {currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processLine(item) }} />)}
          </ListTag>
        );
        currentList = [];
      }
      
      listType = currentListType;
      currentList.push(trimmedLine.replace(/^\* |^\d+\.\s/, ''));
    } else {
      if (currentList.length > 0 && listType) {
         // End of a list block because the current line is not a list item
        const ListTag = listType;
        elements.push(
          <ListTag key={`list-${index}`} className={`list-inside space-y-1 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
            {currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processLine(item) }} />)}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
      
      if (trimmedLine.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-lg font-semibold text-primary mt-4 mb-2">{trimmedLine.substring(4)}</h3>);
      } else if (trimmedLine) {
        // Line is not a list item, but part of the previous item (multiline)
        if (currentList.length > 0) {
           currentList[currentList.length - 1] += ' ' + trimmedLine;
        } else {
          // It's a paragraph
           elements.push(<p key={index} dangerouslySetInnerHTML={{__html: processLine(trimmedLine)}} />);
        }
      }
    }
  });

  // Add any remaining list items
  if (currentList.length > 0 && listType) {
    const ListTag = listType;
    elements.push(
      <ListTag key="list-final" className={`list-inside space-y-1 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}>
        {currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processLine(item) }} />)}
      </ListTag>
    );
  }

  return (
    <div className={`prose prose-sm max-w-none text-muted-foreground ${isRtl ? 'rtl' : 'ltr'}`}>
      {elements}
    </div>
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
