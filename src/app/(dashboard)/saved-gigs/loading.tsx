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
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded w-[140px]"></div>
              <div className="h-10 bg-muted rounded w-[140px]"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs list skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-28"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <div className="h-9 bg-muted rounded w-24"></div>
                  <div className="h-9 bg-muted rounded w-24"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
