'use client';

import React, { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Sparkles, Upload, User } from 'lucide-react';
import { format } from 'date-fns';
import type { PatientDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeDocument } from '@/lib/actions';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().min(0, 'Age must be a positive number.'),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.date({ required_error: 'Date of birth is required.' }),
  chiefComplaint: z.string().min(10, 'Please provide more details.'),
  consciousnessLevel: z.enum(['Alert', 'Drowsy', 'Unresponsive']),
});

type PatientDetailsFormProps = {
  onFormSubmit: (data: PatientDetails) => void;
  className?: string;
};

export function PatientDetailsForm({ onFormSubmit, className }: PatientDetailsFormProps) {
  const [isAnalyzing, startAnalyzing] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: '' as any,
      gender: undefined,
      dob: undefined,
      chiefComplaint: '',
      consciousnessLevel: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        startAnalyzing(async () => {
          const result = await handleAnalyzeDocument({ photoDataUri: dataUri });
          if (result.success && result.data) {
            const { name, age, gender, dob, chiefComplaint, consciousnessLevel } = result.data;
            if (name) form.setValue('name', name);
            if (age) form.setValue('age', age);
            if (gender) form.setValue('gender', gender);
            if (dob) {
                const date = new Date(dob);
                // Simple timezone correction
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                form.setValue('dob', new Date(date.getTime() + userTimezoneOffset));
            }
            if (chiefComplaint) form.setValue('chiefComplaint', chiefComplaint);
            if (consciousnessLevel) form.setValue('consciousnessLevel', consciousnessLevel);
            toast({ title: 'Document Analyzed', description: 'Patient details have been extracted.' });
          } else {
            toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
          }
        });
      };
      reader.readAsDataURL(file);
    }
     // Reset file input to allow uploading the same file again
     if(fileInputRef.current) {
        fileInputRef.current.value = '';
     }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit(values);
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle>Patient Details</CardTitle>
                <CardDescription>Enter the patient's information or upload a document.</CardDescription>
            </div>
            </div>
            <div className='relative'>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Document
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                 <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    <Sparkles className="h-3 w-3" />
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 42" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Date of Birth (Georgian)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the patient's main symptoms and reason for visit..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consciousnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level of Consciousness</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consciousness level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Alert">Alert</SelectItem>
                      <SelectItem value="Drowsy">Drowsy</SelectItem>
                      <SelectItem value="Unresponsive">Unresponsive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg">Start AI Assistant</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
