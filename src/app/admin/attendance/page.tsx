"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfDay, endOfDay } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";
import {
  Search,
  Plus,
  Calendar as CalIcon,
  Users,
  Edit,
  Trash2,
  Loader2,
  X,
  Filter,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import type { DateRange } from "react-day-picker";

const ATTENDANCE_CONFIG = {
  SUNDAY_SERVICE: {
    label: "Sunday Service",
    color: "bg-emerald-100 text-emerald-800",
  },
  BIBLE_STUDY: { label: "Bible Study", color: "bg-green-100 text-green-800" },
  PRAYER_MEETING: {
    label: "Prayer Meeting",
    color: "bg-teal-100 text-teal-800",
  },
  YOUTH_SERVICE: { label: "Youth Service", color: "bg-lime-100 text-lime-800" },
  MIDWEEK_SERVICE: {
    label: "Midweek Service",
    color: "bg-cyan-100 text-cyan-800",
  },
  SPECIAL_EVENT: {
    label: "Special Event",
    color: "bg-amber-100 text-amber-800",
  },
} as const;

type AttendanceType = keyof typeof ATTENDANCE_CONFIG;

export default function AttendancePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<AttendanceType | "">("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "create" | "edit" | "delete" | null;
    data?: any;
  }>({ type: null });
  const [formData, setFormData] = useState<{
    date?: Date;
    type: AttendanceType;
  }>({ type: "SUNDAY_SERVICE" });

  // Build query parameters
  const queryParams = {
    page,
    limit: 10,
    type: type || undefined,
    startDate: dateRange?.from
      ? startOfDay(dateRange.from).toISOString()
      : undefined,
    endDate: dateRange?.to ? endOfDay(dateRange.to).toISOString() : undefined,
    search: searchQuery || undefined,
  };

  const { data, isLoading, error, refetch } =
    api.attendance.list.useQuery(queryParams);

  const showToast = (title: string, description: string, isError = false) => {
    toast({
      title,
      description,
      ...(isError
        ? { variant: "destructive" }
        : { className: "bg-green-50 border-green-200" }),
    });
  };

  const onSuccess = (message: string) => {
    showToast("Success", message);
    refetch();
    closeModal();
  };

  const onError = (err: any) => showToast("Error", err.message, true);

  const createMutation = api.attendance.create.useMutation({
    onSuccess: () => onSuccess("Attendance record created!"),
    onError,
  });
  const updateMutation = api.attendance.update.useMutation({
    onSuccess: () => onSuccess("Attendance record updated!"),
    onError,
  });
  const deleteMutation = api.attendance.delete.useMutation({
    onSuccess: () => onSuccess("Attendance record deleted!"),
    onError,
  });

  const closeModal = () => {
    setModalState({ type: null });
    setFormData({ type: "SUNDAY_SERVICE", date: undefined });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!formData.date) return showToast("Error", "Date is required", true);

    if (modalState.type === "create") {
      createMutation.mutate({
        date: formData.date.toISOString(),
        type: formData.type,
      });
    } else if (modalState.type === "edit" && modalState.data) {
      updateMutation.mutate({
        id: modalState.data.id,
        date: formData.date.toISOString(),
        type: formData.type,
      });
    }
  };

  const openModal = (type: "create" | "edit" | "delete", data?: any) => {
    setModalState({ type, data });
    if (type === "edit" && data) {
      setFormData({ date: new Date(data.date), type: data.type });
    }
  };

  const handleRowClick = (record: any, e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }
    router.push(`${window.location.pathname}/${record.id}`);
  };

  const clearFilters = () => {
    setType("");
    setDateRange(undefined);
    setSearchQuery("");
    setPage(1);
    setShowFilters(false);
  };

  const hasActiveFilters =
    type || dateRange?.from || dateRange?.to || searchQuery;

  if (error) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error loading attendance records
          </div>
        </CardContent>
      </Card>
    );
  }

  const attendanceData = data?.attendance ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="min-h-screen space-y-6 bg-white p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Attendance
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Manage and track church attendance records
          </p>
        </div>
        <div className="flex gap-2">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 sm:hidden"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            onClick={() => openModal("create")}
            className="bg-[#27885c] text-white hover:bg-[#1f6d4a]"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Record</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search attendance records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-4 pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <div className="flex flex-col gap-4">
            {/* Desktop Filters */}
            <div className="hidden flex-col gap-4 sm:flex">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Date Range Picker */}
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal lg:w-[300px]",
                            !dateRange && "text-gray-400",
                          )}
                        >
                          <CalIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            "Pick a date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto bg-white p-0"
                        align="start"
                      >
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Service Type Filter */}
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as AttendanceType | "")}
                  >
                    <SelectTrigger className="w-full bg-white lg:w-[200px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ATTENDANCE_CONFIG).map(
                        ([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters Indicator */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {data?.totalCount ?? 0} results
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Filters - Collapsible */}
            {showFilters && (
              <div className="flex flex-col gap-4 sm:hidden">
                {/* Date Range Picker for Mobile */}
                <div className="space-y-2">
                  <Label className="text-sm">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-gray-400",
                        )}
                      >
                        <CalIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM dd")} -{" "}
                              {format(dateRange.to, "MMM dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM dd, y")
                          )
                        ) : (
                          "Pick date range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto bg-white p-0"
                      align="start"
                    >
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Service Type Filter for Mobile */}
                <div className="space-y-2">
                  <Label className="text-sm">Service Type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as AttendanceType | "")}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ATTENDANCE_CONFIG).map(
                        ([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Filter Actions */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {data?.totalCount ?? 0} results
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        {/* Table Section */}
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#27885c]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Created
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((record) => (
                      <TableRow
                        key={record.id}
                        className="cursor-pointer transition-colors hover:bg-green-200"
                        onClick={(e) => handleRowClick(record, e)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CalIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
                            <span className="whitespace-nowrap">
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "whitespace-nowrap",
                              ATTENDANCE_CONFIG[record.type as AttendanceType]
                                .color,
                            )}
                          >
                            <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {
                                ATTENDANCE_CONFIG[record.type as AttendanceType]
                                  .label
                              }
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-gray-500">
                          {record.createdAt &&
                            format(new Date(record.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal("edit", record)}
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only sm:not-sr-only sm:ml-2">
                                Edit
                              </span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal("delete", record)}
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only sm:not-sr-only sm:ml-2">
                                Delete
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {attendanceData.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No attendance records found</p>
                  {hasActiveFilters && (
                    <p className="mt-2 text-sm">
                      Try adjusting your filters or search terms
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={
                      page <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        isActive={pageNum === page}
                        className={
                          pageNum === page
                            ? "bg-[#27885c] text-white"
                            : "hidden sm:flex"
                        }
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={
                      page >= totalPages ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog
        open={modalState.type === "create" || modalState.type === "edit"}
        onOpenChange={closeModal}
      >
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalState.type === "create" ? "Create" : "Edit"} Attendance
              Record
            </DialogTitle>
            <DialogDescription>
              {modalState.type === "create" ? "Add a new" : "Update the"}{" "}
              attendance record details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-gray-400",
                    )}
                  >
                    <CalIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(formData.date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto bg-white p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Service Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v as AttendanceType })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ATTENDANCE_CONFIG).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-[#27885c] text-white hover:bg-[#1f6d4a]"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modalState.type === "create" ? "Create" : "Update"} Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={modalState.type === "delete"} onOpenChange={closeModal}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Attendance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the attendance record for{" "}
              <strong>
                {modalState.data &&
                  format(new Date(modalState.data.date), "PPP")}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                modalState.data &&
                deleteMutation.mutate({ id: modalState.data.id })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
