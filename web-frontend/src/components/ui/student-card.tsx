"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  GraduationCap,
  Home,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentCardProps {
  id: string
  name: string
  grade: string
  parentName: string
  parentPhone: string
  parentEmail: string
  homeAddress: string
  pickupStop: string
  dropoffStop: string
  busNumber: string
  status: "on-bus" | "at-stop" | "at-home" | "absent" | "emergency"
  pickupTime?: string
  dropoffTime?: string
  photo?: string
  className?: string
}

const statusConfig = {
  "on-bus": {
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "On Bus",
    icon: CheckCircle2
  },
  "at-stop": {
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-200",
    label: "At Stop",
    icon: MapPin
  },
  "at-home": {
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200", 
    label: "At Home",
    icon: Home
  },
  "absent": {
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Absent",
    icon: AlertCircle
  },
  "emergency": {
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Emergency",
    icon: AlertCircle
  }
}

export function StudentCard({
  id,
  name,
  grade,
  parentName,
  parentPhone,
  parentEmail,
  homeAddress,
  pickupStop,
  dropoffStop,
  busNumber,
  status,
  pickupTime,
  dropoffTime,
  photo,
  className
}: StudentCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={photo} alt={name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                Grade {grade} • Student ID: {id}
              </p>
            </div>
          </div>
          <Badge 
            variant={status === "on-bus" ? "default" : "secondary"}
            className={cn("", config.bgColor, config.textColor)}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Parent Information */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Parent/Guardian</h4>
          <div className="space-y-1">
            <p className="text-sm">{parentName}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{parentPhone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{parentEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Transportation Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Transportation</h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Bus Number</p>
              <Badge variant="outline">{busNumber}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-muted-foreground">Pickup Stop</p>
                <p className="font-medium">{pickupStop}</p>
                {pickupTime && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">{pickupTime}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-muted-foreground">Drop-off Stop</p>
                <p className="font-medium">{dropoffStop}</p>
                {dropoffTime && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">{dropoffTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Home Address */}
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Home Address</p>
          <p className="font-medium">{homeAddress}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            Call Parent
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MapPin className="h-4 w-4 mr-2" />
            Track Location
          </Button>
        </div>

        {status === "emergency" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">Emergency Alert Active</span>
            </div>
            <p className="text-xs text-red-600 mt-1">Parent has been notified</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}