"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, Users, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface BusStatusCardProps {
  busNumber: string
  driverName: string
  currentLocation: string
  status: "active" | "idle" | "maintenance" | "emergency"
  studentCount: number
  maxCapacity: number
  nextStop?: string
  estimatedArrival?: string
  className?: string
}

const statusConfig = {
  active: {
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    label: "Active"
  },
  idle: {
    color: "bg-yellow-500", 
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    label: "Idle"
  },
  maintenance: {
    color: "bg-blue-500",
    textColor: "text-blue-700", 
    bgColor: "bg-blue-50",
    label: "Maintenance"
  },
  emergency: {
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50", 
    label: "Emergency"
  }
}

export function BusStatusCard({
  busNumber,
  driverName,
  currentLocation,
  status,
  studentCount,
  maxCapacity,
  nextStop,
  estimatedArrival,
  className
}: BusStatusCardProps) {
  const config = statusConfig[status]
  const occupancyPercentage = (studentCount / maxCapacity) * 100

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {busNumber}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Bus {busNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">{driverName}</p>
            </div>
          </div>
          <Badge variant={status === "active" ? "default" : "secondary"} className={cn(config.bgColor, config.textColor)}>
            <div className={cn("w-2 h-2 rounded-full mr-2", config.color)} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Current Location:</span>
          <span className="font-medium">{currentLocation}</span>
        </div>

        {nextStop && estimatedArrival && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Next Stop:</span>
            <span className="font-medium">{nextStop}</span>
            <Badge variant="outline" className="ml-auto">
              ETA: {estimatedArrival}
            </Badge>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Occupancy</span>
            </div>
            <span className="font-medium">
              {studentCount}/{maxCapacity} students
            </span>
          </div>
          <Progress value={occupancyPercentage} className="h-2" />
        </div>

        {status === "emergency" && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700 font-medium">Emergency Alert Active</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}