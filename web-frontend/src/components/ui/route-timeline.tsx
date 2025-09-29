"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Route, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

interface RouteTimelineProps {
  routeId: string
  routeName: string
  stops: Array<{
    id: string
    name: string
    address: string
    scheduledTime: string
    actualTime?: string
    status: "completed" | "current" | "upcoming" | "delayed"
    studentCount?: number
  }>
  className?: string
}

const stopStatusConfig = {
  completed: {
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  current: {
    color: "bg-blue-500",
    textColor: "text-blue-700", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  upcoming: {
    color: "bg-gray-300",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50", 
    borderColor: "border-gray-200"
  },
  delayed: {
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
}

export function RouteTimeline({ routeId, routeName, stops, className }: RouteTimelineProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Route {routeId}</CardTitle>
              <p className="text-sm text-muted-foreground">{routeName}</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            <Navigation className="h-4 w-4 mr-2" />
            Track Live
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {stops.map((stop, index) => {
            const config = stopStatusConfig[stop.status]
            const isLast = index === stops.length - 1

            return (
              <div key={stop.id} className="relative">
                <div className="flex items-start gap-4">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className={cn("w-4 h-4 rounded-full border-2 border-white shadow-sm", config.color)} />
                    {!isLast && (
                      <div className="w-0.5 h-12 bg-border mt-2" />
                    )}
                  </div>

                  {/* Stop content */}
                  <div className="flex-1 min-w-0">
                    <div className={cn("p-3 rounded-lg border", config.bgColor, config.borderColor)}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stop.name}</h4>
                        <div className="flex items-center gap-2">
                          {stop.studentCount && (
                            <Badge variant="secondary" className="text-xs">
                              {stop.studentCount} students
                            </Badge>
                          )}
                          <Badge 
                            variant={stop.status === "current" ? "default" : "secondary"}
                            className={cn("text-xs", config.textColor)}
                          >
                            {stop.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{stop.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-muted-foreground">Scheduled:</span>
                            <span className="font-medium">{stop.scheduledTime}</span>
                          </div>
                          {stop.actualTime && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Actual:</span>
                              <span className={cn("font-medium", 
                                stop.status === "delayed" ? "text-red-600" : "text-green-600"
                              )}>
                                {stop.actualTime}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}