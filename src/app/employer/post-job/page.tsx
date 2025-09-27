import { Metadata } from 'next';
import PostJobForm from '@/components/employer/PostJobForm';

export const metadata: Metadata = {
  title: "Post a MicroJob",
  description: "Create a detailed microjob posting to attract the right freelancers for your project.",
};

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <main className="container mx-auto section">
        <div className="stack max-w-3xl mx-auto">
          <header className="flex items-center justify-between">
            <h1 className="text-fluid-lg font-semibold text-foreground">Post a MicroJob</h1>
          </header>
          <div className="glass-card card-padding rounded-2xl">
            <PostJobForm />
          </div>
        </div>
      </main>
    </div>
  );
}
