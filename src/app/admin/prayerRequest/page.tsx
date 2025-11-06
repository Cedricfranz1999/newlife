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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { Textarea } from "~/components/ui/textarea";
import {
  Search,
  Plus,
  Calendar as CalIcon,
  Edit,
  Trash2,
  Loader2,
  X,
  Filter,
  ChevronDown,
  Cross,
  Eye,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import type { DateRange } from "react-day-picker";
import type { PrayerRequestStatus, UserType } from "@prisma/client";

const PRAYER_REQUEST_CONFIG = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  DONE: { label: "Done", color: "bg-blue-100 text-blue-800" },
  ANSWERED: { label: "Answered", color: "bg-green-100 text-green-800" },
} as const;

const USER_TYPE_CONFIG = {
  MEMBER: { label: "Member", color: "bg-indigo-100 text-indigo-800" },
  GUEST: { label: "Guest", color: "bg-yellow-100 text-yellow-800" },
} as const;

type PrayerRequestStatusKey = keyof typeof PRAYER_REQUEST_CONFIG;
type UserTypeKey = keyof typeof USER_TYPE_CONFIG;

interface FormData {
  memberId?: string;
  title: string;
  description: string;
  note: string;
  dateToPray?: Date;
  status: PrayerRequestStatusKey;
}

