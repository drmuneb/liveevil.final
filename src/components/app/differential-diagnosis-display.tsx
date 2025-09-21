'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DifferentialDiagnoses } from '@/lib/types';

type DifferentialDiagnosisDisplayProps = {
  data: DifferentialDiagnoses | null;
};

export function DifferentialDiagnosisDisplay({ data }: DifferentialDiagnosisDisplayProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Differential Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No diagnosis data available. Generate a report to see suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Differential Diagnosis (DDx)</CardTitle>
        <CardDescription>
          A ranked list of potential diagnoses based on the provided patient data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Diagnosis (English)</TableHead>
              <TableHead>Diagnosis (Persian)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.differentialDiagnoses.map((dx) => (
              <TableRow key={dx.rank}>
                <TableCell className="font-bold text-lg text-primary">{dx.rank}</TableCell>
                <TableCell>{dx.diagnosisEn}</TableCell>
                <TableCell className="text-right" dir="rtl">{dx.diagnosisFa}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
