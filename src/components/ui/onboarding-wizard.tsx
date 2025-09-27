'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'welcome' | 'goals' | 'skills' | 'preferences' | 'done';

export default function OnboardingWizard({ onClose }: { onClose?: () => void }) {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [goals, setGoals] = useState<string>('Find meaningful micro jobs');
  const [skills, setSkills] = useState<string>('');
  const [prefs, setPrefs] = useState<string>('Remote, flexible, creative');
  const [saving, setSaving] = useState(false);

  const next = () => setStep(prev => prev === 'welcome' ? 'goals' : prev === 'goals' ? 'skills' : prev === 'skills' ? 'preferences' : 'done');
  const back = () => setStep(prev => prev === 'goals' ? 'welcome' : prev === 'skills' ? 'goals' : prev === 'preferences' ? 'skills' : 'welcome');

  const save = async () => {
    setSaving(true);
    try {
      // Integrate with profile creation/update API
      await new Promise(r => setTimeout(r, 800));
      setStep('done');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={onClose} />
      <Card className="relative w-full max-w-lg animate-slide-up">
        <CardHeader>
          <CardTitle>{step === 'welcome' ? 'Tell us your story' : step === 'goals' ? 'Your goals' : step === 'skills' ? 'Your skills' : step === 'preferences' ? 'Your preferences' : 'You’re all set!'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'welcome' && (
            <div className="space-y-2">
              <p className="text-muted-foreground">We’ll guide you to the right path. This takes less than a minute.</p>
              <Button onClick={next}>{isAuthenticated ? 'Start' : 'Join & Start'}</Button>
            </div>
          )}
          {step === 'goals' && (
            <div className="space-y-2">
              <label className="text-sm">What are you hoping to achieve?</label>
              <input className="w-full border rounded px-3 py-2" value={goals} onChange={e => setGoals(e.target.value)} />
              <div className="flex justify-between">
                <Button variant="outline" className="bg-transparent" onClick={back}>Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </div>
          )}
          {step === 'skills' && (
            <div className="space-y-2">
              <label className="text-sm">What skills would you like to use?</label>
              <input className="w-full border rounded px-3 py-2" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. design, writing, video" />
              <div className="flex justify-between">
                <Button variant="outline" className="bg-transparent" onClick={back}>Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </div>
          )}
          {step === 'preferences' && (
            <div className="space-y-2">
              <label className="text-sm">Any preferences?</label>
              <input className="w-full border rounded px-3 py-2" value={prefs} onChange={e => setPrefs(e.target.value)} />
              <div className="flex justify-between">
                <Button variant="outline" className="bg-transparent" onClick={back}>Back</Button>
                <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Finish'}</Button>
              </div>
            </div>
          )}
          {step === 'done' && (
            <div className="space-y-2">
              <p className="text-muted-foreground">Thanks! We’ll personalize your experience from here.</p>
              <Button onClick={onClose}>Continue</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


