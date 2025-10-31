import AvatarDebugComponent from '@/components/debug/AvatarDebugComponent';

export default function AvatarDebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Avatar Debug Page</h1>
          <p className="text-muted-foreground">
            Debug and test avatar functionality across the application.
          </p>
        </div>
        
        <AvatarDebugComponent />
      </div>
    </div>
  );
}







