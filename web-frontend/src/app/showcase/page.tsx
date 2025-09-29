"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusStatusCard } from "@/components/ui/bus-status-card"
import { RouteTimeline } from "@/components/ui/route-timeline"
import { StudentCard } from "@/components/ui/student-card"
import { BusManagementTable } from "@/components/ui/bus-management-table"
import { 
  Bus, 
  Users, 
  Route, 
  MapPin,
  TrendingUp,
  School,
  Clock
} from "lucide-react"

// Sample data for demonstrations
const sampleBuses = [
  {
    id: "bus-001",
    busNumber: "101", 
    driverName: "John Smith",
    driverPhone: "(555) 123-4567",
    route: "Route A - North",
    status: "active" as const,
    studentCount: 28,
    capacity: 40,
    lastLocation: "Lincoln Elementary School",
    lastUpdate: "2 min ago"
  },
  {
    id: "bus-002",
    busNumber: "102", 
    driverName: "Sarah Johnson",
    driverPhone: "(555) 234-5678", 
    route: "Route B - South",
    status: "idle" as const,
    studentCount: 0,
    capacity: 35,
    lastLocation: "Bus Depot",
    lastUpdate: "15 min ago"
  },
  {
    id: "bus-003",
    busNumber: "103",
    driverName: "Mike Davis", 
    driverPhone: "(555) 345-6789",
    route: "Route C - East",
    status: "maintenance" as const,
    studentCount: 0,
    capacity: 45,
    lastLocation: "Maintenance Facility",
    lastUpdate: "2 hours ago"
  }
]

const sampleRoute = {
  routeId: "A-001",
  routeName: "Lincoln Elementary - North Route",
  stops: [
    {
      id: "stop-1",
      name: "Maple Street & Oak Avenue",
      address: "1234 Maple Street",
      scheduledTime: "7:45 AM",
      actualTime: "7:43 AM",
      status: "completed" as const,
      studentCount: 8
    },
    {
      id: "stop-2", 
      name: "Pine Ridge Community Center",
      address: "567 Pine Ridge Blvd",
      scheduledTime: "8:00 AM",
      actualTime: "8:02 AM", 
      status: "current" as const,
      studentCount: 12
    },
    {
      id: "stop-3",
      name: "Riverside Park Entrance", 
      address: "890 River Road",
      scheduledTime: "8:15 AM",
      status: "upcoming" as const,
      studentCount: 6
    },
    {
      id: "stop-4",
      name: "Lincoln Elementary School",
      address: "100 School Lane", 
      scheduledTime: "8:30 AM",
      status: "upcoming" as const
    }
  ]
}

const sampleStudent = {
  id: "STU-001",
  name: "Emma Thompson",
  grade: "3rd",
  parentName: "Jennifer Thompson", 
  parentPhone: "(555) 987-6543",
  parentEmail: "jennifer.thompson@email.com",
  homeAddress: "456 Elm Street, Springfield, IL 62701",
  pickupStop: "Maple Street & Oak Avenue",
  dropoffStop: "Lincoln Elementary School",
  busNumber: "101", 
  status: "on-bus" as const,
  pickupTime: "7:45 AM",
  dropoffTime: "8:30 AM"
}

export default function ComponentsShowcasePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            shadcn/ui Components Showcase
          </CardTitle>
          <CardDescription className="text-lg">
            Modern, accessible components for school bus tracking system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Ready for Production</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="outline">Accessible</Badge>
            <Badge variant="outline">Responsive</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Component Tabs */}
      <Tabs defaultValue="buses" className="space-y-6">
        <TabsList className="h-12">
          <TabsTrigger value="buses" className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            Bus Components
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Route Components
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Components
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Data Tables
          </TabsTrigger>
        </TabsList>

        {/* Bus Components Tab */}
        <TabsContent value="buses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Bus Status Cards
              </CardTitle>
              <CardDescription>
                Real-time bus monitoring with status indicators, occupancy tracking, and driver information
              </CardDescription>  
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BusStatusCard
                  busNumber="101"
                  driverName="John Smith"
                  currentLocation="Lincoln Elementary School"
                  status="active"
                  studentCount={28}
                  maxCapacity={40}
                  nextStop="Maple Street & Oak Ave"
                  estimatedArrival="3:45 PM"
                />
                
                <BusStatusCard
                  busNumber="102"
                  driverName="Sarah Johnson" 
                  currentLocation="Bus Depot"
                  status="idle"
                  studentCount={0}
                  maxCapacity={35}
                />
                
                <BusStatusCard
                  busNumber="103"
                  driverName="Mike Davis"
                  currentLocation="Pine Ridge Community"
                  status="emergency"
                  studentCount={22}
                  maxCapacity={45}
                  nextStop="Emergency Stop"
                  estimatedArrival="NOW"
                />
                
                <BusStatusCard
                  busNumber="104"
                  driverName="Lisa Anderson"
                  currentLocation="Maintenance Facility" 
                  status="maintenance"
                  studentCount={0}
                  maxCapacity={40}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route Components Tab */}
        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Route Timeline
              </CardTitle>
              <CardDescription>
                Interactive timeline showing route progress, stops, and real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RouteTimeline
                routeId={sampleRoute.routeId}
                routeName={sampleRoute.routeName}
                stops={sampleRoute.stops}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Components Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Information Cards
              </CardTitle>
              <CardDescription>
                Comprehensive student profiles with parent contact information and transportation details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StudentCard {...sampleStudent} />
                
                <StudentCard
                  id="STU-002"
                  name="Alex Rodriguez"
                  grade="5th"
                  parentName="Maria Rodriguez"
                  parentPhone="(555) 456-7890"
                  parentEmail="maria.rodriguez@email.com"
                  homeAddress="789 Oak Street, Springfield, IL 62701"
                  pickupStop="Pine Ridge Community Center"
                  dropoffStop="Roosevelt Middle School"
                  busNumber="102"
                  status="at-stop"
                  pickupTime="8:00 AM"
                  dropoffTime="8:25 AM"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tables Tab */}
        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Bus Management Table
              </CardTitle>
              <CardDescription>
                Advanced data table with search, filtering, and bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <BusManagementTable data={sampleBuses} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold">Real-time Tracking</h3>
              <p className="text-sm text-muted-foreground">Live GPS tracking with accurate ETA predictions</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold">Student Safety</h3>
              <p className="text-sm text-muted-foreground">Comprehensive student profiles and emergency contacts</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold">Fleet Management</h3>
              <p className="text-sm text-muted-foreground">Complete bus fleet monitoring and maintenance tracking</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold">Schedule Optimization</h3>
              <p className="text-sm text-muted-foreground">Smart routing and schedule management system</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Get Started?</CardTitle>
          <CardDescription>
            Your school bus tracking system is now equipped with modern, accessible UI components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Bus className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              View Live Map
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />  
              Manage Students
            </Button>
            <Button variant="outline">
              <Route className="h-4 w-4 mr-2" />
              Configure Routes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}