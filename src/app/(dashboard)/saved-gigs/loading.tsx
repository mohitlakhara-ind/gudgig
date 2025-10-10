import CustomLoader from "@/components/CustomLoader"

export default function SavedJobsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <CustomLoader size={80} color="#1FA9FF" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Loading Saved Gigs...
          </h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your saved gigs
          </p>
        </div>
      </div>
    </div>
  )
}
      