export default function PrayerRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [userType, setUserType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "create" | "edit" | "delete" | "view-description" | null;
    data?: any;
  }>({ type: null });
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    note: "",
    status: "PENDING",
  });

  const queryParams = {
    page,
    limit: 10,
    status: status !== "all" ? (status as PrayerRequestStatus) : undefined,
    userType: userType !== "all" ? (userType as UserType) : undefined,
    startDate: dateRange?.from
      ? startOfDay(dateRange.from).toISOString()
      : undefined,
    endDate: dateRange?.to ? endOfDay(dateRange.to).toISOString() : undefined,
    search: searchQuery || undefined,
  };

  const { data, isLoading, error, refetch } =
    api.prayerRequest.list.useQuery(queryParams);
  const { data: membersData } = api.members.list.useQuery({
    page: 1,
    limit: 100,
  });

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

  const createMutation = api.prayerRequest.create.useMutation({
    onSuccess: () => onSuccess("Prayer request created successfully!"),
    onError,
  });
  const updateMutation = api.prayerRequest.update.useMutation({
    onSuccess: () => onSuccess("Prayer request updated successfully!"),
    onError,
  });
  const deleteMutation = api.prayerRequest.delete.useMutation({
    onSuccess: () => onSuccess("Prayer request deleted successfully!"),
    onError,
  });

  const closeModal = () => {
    setModalState({ type: null });
    setFormData({ title: "", description: "", note: "", status: "PENDING" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim())
      return showToast("Error", "Title is required", true);
    if (!formData.description.trim())
      return showToast("Error", "Description is required", true);

    const submitData = {
      ...formData,
      memberId: formData.memberId ? parseInt(formData.memberId) : undefined,
      dateToPray: formData.dateToPray
        ? formData.dateToPray.toISOString()
        : undefined,
    };

    if (modalState.type === "create") {
      createMutation.mutate(submitData);
    } else if (modalState.type === "edit" && modalState.data) {
      updateMutation.mutate({ id: modalState.data.id, ...submitData });
    }
  };

  const openModal = (
    type: "create" | "edit" | "delete" | "view-description",
    data?: any,
  ) => {
    setModalState({ type, data });
    if (type === "edit" && data) {
      setFormData({
        memberId: data.memberId?.toString() || "",
        title: data.title,
        description: data.description,
        note: data.note || "",
        dateToPray: data.dateToPray ? new Date(data.dateToPray) : undefined,
        status: data.status,
      });
    } else if (type === "create") {
      setFormData({ title: "", description: "", note: "", status: "PENDING" });
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
    setStatus("all");
    setUserType("all");
    setDateRange(undefined);
    setSearchQuery("");
    setPage(1);
  };

  const hasActiveFilters =
    status !== "all" ||
    userType !== "all" ||
    dateRange?.from ||
    dateRange?.to ||
    searchQuery;
  const activeFilterCount = [
    status !== "all",
    userType !== "all",
    dateRange?.from,
    searchQuery,
  ].filter(Boolean).length;
  const prayerRequestData = data?.prayerRequests ?? [];
  const totalPages = data?.totalPages ?? 0;

  if (error) {
    return (
      <div className="min-h-screen space-y-6 bg-white p-4 sm:p-6 lg:p-8">
        <Card className="border-red-200 bg-white shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <Cross className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <p className="text-lg font-semibold text-red-600">
                Error loading prayer requests
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Please try again or contact support if the issue persists.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderDateCell = (
    date: string | Date | null | undefined,
    placeholder = "Not specified",
  ) => {
    if (!date)
      return <span className="text-sm text-gray-400">{placeholder}</span>;
    return (
      <div className="flex items-center gap-2">
        <CalIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
        <span className="text-sm">{format(new Date(date), "PP")}</span>
      </div>
    );
  };

  const renderRequestorCell = (member: any) => {
    if (!member)
      return <span className="text-sm text-gray-400">No member</span>;
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className={cn(
            "text-xs",
            USER_TYPE_CONFIG[member.userType as UserTypeKey]?.color,
          )}
        >
          {USER_TYPE_CONFIG[member.userType as UserTypeKey]?.label}
        </Badge>
        <span className="truncate text-sm">
          {member.firstName} {member.lastName}
        </span>
      </div>
    );
  };

  const renderDescriptionCell = (description: string) => {
    const truncatedDescription =
      description.length > 100
        ? `${description.substring(0, 100)}...`
        : description;

    return (
      <div className="max-w-[300px]">
        <div className="line-clamp-2 text-sm break-words text-gray-600">
          {truncatedDescription}
        </div>
        {description.length > 100 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openModal("view-description", { description });
            }}
            className="mt-1 h-auto p-0 text-xs text-blue-600 hover:bg-transparent hover:text-blue-800"
          >
            <Eye className="mr-1 h-3 w-3" />
            View full description
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen space-y-4 bg-gray-50 p-3 sm:space-y-6 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
            Prayer Requests
          </h1>
          <p className="text-xs text-gray-600 sm:text-sm">
            Manage and track church prayer requests
          </p>
        </div>
        <Button
          onClick={() => openModal("create")}
          className="w-full bg-[#27885c] text-white shadow-sm transition-all hover:bg-[#1f6d4a] hover:shadow-md sm:w-auto"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="sm:inline">New Request</span>
        </Button>
      </div>

      {/* Stats Card */}
      {prayerRequestData.length > 0 && (
        <Card className="border-l-4 border-l-[#27885c] bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#27885c] p-2 shadow-sm sm:p-3">
                  <Cross className="h-4 w-4 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-600 sm:text-sm">
                    Total Prayer Requests
                  </h3>
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                    {data?.totalCount ?? 0}
                  </p>
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 sm:text-right sm:text-sm">
                <p>
                  Showing {prayerRequestData.length} request
                  {prayerRequestData.length !== 1 ? "s" : ""}
                </p>
                {hasActiveFilters && (
                  <p className="mt-1 text-xs">with current filters applied</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Card */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by title, description, or member name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white pl-10 text-sm transition-all focus:ring-2 focus:ring-[#27885c] sm:text-base"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative w-full shadow-sm transition-all hover:shadow sm:w-auto"
                size="sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full bg-[#27885c] p-0 text-xs text-white">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    "ml-1 h-4 w-4 transition-transform",
                    showFilters && "rotate-180",
                  )}
                />
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-gray-500 transition-colors hover:text-gray-700 sm:w-auto"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  Date Range
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left text-sm font-normal shadow-sm",
                        !dateRange && "text-gray-400",
                      )}
                    >
                      <CalIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <span className="truncate text-xs sm:text-sm">
                            {format(dateRange.from, "MMM dd")} -{" "}
                            {format(dateRange.to, "MMM dd")}
                          </span>
                        ) : (
                          format(dateRange.from, "MMM dd, y")
                        )
                      ) : (
                        "Pick a date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto bg-white p-0 shadow-lg"
                    align="start"
                  >
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 bg-white text-sm shadow-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {Object.entries(PRAYER_REQUEST_CONFIG).map(
                      ([key, { label }]) => (
                        <SelectItem key={key} value={key} className="text-sm">
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  Requestor
                </Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="h-9 bg-white text-sm shadow-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All requestors</SelectItem>
                    {Object.entries(USER_TYPE_CONFIG).map(
                      ([key, { label }]) => (
                        <SelectItem key={key} value={key} className="text-sm">
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Results Count */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs text-gray-600 sm:text-sm">
              <span className="font-semibold">{data?.totalCount ?? 0}</span>
              <span>results found</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#27885c]" />
                <p className="mt-2 text-sm text-gray-500">
                  Loading prayer requests...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold sm:text-sm">
                        Date Created
                      </TableHead>
                      <TableHead className="text-xs font-semibold sm:text-sm">
                        Requestor
                      </TableHead>
                      <TableHead className="text-xs font-semibold sm:text-sm">
                        Title
                      </TableHead>
                      <TableHead className="text-xs font-semibold sm:text-sm">
                        Description
                      </TableHead>
                      <TableHead className="text-xs font-semibold sm:text-sm">
                        Date to Pray
                      </TableHead>
                      <TableHead className="text-xs font-semibold sm:text-sm">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold sm:text-sm">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prayerRequestData.map((request) => (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer transition-colors hover:bg-green-50"
                        onClick={(e) => handleRowClick(request, e)}
                      >
                        <TableCell className="text-xs font-medium sm:text-sm">
                          {renderDateCell(request.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[150px] lg:max-w-[200px]">
                          {renderRequestorCell(request.member)}
                        </TableCell>
                        <TableCell className="max-w-[150px] lg:max-w-[200px]">
                          <div
                            className="truncate text-xs font-medium sm:text-sm"
                            title={request.title}
                          >
                            {request.title}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] lg:max-w-[250px]">
                          {renderDescriptionCell(request.description)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {renderDateCell(request.dateToPray)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              PRAYER_REQUEST_CONFIG[
                                request.status as PrayerRequestStatusKey
                              ]?.color,
                            )}
                          >
                            {
                              PRAYER_REQUEST_CONFIG[
                                request.status as PrayerRequestStatusKey
                              ]?.label
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal("edit", request)}
                              className="h-8 w-8 border-[#27885c] p-0 text-[#27885c] transition-all hover:bg-[#27885c] hover:text-white hover:shadow-sm sm:h-9 sm:w-9"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal("delete", request)}
                              className="h-8 w-8 border-red-500 p-0 text-red-500 transition-all hover:bg-red-500 hover:text-white hover:shadow-sm sm:h-9 sm:w-9"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="block space-y-3 px-3 sm:hidden">
                {prayerRequestData.map((request) => (
                  <Card
                    key={request.id}
                    className="cursor-pointer border-gray-200 shadow-sm transition-all hover:shadow-md"
                    onClick={(e) => handleRowClick(request, e)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <CalIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>
                                {format(new Date(request.createdAt), "PP")}
                              </span>
                            </div>
                            <div className="text-sm font-bold break-words text-gray-900">
                              {request.title}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "flex-shrink-0 text-xs",
                              PRAYER_REQUEST_CONFIG[
                                request.status as PrayerRequestStatusKey
                              ]?.color,
                            )}
                          >
                            {
                              PRAYER_REQUEST_CONFIG[
                                request.status as PrayerRequestStatusKey
                              ]?.label
                            }
                          </Badge>
                        </div>

                        <div className="space-y-2 border-t pt-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {renderRequestorCell(request.member)}
                          </div>

                          {request.dateToPray && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <CalIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>
                                Pray on:{" "}
                                {format(new Date(request.dateToPray), "PP")}
                              </span>
                            </div>
                          )}

                          <div className="text-xs break-words text-gray-600">
                            {renderDescriptionCell(request.description)}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("edit", request);
                            }}
                            className="h-8 flex-1 border-[#27885c] text-xs text-[#27885c] transition-all hover:bg-[#27885c] hover:text-white"
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("delete", request);
                            }}
                            className="h-8 flex-1 border-red-500 text-xs text-red-500 transition-all hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {prayerRequestData.length === 0 && (
                <div className="py-12 text-center sm:py-16">
                  <Cross className="mx-auto mb-4 h-12 w-12 text-gray-300 sm:h-16 sm:w-16" />
                  <p className="text-base font-semibold text-gray-700 sm:text-lg">
                    No prayer requests found
                  </p>
                  {hasActiveFilters ? (
                    <p className="mt-2 text-sm text-gray-500">
                      Try adjusting your filters or search terms
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      Create your first prayer request to get started
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
                    className={cn(
                      "text-xs sm:text-sm",
                      page <= 1 && "pointer-events-none opacity-50",
                    )}
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
                    <PaginationItem key={pageNum} className="hidden sm:block">
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        isActive={pageNum === page}
                        className={cn(
                          "text-xs sm:text-sm",
                          pageNum === page
                            ? "bg-[#27885c] text-white hover:bg-[#1f6d4a]"
                            : "",
                        )}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem className="sm:hidden">
                  <span className="px-4 text-xs text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={cn(
                      "text-xs sm:text-sm",
                      page >= totalPages && "pointer-events-none opacity-50",
                    )}
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
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto bg-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {modalState.type === "create" ? "Create" : "Edit"} Prayer Request
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {modalState.type === "create" ? "Add a new" : "Update the"} prayer
              request details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        status: v as PrayerRequestStatusKey,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 bg-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRAYER_REQUEST_CONFIG).map(
                        ([key, { label }]) => (
                          <SelectItem key={key} value={key} className="text-sm">
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateToPray" className="text-sm font-medium">
                    Date to Pray
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start text-left text-sm font-normal",
                          !formData.dateToPray && "text-gray-400",
                        )}
                      >
                        <CalIcon className="mr-2 h-4 w-4" />
                        {formData.dateToPray
                          ? format(formData.dateToPray, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto bg-white p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.dateToPray}
                        onSelect={(date) =>
                          setFormData({ ...formData, dateToPray: date })
                        }
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter prayer request title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="h-9 bg-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed prayer request description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="max-h-[200px] min-h-[120px] resize-y overflow-y-auto bg-white text-sm"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member" className="text-sm font-medium">
                  Requestor
                </Label>
                <Select
                  value={formData.memberId || "none"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      memberId: v !== "none" ? v : undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-9 bg-white text-sm">
                    <SelectValue placeholder="Select a member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-sm">
                      No member selected
                    </SelectItem>
                    {membersData?.members.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.id.toString()}
                        className="text-sm"
                      >
                        {member.firstName} {member.lastName} (
                        {
                          USER_TYPE_CONFIG[member.userType as UserTypeKey]
                            ?.label
                        }
                        )
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="note"
                  placeholder="Add any additional notes..."
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="max-h-[150px] min-h-[80px] resize-y overflow-y-auto bg-white text-sm"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="order-2 w-full sm:order-1 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="order-1 w-full bg-[#27885c] text-white hover:bg-[#1f6d4a] sm:order-2 sm:w-auto"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {modalState.type === "create" ? "Create" : "Update"} Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modalState.type === "delete"} onOpenChange={closeModal}>
        <DialogContent className="w-[95vw] bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Delete Prayer Request
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm sm:text-base">
              Are you sure you want to delete the prayer request{" "}
              <strong className="text-gray-900">
                "{modalState.data?.title}"
              </strong>
              {modalState.data?.member && (
                <>
                  {" "}
                  from{" "}
                  <strong className="text-gray-900">
                    {modalState.data.member.firstName}{" "}
                    {modalState.data.member.lastName}
                  </strong>
                </>
              )}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={closeModal}
              className="order-2 w-full sm:order-1 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                modalState.data &&
                deleteMutation.mutate({ id: modalState.data.id })
              }
              disabled={deleteMutation.isPending}
              className="order-1 w-full sm:order-2 sm:w-auto"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Description Modal */}
      <Dialog
        open={modalState.type === "view-description"}
        onOpenChange={closeModal}
      >
        <DialogContent className="max-h-[80vh] w-[95vw] bg-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Prayer Request Description
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm break-words whitespace-pre-wrap text-gray-700 sm:text-base">
                {modalState.data?.description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeModal} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
