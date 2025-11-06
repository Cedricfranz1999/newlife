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
  DollarSign,
  Edit,
  Trash2,
  Loader2,
  X,
  User,
  Users,
  EyeOff,
  PhilippinePeso,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import type { DateRange } from "react-day-picker";
import type { OfferingType, UserType } from "@prisma/client";

const OFFERING_CONFIG = {
  TITHE: { label: "Tithe", color: "bg-blue-100 text-blue-800" },
  OFFERING: { label: "Offering", color: "bg-green-100 text-green-800" },
  BUILDING_FUND: {
    label: "Building Fund",
    color: "bg-purple-100 text-purple-800",
  },
  MISSIONS: { label: "Missions", color: "bg-orange-100 text-orange-800" },
  SPECIAL_OFFERING: {
    label: "Special Offering",
    color: "bg-red-100 text-red-800",
  },
  THANKSGIVING: { label: "Thanksgiving", color: "bg-teal-100 text-teal-800" },
  OTHER: { label: "Other", color: "bg-gray-100 text-gray-800" },
} as const;

const USER_TYPE_CONFIG = {
  MEMBER: { label: "Member", color: "bg-indigo-100 text-indigo-800" },
  GUEST: { label: "Guest", color: "bg-yellow-100 text-yellow-800" },
} as const;

type OfferingTypeKey = keyof typeof OFFERING_CONFIG;
type UserTypeKey = keyof typeof USER_TYPE_CONFIG;

interface FormData {
  memberId?: string;
  date?: Date;
  type: OfferingTypeKey;
  amount: string;
  note: string;
  receiptNumber: string;
  isAnonymous: boolean;
}

