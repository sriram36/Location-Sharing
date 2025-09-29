// Re-export all shadcn/ui components for easy importing
export { Button, buttonVariants } from "@/components/ui/button"
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
export { Input } from "@/components/ui/input"
export { Label } from "@/components/ui/label"
export { Badge, badgeVariants } from "@/components/ui/badge"
export { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
export { Progress } from "@/components/ui/progress"
export { Separator } from "@/components/ui/separator"
export { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
export { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from "@/components/ui/table"
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/components/ui/select"
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu"

// Custom components for school bus tracking
export { BusStatusCard } from "@/components/ui/bus-status-card"
export { RouteTimeline } from "@/components/ui/route-timeline"
export { StudentCard } from "@/components/ui/student-card"
export { BusManagementTable } from "@/components/ui/bus-management-table"

// Legacy components (still available for backward compatibility)
export { StatsCard } from "@/components/ui/stats-card"
export { ActionCard } from "@/components/ui/action-card"
export { StatusIndicator } from "@/components/ui/status-indicator"
export { LoadingScreen, LoadingSpinner } from "@/components/ui/loading"