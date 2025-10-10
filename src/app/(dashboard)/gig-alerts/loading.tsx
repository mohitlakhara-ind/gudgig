import CustomLoader from "@/components/CustomLoader"

export default function JobAlertsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <CustomLoader size={80} color="#1FA9FF" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Loading Job Alerts...
          </h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your job alerts
          </p>
        </div>
      </div>
    </div>
  )
}
                    <div className="h-6 bg-muted rounded w-48"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-28"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-3 bg-muted rounded w-64"></div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 bg-muted rounded w-12"></div>
                    <div className="h-4 bg-muted rounded w-12"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded w-8"></div>
                    <div className="h-8 bg-muted rounded w-8"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
