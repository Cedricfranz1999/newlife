"use client";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import {
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Users,
  Filter,
  X,
  Loader2,
  UserPlus,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  Droplet,
  UserCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "~/components/ui/use-toast";

// Define the type for Member as returned from your API
type Member = {
  id: number;
  userType: "MEMBER" | "GUEST";
  image: string | null;
  lastName: string;
  firstName: string;
  middleName: string | null;
  fathesrName: string | null;
  mothersName: string | null;
  dateofBirth: Date;
  placeOfbirth: string;
  sex: string;
  height: string | null;
  weight: string | null;
  presentAddress: string | null;
  occupation: string | null;
  bloodType: string | null;
  jobExperience: any | null;
  cellphoneNumber: string | null;
  homeTelephoneNumber: string | null;
  email: string | null;
  spouseName: string | null;
  birthOrder: string | null;
  citizenship: string | null;
  previousReligion: string | null;
  dateAcceptedTheLord: Date | null;
  personLedYouToTheLord: string | null;
  firstDayOfChurchAttendance: Date | null;
  dateWaterBaptized: Date | null;
  dateSpiritBaptized: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Zod schema for form validation
const memberSchema = z.object({
  userType: z.enum(["MEMBER", "GUEST"]),
  image: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  fathesrName: z.string().optional(),
  mothersName: z.string().optional(),
  dateofBirth: z.string().min(1, "Date of birth is required"),
  placeOfbirth: z.string().min(1, "Place of birth is required"),
  sex: z.string().min(1, "Sex is required"),
  height: z.string().optional(),
  weight: z.string().optional(),
  presentAddress: z.string().optional(),
  occupation: z.string().optional(),
  bloodType: z.string().optional(),
  jobExperience: z.any().optional(),
  cellphoneNumber: z.string().optional(),
  homeTelephoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  spouseName: z.string().optional(),
  birthOrder: z.string().optional(),
  citizenship: z.string(),
  previousReligion: z.string().optional(),
  dateAcceptedTheLord: z.string().optional(),
  personLedYouToTheLord: z.string().optional(),
  firstDayOfChurchAttendance: z.string().optional(),
  dateWaterBaptized: z.string().optional(),
  dateSpiritBaptized: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MembersList() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sex, setSex] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isLoading, error, refetch } = api.members.list.useQuery({
    page,
    limit,
    search,
    sex: sex || undefined,
  });

  const createMember = api.members.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member created successfully!",
        className: "bg-green-50 border-green-200",
      });
      refetch();
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const updateMember = api.members.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member updated successfully!",
        className: "bg-green-50 border-green-200",
      });
      refetch();
      setIsEditModalOpen(false);
      setSelectedMember(null);
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const deleteMember = api.members.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member deleted successfully!",
        className: "bg-green-50 border-green-200",
      });
      refetch();
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userType: "MEMBER",
      citizenship: "Filipino",
      sex: "",
    },
  });

  const onSubmit = (data: MemberFormValues) => {
    if (selectedMember) {
      updateMember.mutate({ id: selectedMember.id, ...data });
    } else {
      createMember.mutate(data);
    }
  };

  const handleEdit = (member: Member) => {
    const formattedMember: MemberFormValues = {
      ...member,
      userType: member.userType,
      dateofBirth: format(new Date(member.dateofBirth), "yyyy-MM-dd"),
      dateAcceptedTheLord: member.dateAcceptedTheLord
        ? format(new Date(member.dateAcceptedTheLord), "yyyy-MM-dd")
        : undefined,
      firstDayOfChurchAttendance: member.firstDayOfChurchAttendance
        ? format(new Date(member.firstDayOfChurchAttendance), "yyyy-MM-dd")
        : undefined,
      dateWaterBaptized: member.dateWaterBaptized
        ? format(new Date(member.dateWaterBaptized), "yyyy-MM-dd")
        : undefined,
      dateSpiritBaptized: member.dateSpiritBaptized
        ? format(new Date(member.dateSpiritBaptized), "yyyy-MM-dd")
        : undefined,
      image: member.image ?? undefined,
      email: member.email ?? undefined,
      middleName: member.middleName ?? undefined,
      fathesrName: member.fathesrName ?? undefined,
      mothersName: member.mothersName ?? undefined,
      presentAddress: member.presentAddress ?? undefined,
      occupation: member.occupation ?? undefined,
      bloodType: member.bloodType ?? undefined,
      cellphoneNumber: member.cellphoneNumber ?? undefined,
      homeTelephoneNumber: member.homeTelephoneNumber ?? undefined,
      spouseName: member.spouseName ?? undefined,
      birthOrder: member.birthOrder ?? undefined,
      previousReligion: member.previousReligion ?? undefined,
      personLedYouToTheLord: member.personLedYouToTheLord ?? undefined,
      height: member.height ?? undefined,
      weight: member.weight ?? undefined,
      jobExperience: member.jobExperience ?? undefined,
      citizenship: member.citizenship ?? "Filipino",
    };
    setSelectedMember(member);
    form.reset(formattedMember);
    setIsEditModalOpen(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setMemberToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMember.mutate({ id: memberToDelete });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSex("");
    setPage(1);
  };

  const hasActiveFilters = search || sex;

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2c7451]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              <p className="font-medium">
                Error loading members: {error.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <Users className="h-8 w-8 text-[#2c7451]" />
            Members Directory
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your church members and guests
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2c7451] text-white shadow-md hover:bg-[#2c7451]/90">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-[1200px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <UserPlus className="h-6 w-6 text-[#2c7451]" />
                Create New Member
              </DialogTitle>
              <DialogDescription>
                Fill in the information below to add a new member to the
                directory.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...form.register("firstName")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                    {form.formState.errors.firstName && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <X className="h-3 w-3" />
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...form.register("lastName")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                    {form.formState.errors.lastName && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <X className="h-3 w-3" />
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Middle Name
                    </label>
                    <Input
                      {...form.register("middleName")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Father's Name
                    </label>
                    <Input
                      {...form.register("fathesrName")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Mother's Name
                    </label>
                    <Input
                      {...form.register("mothersName")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      {...form.register("dateofBirth")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                    {form.formState.errors.dateofBirth && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <X className="h-3 w-3" />
                        {form.formState.errors.dateofBirth.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Place of Birth <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...form.register("placeOfbirth")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                    {form.formState.errors.placeOfbirth && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <X className="h-3 w-3" />
                        {form.formState.errors.placeOfbirth.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Sex <span className="text-red-500">*</span>
                    </label>
                    <Select
                      onValueChange={(value: string) =>
                        form.setValue("sex", value)
                      }
                      value={form.watch("sex")}
                    >
                      <SelectTrigger className="focus:ring-[#2c7451]">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.sex && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <X className="h-3 w-3" />
                        {form.formState.errors.sex.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Citizenship
                    </label>
                    <Input
                      {...form.register("citizenship")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      {...form.register("email")}
                      type="email"
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Cellphone Number
                    </label>
                    <Input
                      {...form.register("cellphoneNumber")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Present Address
                    </label>
                    <Input
                      {...form.register("presentAddress")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Occupation
                    </label>
                    <Input
                      {...form.register("occupation")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Blood Type
                    </label>
                    <Input
                      {...form.register("bloodType")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Height
                    </label>
                    <Input
                      {...form.register("height")}
                      placeholder="e.g., 5'7&quot;"
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <Input
                      {...form.register("weight")}
                      placeholder="e.g., 60 kg"
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Spouse Name
                    </label>
                    <Input
                      {...form.register("spouseName")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                </div>
              </div>

              {/* Spiritual Information Section */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                  Spiritual Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Date Accepted The Lord
                    </label>
                    <Input
                      type="date"
                      {...form.register("dateAcceptedTheLord")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Person Led You To The Lord
                    </label>
                    <Input
                      {...form.register("personLedYouToTheLord")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      First Day Of Church Attendance
                    </label>
                    <Input
                      type="date"
                      {...form.register("firstDayOfChurchAttendance")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Date Water Baptized
                    </label>
                    <Input
                      type="date"
                      {...form.register("dateWaterBaptized")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Date Spirit Baptized
                    </label>
                    <Input
                      type="date"
                      {...form.register("dateSpiritBaptized")}
                      className="focus-visible:ring-[#2c7451]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#2c7451] text-white hover:bg-[#2c7451]/90"
                  disabled={createMember.isPending}
                >
                  {createMember.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Member
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 focus-visible:ring-[#2c7451]"
              />
            </div>
            <Select
              value={sex}
              onValueChange={(value: string) => {
                setSex(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full focus:ring-[#2c7451] sm:w-[180px]">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={limit.toString()}
              onValueChange={(value: string) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full focus:ring-[#2c7451] sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#2c7451]" />
            </div>
          ) : data?.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No members found
              </h3>
              <p className="mb-4 text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Get started by adding your first member."}
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#2c7451] text-white hover:bg-[#2c7451]/90"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">
                      Sex
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">
                      Date of Birth
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900">
                      Contact
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.members.map((member: Member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2c7451]/10">
                            <UserCircle2 className="h-6 w-6 text-[#2c7451]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.userType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            member.sex === "Male" ? "default" : "secondary"
                          }
                          className="font-normal"
                        >
                          {member.sex}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(member.dateofBirth), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              <span className="max-w-[200px] truncate">
                                {member.email}
                              </span>
                            </div>
                          )}
                          {member.cellphoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              {member.cellphoneNumber}
                            </div>
                          )}
                          {!member.email && !member.cellphoneNumber && (
                            <span className="text-sm text-gray-400">
                              No contact info
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleView(member)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-blue-600" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(member)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-green-600" />
                              <span>Edit Member</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(member.id)}
                              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Member</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-[1200px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Edit className="h-6 w-6 text-[#2c7451]" />
              Edit Member
            </DialogTitle>
            <DialogDescription>
              Update the member information below. Fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...form.register("firstName")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                  {form.formState.errors.firstName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <X className="h-3 w-3" />
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...form.register("lastName")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                  {form.formState.errors.lastName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <X className="h-3 w-3" />
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <Input
                    {...form.register("middleName")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Father's Name
                  </label>
                  <Input
                    {...form.register("fathesrName")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Mother's Name
                  </label>
                  <Input
                    {...form.register("mothersName")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    {...form.register("dateofBirth")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                  {form.formState.errors.dateofBirth && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <X className="h-3 w-3" />
                      {form.formState.errors.dateofBirth.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Place of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...form.register("placeOfbirth")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                  {form.formState.errors.placeOfbirth && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <X className="h-3 w-3" />
                      {form.formState.errors.placeOfbirth.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <Select
                    onValueChange={(value: string) =>
                      form.setValue("sex", value)
                    }
                    value={form.watch("sex")}
                  >
                    <SelectTrigger className="focus:ring-[#2c7451]">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.sex && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <X className="h-3 w-3" />
                      {form.formState.errors.sex.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Citizenship
                  </label>
                  <Input
                    {...form.register("citizenship")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    {...form.register("email")}
                    type="email"
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Cellphone Number
                  </label>
                  <Input
                    {...form.register("cellphoneNumber")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Present Address
                  </label>
                  <Input
                    {...form.register("presentAddress")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Additional Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Occupation
                  </label>
                  <Input
                    {...form.register("occupation")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Blood Type
                  </label>
                  <Input
                    {...form.register("bloodType")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Height
                  </label>
                  <Input
                    {...form.register("height")}
                    placeholder="e.g., 5'7&quot;"
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Weight
                  </label>
                  <Input
                    {...form.register("weight")}
                    placeholder="e.g., 150 lbs"
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Spouse Name
                  </label>
                  <Input
                    {...form.register("spouseName")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
              </div>
            </div>

            {/* Spiritual Information Section */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Spiritual Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Date Accepted The Lord
                  </label>
                  <Input
                    type="date"
                    {...form.register("dateAcceptedTheLord")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Person Led You To The Lord
                  </label>
                  <Input
                    {...form.register("personLedYouToTheLord")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    First Day Of Church Attendance
                  </label>
                  <Input
                    type="date"
                    {...form.register("firstDayOfChurchAttendance")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Date Water Baptized
                  </label>
                  <Input
                    type="date"
                    {...form.register("dateWaterBaptized")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Date Spirit Baptized
                  </label>
                  <Input
                    type="date"
                    {...form.register("dateSpiritBaptized")}
                    className="focus-visible:ring-[#2c7451]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#2c7451] text-white hover:bg-[#2c7451]/90"
                disabled={updateMember.isPending}
              >
                {updateMember.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Member
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedMember(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-[1200px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Eye className="h-6 w-6 text-[#2c7451]" />
              Member Details
            </DialogTitle>
            <DialogDescription>
              Viewing complete information for {selectedMember?.firstName}{" "}
              {selectedMember?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-900">
                <UserCircle2 className="h-5 w-5 text-[#2c7451]" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    First Name
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.firstName || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Name</p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.lastName || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Middle Name
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.middleName || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Father's Name
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.fathesrName || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Mother's Name
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.mothersName || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedMember?.dateofBirth
                      ? format(
                          new Date(selectedMember.dateofBirth),
                          "MMM dd, yyyy",
                        )
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Place of Birth
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selectedMember?.placeOfbirth || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Sex</p>
                  <Badge
                    variant={
                      selectedMember?.sex === "Male" ? "default" : "secondary"
                    }
                  >
                    {selectedMember?.sex || "—"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Citizenship
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.citizenship || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-900">
                <Phone className="h-5 w-5 text-[#2c7451]" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedMember?.email || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Cellphone Number
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedMember?.cellphoneNumber || "—"}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Present Address
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selectedMember?.presentAddress || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-900">
                <Briefcase className="h-5 w-5 text-[#2c7451]" />
                Additional Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Occupation
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.occupation || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Blood Type
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Droplet className="h-4 w-4 text-red-500" />
                    {selectedMember?.bloodType || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Height</p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.height || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.weight || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Spouse Name
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Heart className="h-4 w-4 text-red-500" />
                    {selectedMember?.spouseName || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Spiritual Information Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-900">
                <Heart className="h-5 w-5 text-[#2c7451]" />
                Spiritual Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Date Accepted The Lord
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedMember?.dateAcceptedTheLord
                      ? format(
                          new Date(selectedMember.dateAcceptedTheLord),
                          "MMM dd, yyyy",
                        )
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Person Led You To The Lord
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedMember?.personLedYouToTheLord || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    First Day Of Church Attendance
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedMember?.firstDayOfChurchAttendance
                      ? format(
                          new Date(selectedMember.firstDayOfChurchAttendance),
                          "MMM dd, yyyy",
                        )
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Date Water Baptized
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedMember?.dateWaterBaptized
                      ? format(
                          new Date(selectedMember.dateWaterBaptized),
                          "MMM dd, yyyy",
                        )
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Date Spirit Baptized
                  </p>
                  <p className="flex items-center gap-2 text-base text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedMember?.dateSpiritBaptized
                      ? format(
                          new Date(selectedMember.dateSpiritBaptized),
                          "MMM dd, yyyy",
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsViewModalOpen(false);
                if (selectedMember) {
                  handleEdit(selectedMember);
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Member
            </Button>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              member record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMember.isPending}
            >
              {deleteMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Member
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
