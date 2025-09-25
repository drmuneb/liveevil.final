'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChevronRight, File, HeartPulse, Sparkles, Upload, User, MessageSquare, Users } from 'lucide-react';
import type { PatientDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeDocument } from '@/lib/actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Spinner } from '../ui/spinner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  familyName: z.string().min(1, 'Family Name is required.'),
  fatherName: z.string().optional(),
  dob: z.string().min(1, 'Date of birth is required.'),
  age: z.coerce.number().min(0, 'Age must be a positive number.').optional(),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required.' }),
  perspective: z.enum(['first-person', 'third-person'], { required_error: 'Perspective is required.' }),
  
  ward: z.string().optional(),
  room: z.string().optional(),
  bed: z.string().optional(),
  dateOfAdmission: z.string().min(1, 'Date of admission is required.'),
  attendingPhysician: z.string().optional(),

  chiefComplaint: z.string().optional(),
  
  bp: z.string().optional(),
  rr: z.string().optional(),
  pr: z.string().optional(),
  spo2: z.string().optional(),
  
  eyeColor: z.string().optional(),
  skinColor: z.string().optional(),
  bruises: z.string().optional(),
  rashUlcers: z.string().optional(),

  pastMedicalHistory: z.string().optional(),
  pastSurgicalHistory: z.string().optional(),
  medication: z.string().optional(),
  familyHistory: z.string().optional(),
});

type PatientDetailsFormProps = {
  onFormSubmit: (data: PatientDetails) => void;
  className?: string;
};

