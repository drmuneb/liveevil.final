'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SoapNote } from '@/lib/types';

type SoapNoteDisplayProps = {
  data: SoapNote | null;
};

const MarkdownRenderer = ({ content, isRtl = false }: { content: string; isRtl?: boolean }) => {
    const renderContent = (text: string) => {
        const lines = text.trim().split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Handle list items
            if (line.startsWith('* ') || line.startsWith('1. ') || /^\d+\./.test(line.startsWith)) {
                if (!inList) {
                    html += line.startsWith('* ') ? '<ul>' : '<ol>';
                    inList = true;
                }
                const itemContent = line.replace(/^\* |^\d+\. /, '')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<li>${itemContent}</li>`;
            } else {
                if (inList) {
                    html += inList === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                }
                 // Handle headings
                if (line.startsWith('### ')) {
                    html += `<h3>${line.substring(4)}</h3>`;
                } else if (line.startsWith('## ')) {
                    html += `<h2>${line.substring(3)}</h2>`;
                } else if (line.startsWith('# ')) {
                    html += `<h1>${line.substring(2)}</h1>`;
                } else {
                    html += `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
                }
            }
        });

        if (inList) {
            html += inList === 'ul' ? '</ul>' : '</ol>';
        }

        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };

  const renderSections = (note: string) => {
    const sections: Record<string, string> = {
      'Subjective': '',
      'Objective': '',
      'Assessment': '',
      'Plan': ''
    };
    const sectionKeys = Object.keys(sections);
    let currentSection: string | null = null;
    
    note.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      const foundSection = sectionKeys.find(key => trimmedLine.includes(key));

      if (foundSection) {
        currentSection = foundSection;
      } else if (currentSection && trimmedLine) {
        sections[currentSection] += line + '\n';
      }
    });

    return (
        <div className="space-y-4">
            {sectionKeys.map(key => {
                if(sections[key].trim()){
                    return (
                        <div key={key}>
                            <h4 className="text-md font-semibold text-primary mb-1">{key}</h4>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                {renderContent(sections[key])}
                            </div>
                        </div>
                    )
                }
                return null;
            })}
        </div>
    )
  }

  return (
    <div className={`prose prose-sm max-w-none text-muted-foreground ${isRtl ? 'rtl' : 'ltr'}`}>
        {renderSections(content)}
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
