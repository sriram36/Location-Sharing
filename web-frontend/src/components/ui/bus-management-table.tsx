"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MoreHorizontal, 
  Search, 
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface BusData {
  id: string
  busNumber: string
  driverName: string
  driverPhone: string
  route: string
  status: "active" | "idle" | "maintenance" | "emergency"
  studentCount: number
  capacity: number
  lastLocation: string
  lastUpdate: string
}

interface BusManagementTableProps {
  data: BusData[]
  className?: string
}

const statusConfig = {
  active: { label: "Active", variant: "default" as const, color: "text-green-700" },
  idle: { label: "Idle", variant: "secondary" as const, color: "text-yellow-700" },
  maintenance: { label: "Maintenance", variant: "secondary" as const, color: "text-blue-700" },
  emergency: { label: "Emergency", variant: "destructive" as const, color: "text-red-700" }
}

export function BusManagementTable({ data, className }: BusManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredData = data.filter(bus => {
    const matchesSearch = 
      bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || bus.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bus Fleet Management</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Bus
          </Button>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search buses, drivers, routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("idle")}>
                Idle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("maintenance")}>
                Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("emergency")}>
                Emergency
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Last Location</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No buses found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((bus) => {
                  const config = statusConfig[bus.status]
                  const occupancyPercentage = (bus.studentCount / bus.capacity) * 100
                  
                  return (
                    <TableRow key={bus.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">Bus {bus.busNumber}</div>
                          <div className="text-sm text-muted-foreground">ID: {bus.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bus.driverName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {bus.driverPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{bus.route}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className={config.color}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3" />
                            <span>{bus.studentCount}/{bus.capacity}</span>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={cn("h-1.5 rounded-full", 
                                occupancyPercentage > 90 ? "bg-red-500" :
                                occupancyPercentage > 70 ? "bg-yellow-500" : "bg-green-500"
                              )}
                              style={{ width: `${occupancyPercentage}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{bus.lastLocation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {bus.lastUpdate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MapPin className="h-4 w-4 mr-2" />
                              Track Live
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Bus
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Bus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {filteredData.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {data.length} buses
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}