const Section = ({ icon, title, description, children, defaultOpen = false }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className='w-full'>
                <div className='flex items-center justify-between p-4 border rounded-lg bg-secondary/50'>
                    <div className='flex items-center gap-4'>
                        {icon}
                        <div>
                            <h3 className='font-semibold text-left'>{title}</h3>
                            <p className='text-sm text-muted-foreground text-left'>{description}</p>
                        </div>
                    </div>
                    <ChevronRight className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-90')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className='p-6 border border-t-0 rounded-b-lg'>
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

export function PatientDetailsForm({ onFormSubmit, className }: PatientDetailsFormProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      familyName: '',
      fatherName: '',
      gender: undefined,
      perspective: 'first-person',
      dob: '',
      age: '' as unknown as number, // Fix: Initialize with empty string
      dateOfAdmission: '',
      ward: '',
      room: '',
      bed: '',
      attendingPhysician: '',
      chiefComplaint: '',
      bp: '',
      rr: '',
      pr: '',
      spo2: '',
      eyeColor: '',
      skinColor: '',
      bruises: '',
      rashUlcers: '',
      pastMedicalHistory: '',
      pastSurgicalHistory: '',
      medication: '',
      familyHistory: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setIsAnalyzing(true);
        const result = await handleAnalyzeDocument({ photoDataUri: dataUri });
        setIsAnalyzing(false);

        if (result.success && result.data) {
          const {
            name, familyName, fatherName, dob, age, gender,
            ward, room, bed, dateOfAdmission, attendingPhysician,
            chiefComplaint,
            bp, rr, pr, spo2,
            eyeColor, skinColor, bruises, rashUlcers,
            pastMedicalHistory, pastSurgicalHistory, medication, familyHistory
          } = result.data;
          
          if (name) form.setValue('name', name);
          if (familyName) form.setValue('familyName', familyName);
          if (fatherName) form.setValue('fatherName', fatherName);
          if (dob) form.setValue('dob', dob);
          if (age) form.setValue('age', age);
          if (gender) form.setValue('gender', gender);
          if (ward) form.setValue('ward', ward);
          if (room) form.setValue('room', room);
          if (bed) form.setValue('bed', bed);
          if (dateOfAdmission) form.setValue('dateOfAdmission', dateOfAdmission);
          if (attendingPhysician) form.setValue('attendingPhysician', attendingPhysician);
          if (chiefComplaint) form.setValue('chiefComplaint', chiefComplaint);
          if (bp) form.setValue('bp', bp);
          if (rr) form.setValue('rr', rr);
          if (pr) form.setValue('pr', pr);
          if (spo2) form.setValue('spo2', spo2);
          if (eyeColor) form.setValue('eyeColor', eyeColor);
          if (skinColor) form.setValue('skinColor', skinColor);
          if (bruises) form.setValue('bruises', bruises);
          if (rashUlcers) form.setValue('rashUlcers', rashUlcers);
          if (pastMedicalHistory) form.setValue('pastMedicalHistory', pastMedicalHistory);
          if (pastSurgicalHistory) form.setValue('pastSurgicalHistory', pastSurgicalHistory);
          if (medication) form.setValue('medication', medication);
          if (familyHistory) form.setValue('familyHistory', familyHistory);

          toast({ title: 'Document Analyzed', description: 'Patient details have been extracted.' });
        } else {
          toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
        }
      };
      reader.readAsDataURL(file);
    }
     if(fileInputRef.current) {
        fileInputRef.current.value = '';
     }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit(values as PatientDetails);
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>LiveEvil</CardTitle>
        <CardDescription>Enter the details or upload a document for AI analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className='relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center'>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className='mt-4 font-semibold'>Upload Document for AI Analysis</p>
            <p className="text-sm text-muted-foreground mt-1">بارگذاری سند برای تحلیل توسط هوش مصنوعی</p>
            <Button variant="link" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}>Click to upload or drag and drop</Button>
            <p className="text-xs text-muted-foreground">Handwritten notes, lab reports, etc.</p>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            {isAnalyzing && (
                <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center'>
                    <Spinner className='h-8 w-8 text-primary' />
                    <p className='mt-4 text-sm text-muted-foreground'>Analyzing document...</p>
                </div>
            )}
            <div className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                <Sparkles className="h-4 w-4" />
            </div>
        </div>

        <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                or enter the details manually below
                </span>
            </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <Section icon={<Users className="h-6 w-6 text-primary" />} title="Conversation Perspective" description="چشم انداز گفتگو" defaultOpen>
                <FormField
                  control={form.control}
                  name="perspective"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Who is the AI assistant talking to?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="first-person" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Talking to the patient directly (e.g., "How are you feeling?")
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="third-person" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Talking to a caregiver or third party (e.g., "How is the patient feeling?")
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </Section>

             <Section icon={<MessageSquare className="h-6 w-6 text-primary" />} title="Chief Complaint" description="شکایت اصلی" defaultOpen>
                <FormField
                    control={form.control}
                    name="chiefComplaint"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                {...field}
                                placeholder="Describe the patient's main symptoms and reason for visit..."
                                className="min-h-[100px]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Section>

            <Section icon={<User className="h-6 w-6 text-primary" />} title="Patient Identification" description="شناسایی بیمار">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name * <span className='text-muted-foreground text-xs'>(نام)</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="familyName" render={({ field }) => (
                  <FormItem><FormLabel>Family Name * <span className='text-muted-foreground text-xs'>(نام خانوادگی)</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="fatherName" render={({ field }) => (
                  <FormItem><FormLabel>Father's Name <span className='text-muted-foreground text-xs'>(نام پدر)</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dob" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth (Jalali) * <span className='text-muted-foreground text-xs'>(تاریخ تولد)</span></FormLabel><FormControl><Input placeholder="YYYY/MM/DD" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem><FormLabel>Age <span className='text-muted-foreground text-xs'>(سن)</span></FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender * <span className='text-muted-foreground text-xs'>(جنسیت)</span></FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                  </RadioGroup></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Section>
            
            <Section icon={<File className="h-6 w-6 text-primary" />} title="Admission Details" description="جزئیات پذیرش">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="ward" render={({ field }) => (
                        <FormItem><FormLabel>Ward <span className='text-muted-foreground text-xs'>(بخش)</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="room" render={({ field }) => (
                        <FormItem><FormLabel>Room <span className='text-muted-foreground text-xs'>(اتاق)</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="bed" render={({ field }) => (
                        <FormItem><FormLabel>Bed <span className='text-muted-foreground text-xs'>(تخت)</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="dateOfAdmission" render={({ field }) => (
                        <FormItem><FormLabel>Date of Admission (Jalali) * <span className='text-muted-foreground text-xs'>(تاریخ پذیرش)</span></FormLabel><FormControl><Input placeholder="YYYY/MM/DD" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="attendingPhysician" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Attending Physician <span className='text-muted-foreground text-xs'>(پزشک معالج)</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </Section>

            <Section icon={<HeartPulse className="h-6 w-6 text-primary" />} title="Reports & History" description="گزارشات و سوابق">
                <div className='space-y-6'>
                    <div className='space-y-2'>
                        <FormLabel>Vitals <span className='text-muted-foreground text-xs'>(علائم حياتي)</span></FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField control={form.control} name="bp" render={({ field }) => (<FormItem><FormControl><Input placeholder='BP' {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="rr" render={({ field }) => (<FormItem><FormControl><Input placeholder='RR' {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pr" render={({ field }) => (<FormItem><FormControl><Input placeholder='PR' {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="spo2" render={({ field }) => (<FormItem><FormControl><Input placeholder='SPO2' {...field} /></FormControl></FormItem>)} />
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <FormLabel>Observational Findings <span className='text-muted-foreground text-xs'>(یافته های مشاهده ای)</span></FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField control={form.control} name="eyeColor" render={({ field }) => (<FormItem><FormControl><Input placeholder='Eye Color' {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="skinColor" render={({ field }) => (<FormItem><FormControl><Input placeholder='Skin Color' {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="bruises" render={({ field }) => (<FormItem><FormControl><Input placeholder='Bruises' {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="rashUlcers" render={({ field }) => (<FormItem><FormControl><Input placeholder='Rash/Ulcers' {...field} /></FormControl></FormItem>)} />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <FormField control={form.control} name="pastMedicalHistory" render={({ field }) => (
                            <FormItem><FormLabel>Past Medical History <span className='text-muted-foreground text-xs'>(سابقه پزشکی گذشته)</span></FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="pastSurgicalHistory" render={({ field }) => (
                            <FormItem><FormLabel>Past Surgical History <span className='text-muted-foreground text-xs'>(سابقه جراحی گذشته)</span></FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="medication" render={({ field }) => (
                            <FormItem><FormLabel>Medication Past/Current <span className='text-muted-foreground text-xs'>(داروهای گذشته / فعلی)</span></FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="familyHistory" render={({ field }) => (
                            <FormItem><FormLabel>Family History <span className='text-muted-foreground text-xs'>(سابقه خانوادگی)</span></FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                        )} />
                    </div>
                </div>
            </Section>

            <Button type="submit" className="w-full" size="lg">Start AI Assistant</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