export default function OfferingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("all");
  const [userType, setUserType] = useState<string>("all");
  const [isAnonymous, setIsAnonymous] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "create" | "edit" | "delete" | null;
    data?: any;
  }>({ type: null });
  const [formData, setFormData] = useState<FormData>({
    type: "TITHE",
    amount: "",
    note: "",
    receiptNumber: "",
    isAnonymous: false,
    date: new Date(),
  });

  const queryParams = {
    page,
    limit: 10,
    type: type !== "all" ? (type as OfferingType) : undefined,
    userType: userType !== "all" ? (userType as UserType) : undefined,
    isAnonymous: isAnonymous !== "all" ? isAnonymous === "true" : undefined,
    startDate: dateRange?.from
      ? startOfDay(dateRange.from).toISOString()
      : undefined,
    endDate: dateRange?.to ? endOfDay(dateRange.to).toISOString() : undefined,
    search: searchQuery || undefined,
  };

  const { data, isLoading, error, refetch } =
    api.offering.list.useQuery(queryParams);
  const { data: membersData } = api.members.list.useQuery({
    page: 1,
    limit: 10,
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

  const createMutation = api.offering.create.useMutation({
    onSuccess: () => onSuccess("Record created successfully!"),
    onError,
  });
  const updateMutation = api.offering.update.useMutation({
    onSuccess: () => onSuccess("Record updated successfully!"),
    onError,
  });
  const deleteMutation = api.offering.delete.useMutation({
    onSuccess: () => onSuccess("Record deleted successfully!"),
    onError,
  });

  const closeModal = () => {
    setModalState({ type: null });
    setFormData({
      type: "TITHE",
      amount: "",
      note: "",
      receiptNumber: "",
      isAnonymous: false,
      date: new Date(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) return showToast("Error", "Date is required", true);
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return showToast("Error", "Valid amount is required", true);
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: formData.date.toISOString(),
      memberId: formData.memberId ? parseInt(formData.memberId) : undefined,
    };

    if (modalState.type === "create") {
      createMutation.mutate(submitData);
    } else if (modalState.type === "edit" && modalState.data) {
      updateMutation.mutate({ id: modalState.data.id, ...submitData });
    }
  };

  const openModal = (type: "create" | "edit" | "delete", data?: any) => {
    setModalState({ type, data });
    if (type === "edit" && data) {
      setFormData({
        memberId: data.memberId?.toString() || "",
        date: new Date(data.date),
        type: data.type,
        amount: data.amount.toString(),
        note: data.note || "",
        receiptNumber: data.receiptNumber || "",
        isAnonymous: data.isAnonymous,
      });
    } else if (type === "create") {
      // Set current date when creating new record
      setFormData({
        type: "TITHE",
        amount: "",
        note: "",
        receiptNumber: "",
        isAnonymous: false,
        date: new Date(), // Current date for new records
      });
    }
  };

  const clearFilters = () => {
    setType("all");
    setUserType("all");
    setIsAnonymous("all");
    setDateRange(undefined);
    setSearchQuery("");
    setPage(1);
  };

  const hasActiveFilters =
    type !== "all" ||
    userType !== "all" ||
    isAnonymous !== "all" ||
    dateRange?.from ||
    dateRange?.to ||
    searchQuery;

  const activeFilterCount = [
    type !== "all",
    userType !== "all",
    isAnonymous !== "all",
    dateRange?.from,
    searchQuery,
  ].filter(Boolean).length;

  // Calculate total amount
  const totalAmount =
    data?.tithesOfferings?.reduce((sum, record) => {
      return sum + (record.amount || 0);
    }, 0) || 0;

  if (error) {
    return (
      <div className="min-h-screen space-y-6 bg-white p-4 sm:p-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading records. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const offeringData = data?.tithesOfferings ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="min-h-screen space-y-4 bg-white p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Tithes & Offerings
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Manage and track church tithes and offerings
          </p>
        </div>
        <Button
          onClick={() => openModal("create")}
          className="bg-[#27885c] text-white hover:bg-[#1f6d4a]"
          size="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>

      {/* Total Amount Summary Card */}
      {offeringData.length > 0 && (
        <Card className="border-l-4 border-l-[#27885c] bg-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Amount
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    ₱
                    {totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 sm:text-right">
                <p>
                  Based on {offeringData.length} record
                  {offeringData.length !== 1 ? "s" : ""}
                </p>
                {hasActiveFilters && (
                  <p className="mt-1">with current filters applied</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 bg-white">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search by name, receipt, or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full bg-[#27885c] p-0 text-xs">
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Date Range
                </Label>
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
                          <span className="truncate">
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
                  <PopoverContent className="w-auto bg-white p-0" align="start">
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

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(OFFERING_CONFIG).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Contributor
                </Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All contributors</SelectItem>
                    {Object.entries(USER_TYPE_CONFIG).map(
                      ([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Visibility
                </Label>
                <Select value={isAnonymous} onValueChange={setIsAnonymous}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All records</SelectItem>
                    <SelectItem value="false">Named</SelectItem>
                    <SelectItem value="true">Anonymous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{data?.totalCount ?? 0}</span>
                <span>results found</span>
              </div>
              {offeringData.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-[#27885c]">
                  <span>Total:</span>
                  <span>
                    ₱
                    {totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#27885c]" />
            </div>
          ) : (
            <>
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Contributor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offeringData.map((record) => (
                      <TableRow
                        key={record.id}
                        className="cursor-pointer transition-colors hover:bg-green-50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CalIcon className="h-4 w-4 text-gray-400" />
                            <span className="whitespace-nowrap">
                              {format(new Date(record.date), "PP")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.isAnonymous ? (
                              <div className="flex items-center gap-1 text-gray-500">
                                <EyeOff className="h-4 w-4" />
                                <span>Anonymous</span>
                              </div>
                            ) : record.member ? (
                              <>
                                <Badge
                                  variant="secondary"
                                  className={
                                    USER_TYPE_CONFIG[
                                      record.member.userType as UserTypeKey
                                    ]?.color
                                  }
                                >
                                  {
                                    USER_TYPE_CONFIG[
                                      record.member.userType as UserTypeKey
                                    ]?.label
                                  }
                                </Badge>
                                <span className="truncate">
                                  {record.member.firstName}{" "}
                                  {record.member.lastName}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">No member</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              OFFERING_CONFIG[record.type as OfferingTypeKey]
                                ?.color
                            }
                          >
                            {
                              OFFERING_CONFIG[record.type as OfferingTypeKey]
                                ?.label
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₱{record.amount.toLocaleString()}
                        </TableCell>

                        <TableCell className="max-w-[200px] truncate text-gray-600">
                          {record.note || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal("edit", record)}
                              className="border-[#27885c] text-[#27885c] hover:bg-[#27885c] hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal("delete", record)}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="block space-y-3 px-4 sm:hidden">
                {offeringData.map((record) => (
                  <Card
                    key={record.id}
                    className="cursor-pointer border-gray-200 transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <CalIcon className="h-4 w-4" />
                              {format(new Date(record.date), "PP")}
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              ₱{record.amount.toLocaleString()}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              OFFERING_CONFIG[record.type as OfferingTypeKey]
                                ?.color
                            }
                          >
                            {
                              OFFERING_CONFIG[record.type as OfferingTypeKey]
                                ?.label
                            }
                          </Badge>
                        </div>

                        <div className="space-y-2 border-t pt-3">
                          <div className="flex items-center gap-2">
                            {record.isAnonymous ? (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <EyeOff className="h-4 w-4" />
                                <span>Anonymous</span>
                              </div>
                            ) : record.member ? (
                              <>
                                <Badge
                                  variant="secondary"
                                  className={
                                    USER_TYPE_CONFIG[
                                      record.member.userType as UserTypeKey
                                    ]?.color
                                  }
                                >
                                  {
                                    USER_TYPE_CONFIG[
                                      record.member.userType as UserTypeKey
                                    ]?.label
                                  }
                                </Badge>
                                <span className="text-sm">
                                  {record.member.firstName}{" "}
                                  {record.member.lastName}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No member
                              </span>
                            )}
                          </div>

                          {record.note && (
                            <div className="line-clamp-2 text-sm text-gray-600">
                              {record.note}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("edit", record);
                            }}
                            className="flex-1 border-[#27885c] text-[#27885c] hover:bg-[#27885c] hover:text-white"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("delete", record);
                            }}
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {offeringData.length === 0 && (
                <div className="py-12 text-center">
                  <PhilippinePeso className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">
                    No records found
                  </p>
                  {hasActiveFilters && (
                    <p className="mt-2 text-sm text-gray-500">
                      Try adjusting your filters or search terms
                    </p>
                  )}
                </div>
              )}
            </>
          )}

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
                    <PaginationItem key={pageNum} className="hidden sm:block">
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        isActive={pageNum === page}
                        className={
                          pageNum === page ? "bg-[#27885c] text-white" : ""
                        }
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem className="sm:hidden">
                  <span className="px-4 text-sm text-gray-600">
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

      <Dialog
        open={modalState.type === "create" || modalState.type === "edit"}
        onOpenChange={closeModal}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {modalState.type === "create" ? "Create" : "Edit"} Record
            </DialogTitle>
            <DialogDescription>
              {modalState.type === "create" ? "Add a new" : "Update the"} tithes
              and offerings record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, type: v as OfferingTypeKey })
                    }
                  >
                    <SelectTrigger className="min-w-full bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OFFERING_CONFIG).map(
                        ([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member">Contributor</Label>
                <Select
                  value={formData.memberId || "none"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      memberId: v !== "none" ? v : undefined,
                    })
                  }
                >
                  <SelectTrigger className="min-w-full bg-white">
                    <SelectValue placeholder="Select a member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No member selected</SelectItem>
                    {membersData?.members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
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
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add any additional notes..."
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="bg-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, isAnonymous: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#27885c] focus:ring-[#27885c]"
                />
                <Label
                  htmlFor="isAnonymous"
                  className="cursor-pointer text-sm font-normal"
                >
                  Mark as anonymous donation
                </Label>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-[#27885c] text-white hover:bg-[#1f6d4a] sm:w-auto"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {modalState.type === "create" ? "Create" : "Update"} Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalState.type === "delete"} onOpenChange={closeModal}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record from{" "}
              <strong>
                {modalState.data &&
                  format(new Date(modalState.data.date), "PPP")}
              </strong>
              {modalState.data?.member && !modalState.data.isAnonymous ? (
                <>
                  {" "}
                  for{" "}
                  <strong>
                    {modalState.data.member.firstName}{" "}
                    {modalState.data.member.lastName}
                  </strong>
                </>
              ) : modalState.data?.isAnonymous ? (
                <> (anonymous donation)</>
              ) : null}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
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
