'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SoapNote } from '@/lib/types';
import 'tailwindcss/tailwind.css';

type SoapNoteDisplayProps = {
  data: SoapNote | null;
};

const MarkdownRenderer = ({ content, isRtl = false }: { content: string; isRtl?: boolean }) => {
  const sections = {
    'Subjective (S)': '',
    'Objective (O)': '',
    'Assessment (A)': '',
    'Plan (P)': '',
  };

  // A very basic parser to split content into S, O, A, P sections
  // It looks for the headings (e.g., ### Subjective)
  let currentSection: keyof typeof sections | null = null;
  content.split('\n').forEach(line => {
    if (line.includes('Subjective')) currentSection = 'Subjective (S)';
    else if (line.includes('Objective')) currentSection = 'Objective (O)';
    else if (line.includes('Assessment')) currentSection = 'Assessment (A)';
    else if (line.includes('Plan')) currentSection = 'Plan (P)';
    else if (currentSection && line.trim()) {
      sections[currentSection] += line + '\n';
    }
  });

  const renderContent = (text: string) => {
    const html = text
      .trim()
      .replace(/^\* \*\*(.*)\*\*:(.*)/gm, '<p><strong>$1:</strong>$2</p>')
      .replace(/^\* (.*)/gm, '<li class="list-disc ml-4">$1</li>')
      .replace(/(\d+)\. (.*)/gm, '<li class="list-decimal ml-4">$2</li>')
      .replace(/\n/g, '<br />')
      // Clean up extra breaks from lists
      .replace(/<\/li><br \/>/g, '</li>');

    return <div dangerouslySetInnerHTML={{ __html: `<ul>${html}</ul>`.replace(/<ul><br \/>/g, '<ul>').replace(/<br \/><ul>/g, '<ul>') }} />;
  };

  return (
    <div className={`space-y-4 ${isRtl ? 'rtl' : 'ltr'}`}>
      {Object.entries(sections).map(([title, sectionContent]) => (
        sectionContent.trim() ? (
          <div key={title}>
            <h4 className="text-md font-semibold text-primary mb-1">{title}</h4>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {renderContent(sectionContent)}
            </div>
          </div>
        ) : null
      ))}
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
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
            <h3 className='text-lg font-bold mb-2 pb-2 border-b'>English</h3>
            <MarkdownRenderer content={data.soapNoteEnglish} />
        </div>
        <div className='md:border-l md:pl-8'>
            <h3 className='text-lg font-bold mb-2 pb-2 border-b text-right' dir="rtl">فارسی (Persian)</h3>
            <MarkdownRenderer content={data.soapNotePersian} isRtl={true} />
        </div>
      </CardContent>
    </Card>
  );
}
