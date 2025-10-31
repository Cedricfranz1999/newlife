"use client";
import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  Camera,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "~/components/ui/use-toast";
import { uploadImage } from "~/lib/upload/uploadImage";

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
  sex: string | null;
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

const memberSchema = z.object({
  userType: z.enum(["MEMBER", "GUEST"]),
  image: z.string().optional().nullable(),
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable(),
  fathesrName: z.string().optional().nullable(),
  mothersName: z.string().optional().nullable(),
  dateofBirth: z.string().min(1, "Date of birth is required"),
  placeOfbirth: z.string().min(1, "Place of birth is required"),
  sex: z.string().min(1, "Sex is required"),
  height: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  presentAddress: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  jobExperience: z.any().optional().nullable(),
  cellphoneNumber: z.string().optional().nullable(),
  homeTelephoneNumber: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  spouseName: z.string().optional().nullable(),
  birthOrder: z.string().optional().nullable(),
  citizenship: z.string(),
  previousReligion: z.string().optional().nullable(),
  dateAcceptedTheLord: z.string().optional().nullable(),
  personLedYouToTheLord: z.string().optional().nullable(),
  firstDayOfChurchAttendance: z.string().optional().nullable(),
  dateWaterBaptized: z.string().optional().nullable(),
  dateSpiritBaptized: z.string().optional().nullable(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

// Image Upload Component
const ImageUpload = ({
  form,
  currentImage,
  onImageChange,
}: {
  form: any;
  currentImage?: string | null;
  onImageChange: (file: File | null) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    onImageChange(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const imageUrl = previewUrl || form.watch("image") || currentImage;

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-4">
      <div className="relative">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Profile preview"
              className="h-24 w-24 rounded-full border-4 border-[#2c7451] object-cover shadow-lg sm:h-32 sm:w-32"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white shadow-md transition-all hover:bg-red-600 sm:-top-2 sm:-right-2 sm:p-1.5"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 sm:h-32 sm:w-32">
            <UserCircle2 className="h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
          {imageUrl ? "Change" : "Upload"} Photo
        </Button>

        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="text-xs text-red-600 hover:text-red-700 sm:text-sm"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      <p className="px-2 text-center text-xs text-gray-500">
        JPEG, PNG, WebP supported. Max 5MB.
      </p>
    </div>
  );
};

// Personal Info Section
const PersonalInfoSection = ({
  form,
  onImageChange,
}: {
  form: any;
  onImageChange: (file: File | null) => void;
}) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center">
      <h3 className="w-full border-b pb-2 text-base font-semibold text-gray-900 sm:w-auto sm:text-lg">
        Personal Information
      </h3>
      <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center">
        <label className="text-xs font-bold whitespace-nowrap text-gray-700 sm:text-sm">
          Church member?:
        </label>
        <Select
          onValueChange={(value: "MEMBER" | "GUEST") =>
            form.setValue("userType", value)
          }
          value={form.watch("userType")}
        >
          <SelectTrigger className="w-full text-xs focus:ring-[#2c7451] sm:w-40 sm:text-sm">
            <SelectValue placeholder="Select user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MEMBER">YES</SelectItem>
            <SelectItem value="GUEST">Guest only</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.userType && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <X className="h-3 w-3" />
            {form.formState.errors.userType.message}
          </p>
        )}
      </div>
    </div>

    <div className="mb-6 flex flex-col items-center border-b pb-6">
      <ImageUpload
        form={form}
        currentImage={form.watch("image")}
        onImageChange={onImageChange}
      />
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {[
        { name: "firstName", label: "First Name", required: true },
        { name: "lastName", label: "Last Name", required: true },
        { name: "middleName", label: "Middle Name" },
        { name: "fathesrName", label: "Father's Name" },
        { name: "mothersName", label: "Mother's Name" },
        {
          name: "dateofBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        { name: "placeOfbirth", label: "Place of Birth", required: true },
      ].map((field) => (
        <FormField key={field.name} form={form} {...field} />
      ))}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
          Sex <span className="text-red-500">*</span>
        </label>
        <Select
          onValueChange={(value: string) => form.setValue("sex", value)}
          value={form.watch("sex") || ""}
        >
          <SelectTrigger className="w-full text-xs focus:ring-[#2c7451] sm:text-sm">
            <SelectValue placeholder="Select sex" />
          </SelectTrigger>
          <SelectContent className="w-full">
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

      <FormField form={form} name="citizenship" label="Citizenship" />
    </div>
  </div>
);

const ContactInfoSection = ({ form }: { form: any }) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="border-b pb-2 text-base font-semibold text-gray-900 sm:text-lg">
      Contact Information
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {[
        { name: "email", label: "Email", type: "email" },
        { name: "cellphoneNumber", label: "Cellphone Number" },
        { name: "presentAddress", label: "Present Address" },
      ].map((field) => (
        <FormField key={field.name} form={form} {...field} />
      ))}
    </div>
  </div>
);

const AdditionalDetailsSection = ({ form }: { form: any }) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="border-b pb-2 text-base font-semibold text-gray-900 sm:text-lg">
      Additional Details
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {[
        { name: "occupation", label: "Occupation" },
        { name: "bloodType", label: "Blood Type" },
        { name: "height", label: "Height", placeholder: "e.g., 5'7\"" },
        { name: "weight", label: "Weight", placeholder: "e.g., 60 kg" },
        { name: "spouseName", label: "Spouse Name" },
      ].map((field) => (
        <FormField key={field.name} form={form} {...field} />
      ))}
    </div>
  </div>
);

const SpiritualInfoSection = ({ form }: { form: any }) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="border-b pb-2 text-base font-semibold text-gray-900 sm:text-lg">
      Spiritual Information
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {[
        {
          name: "dateAcceptedTheLord",
          label: "Date Accepted The Lord",
          type: "date",
        },
        { name: "personLedYouToTheLord", label: "Person Led You To The Lord" },
        {
          name: "firstDayOfChurchAttendance",
          label: "First Day Of Church Attendance",
          type: "date",
        },
        {
          name: "dateWaterBaptized",
          label: "Date Water Baptized",
          type: "date",
        },
        {
          name: "dateSpiritBaptized",
          label: "Date Spirit Baptized",
          type: "date",
        },
      ].map((field) => (
        <FormField key={field.name} form={form} {...field} />
      ))}
    </div>
  </div>
);

const FormField = ({
  form,
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  form: any;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      type={type}
      placeholder={placeholder}
      {...form.register(name)}
      className="text-xs focus-visible:ring-[#2c7451] sm:text-sm"
    />
    {form.formState.errors[name] && (
      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
        <X className="h-3 w-3" />
        {form.formState.errors[name]?.message as string}
      </p>
    )}
  </div>
);

// Member Form
const MemberForm = ({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
  isUploading = false,
  onImageChange,
  mode = "create",
}: {
  form: any;
  onSubmit: (data: MemberFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isUploading?: boolean;
  onImageChange: (file: File | null) => void;
  mode?: "create" | "edit";
}) => (
  <form
    onSubmit={form.handleSubmit(onSubmit)}
    className="space-y-4 sm:space-y-6"
  >
    <PersonalInfoSection form={form} onImageChange={onImageChange} />
    <ContactInfoSection form={form} />
    <AdditionalDetailsSection form={form} />
    <SpiritualInfoSection form={form} />

    <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:gap-3">
      <Button
        type="submit"
        className="flex-1 bg-[#2c7451] text-xs text-white hover:bg-[#2c7451]/90 sm:text-sm"
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting || isUploading ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin sm:h-4 sm:w-4" />
            {isUploading
              ? "Uploading Image..."
              : mode === "create"
                ? "Creating..."
                : "Updating..."}
          </>
        ) : (
          <>
            {mode === "create" ? (
              <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {mode === "create" ? "Create Member" : "Update Member"}
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="text-xs sm:text-sm"
      >
        Cancel
      </Button>
    </div>
  </form>
);

// View Member Details
const ViewMemberDetails = ({
  member,
  onEdit,
  onClose,
}: {
  member: Member;
  onEdit: () => void;
  onClose: () => void;
}) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center sm:pb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative flex-shrink-0">
          {member.image ? (
            <img
              src={member.image}
              alt={`${member.firstName} ${member.lastName}`}
              className="h-16 w-16 rounded-full border-4 border-[#2c7451] object-cover shadow-lg sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 sm:h-20 sm:w-20">
              <UserCircle2 className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">
            {member.firstName} {member.lastName}
          </h2>
          <p className="text-sm text-gray-600 sm:text-base">
            {member.middleName || "No middle name"}
          </p>
        </div>
      </div>
      <Badge className="w-full bg-[#2c7451] text-center text-xs text-white sm:w-40 sm:text-sm">
        {member.userType === "MEMBER" ? "ALREADY A MEMBER" : "GUEST ONLY"}
      </Badge>
    </div>

    <div className="space-y-3 sm:space-y-4">
      <div className="mb-6 flex items-center justify-between sm:mb-12">
        <h3 className="flex items-center gap-2 border-b pb-2 text-base font-semibold text-gray-900 sm:text-lg">
          <UserCircle2 className="h-4 w-4 text-[#2c7451] sm:h-5 sm:w-5" />
          Personal Information
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {[
          { label: "First Name", value: member.firstName },
          { label: "Last Name", value: member.lastName },
          { label: "Middle Name", value: member.middleName },
          { label: "Father's Name", value: member.fathesrName },
          { label: "Mother's Name", value: member.mothersName },
          {
            label: "Date of Birth",
            value: member.dateofBirth
              ? format(new Date(member.dateofBirth), "MMM dd, yyyy")
              : "—",
            icon: Calendar,
          },
          { label: "Place of Birth", value: member.placeOfbirth, icon: MapPin },
          { label: "Sex", value: member.sex || "—", badge: true },
          { label: "Citizenship", value: member.citizenship },
        ].map((field, index) => (
          <DetailField key={index} {...field} />
        ))}
      </div>
    </div>

    <DetailSection
      title="Contact Information"
      icon={Phone}
      fields={[
        { label: "Email", value: member.email, icon: Mail },
        {
          label: "Cellphone Number",
          value: member.cellphoneNumber,
          icon: Phone,
        },
        {
          label: "Present Address",
          value: member.presentAddress,
          icon: MapPin,
          fullWidth: true,
        },
      ]}
    />

    <DetailSection
      title="Additional Details"
      icon={Briefcase}
      fields={[
        { label: "Occupation", value: member.occupation },
        { label: "Blood Type", value: member.bloodType, icon: Droplet },
        { label: "Height", value: member.height },
        { label: "Weight", value: member.weight },
        { label: "Spouse Name", value: member.spouseName, icon: Heart },
      ]}
    />

    <DetailSection
      title="Spiritual Information"
      icon={Heart}
      fields={[
        {
          label: "Date Accepted The Lord",
          value: member.dateAcceptedTheLord
            ? format(new Date(member.dateAcceptedTheLord), "MMM dd, yyyy")
            : "—",
          icon: Calendar,
        },
        {
          label: "Person Led You To The Lord",
          value: member.personLedYouToTheLord,
        },
        {
          label: "First Day Of Church Attendance",
          value: member.firstDayOfChurchAttendance
            ? format(
                new Date(member.firstDayOfChurchAttendance),
                "MMM dd, yyyy",
              )
            : "—",
          icon: Calendar,
        },
        {
          label: "Date Water Baptized",
          value: member.dateWaterBaptized
            ? format(new Date(member.dateWaterBaptized), "MMM dd, yyyy")
            : "—",
          icon: Calendar,
        },
        {
          label: "Date Spirit Baptized",
          value: member.dateSpiritBaptized
            ? format(new Date(member.dateSpiritBaptized), "MMM dd, yyyy")
            : "—",
          icon: Calendar,
        },
      ]}
    />

    <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row sm:gap-3">
      <Button variant="outline" onClick={onEdit} className="text-xs sm:text-sm">
        <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        Edit Member
      </Button>
      <Button
        variant="outline"
        onClick={onClose}
        className="text-xs sm:text-sm"
      >
        Close
      </Button>
    </div>
  </div>
);

const DetailSection = ({
  title,
  icon: Icon,
  fields,
}: {
  title: string;
  icon: any;
  fields: any[];
}) => (
  <div className="space-y-3 sm:space-y-4">
    <h3 className="flex items-center gap-2 border-b pb-2 text-base font-semibold text-gray-900 sm:text-lg">
      <Icon className="h-4 w-4 text-[#2c7451] sm:h-5 sm:w-5" />
      {title}
    </h3>
    <div
      className={`grid grid-cols-1 gap-3 sm:gap-4 ${fields.some((f: any) => f.fullWidth) ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
    >
      {fields.map((field, index) => (
        <div key={index} className={field.fullWidth ? "sm:col-span-2" : ""}>
          <DetailField {...field} />
        </div>
      ))}
    </div>
  </div>
);

const DetailField = ({
  label,
  value,
  icon: Icon,
  badge = false,
}: {
  label: string;
  value: any;
  icon?: any;
  badge?: boolean;
}) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
    {badge ? (
      <Badge variant="outline" className="text-xs sm:text-sm">
        {value || "—"}
      </Badge>
    ) : (
      <p className="flex items-center gap-2 text-sm break-words text-gray-900 sm:text-base">
        {Icon && (
          <Icon className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-4 sm:w-4" />
        )}
        {value || "—"}
      </p>
    )}
  </div>
);

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-3 py-3 sm:px-6">
      <div className="flex flex-1 flex-col items-center justify-between gap-3 sm:flex-row">
        <div>
          <p className="text-center text-xs text-gray-700 sm:text-left sm:text-sm">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="hidden h-8 w-8 p-0 sm:flex"
          >
            <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`h-8 w-8 p-0 text-xs sm:text-sm ${currentPage === page ? "bg-[#2c7451] text-white" : ""}`}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden h-8 w-8 p-0 sm:flex"
          >
            <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Mobile Member Card Component
const MemberCard = ({
  member,
  onView,
  onEdit,
  onDelete,
}: {
  member: Member;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card className="overflow-hidden transition-shadow hover:shadow-md">
    <CardContent className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {member.image ? (
              <img
                src={member.image}
                alt={`${member.firstName} ${member.lastName}`}
                className="h-12 w-12 rounded-full border-2 border-[#2c7451] object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100">
                <UserCircle2 className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {member.firstName} {member.lastName}
            </p>
            <p className="truncate text-xs text-gray-500">
              {member.middleName || "No middle name"}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onView} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4 text-blue-600" />
              <span>View Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4 text-green-600" />
              <span>Edit Member</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Member</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge
            className={`text-xs ${
              member.userType === "MEMBER"
                ? "bg-[#2c7451] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {member.userType}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            {member.sex || "—"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="h-3 w-3 flex-shrink-0 text-gray-400" />
          <span className="truncate">
            {format(new Date(member.dateofBirth), "MMM dd, yyyy")}
          </span>
        </div>

        {member.email && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <span className="truncate">{member.email}</span>
          </div>
        )}

        {member.cellphoneNumber && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <span>{member.cellphoneNumber}</span>
          </div>
        )}

        {!member.email && !member.cellphoneNumber && (
          <p className="text-xs text-gray-400">No contact info</p>
        )}
      </div>
    </CardContent>
  </Card>
);

// Main Component
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      setSelectedImageFile(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
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
      setSelectedImageFile(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
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
      sex: "Male",
      image: null,
    },
  });

  useEffect(() => {
    if (isCreateModalOpen) {
      form.reset({
        userType: "MEMBER",
        citizenship: "Filipino",
        sex: "Male",
        image: null,
        firstName: "",
        lastName: "",
        middleName: "",
        fathesrName: "",
        mothersName: "",
        dateofBirth: "",
        placeOfbirth: "",
        height: "",
        weight: "",
        presentAddress: "",
        occupation: "",
        bloodType: "",
        jobExperience: "",
        cellphoneNumber: "",
        homeTelephoneNumber: "",
        email: "",
        spouseName: "",
        birthOrder: "",
        previousReligion: "",
        dateAcceptedTheLord: "",
        personLedYouToTheLord: "",
        firstDayOfChurchAttendance: "",
        dateWaterBaptized: "",
        dateSpiritBaptized: "",
      });
      setSelectedImageFile(null);
    }
  }, [isCreateModalOpen, form]);

  const handleImageChange = (file: File | null) => {
    setSelectedImageFile(file);
  };

  const onSubmit = async (data: MemberFormValues) => {
    try {
      setIsUploading(true);

      let imageUrl = data.image;

      if (selectedImageFile) {
        try {
          console.log("Uploading image...");
          imageUrl = await uploadImage(selectedImageFile);
          console.log("Image uploaded successfully:", imageUrl);

          toast({
            title: "Success",
            description: "Image uploaded successfully!",
            className: "bg-green-50 border-green-200",
          });
        } catch (error) {
          console.error("Image upload failed:", error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }

      const memberData = {
        ...data,
        image: imageUrl,
      };

      console.log("Submitting member data:", memberData);

      if (selectedMember) {
        await updateMember.mutateAsync({
          id: selectedMember.id,
          ...memberData,
        });
      } else {
        await createMember.mutateAsync(memberData);
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
      image: member.image ?? null,
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
      sex: member.sex || "Male",
    };
    setSelectedMember(member);
    form.reset(formattedMember);
    setSelectedImageFile(null);
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
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="p-3 sm:p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              <p className="text-sm font-medium sm:text-base">
                Error loading members: {error.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            <Users className="h-6 w-6 text-[#2c7451] sm:h-8 sm:w-8" />
            Members Directory
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Manage your church members and guests
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-[#2c7451] text-xs text-white shadow-md hover:bg-[#2c7451]/90 sm:w-auto sm:text-sm"
              onClick={() => {
                form.reset();
                setSelectedMember(null);
                setSelectedImageFile(null);
              }}
            >
              <UserPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Add New Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] w-[95vw] max-w-6xl overflow-y-auto md:max-w-[1200px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                <UserPlus className="h-5 w-5 text-[#2c7451] sm:h-6 sm:w-6" />
                Create New Member
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Fill in the information below to add a new member to the
                directory.
              </DialogDescription>
            </DialogHeader>
            <MemberForm
              form={form}
              onSubmit={onSubmit}
              onCancel={() => {
                setIsCreateModalOpen(false);
                setSelectedImageFile(null);
              }}
              isSubmitting={createMember.isPending}
              isUploading={isUploading}
              onImageChange={handleImageChange}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="border-green-100">
        <CardContent className="pt-4 sm:pt-6">
          {/* Mobile Filter Toggle */}
          <div className="mb-3 sm:hidden">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full justify-between text-xs"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-3 w-3" />
                Filters
              </span>
              {hasActiveFilters && (
                <Badge className="bg-[#2c7451] text-xs text-white">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Container */}
          <div className={`${showMobileFilters ? "block" : "hidden"} sm:block`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 transform text-gray-400 sm:h-4 sm:w-4" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 text-xs focus-visible:ring-[#2c7451] sm:pl-10 sm:text-sm"
                />
              </div>
              <Select
                value={sex}
                onValueChange={(value: string) => {
                  setSex(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full text-xs focus:ring-[#2c7451] sm:w-[180px] sm:text-sm">
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
                <SelectTrigger className="w-full text-xs focus:ring-[#2c7451] sm:w-[140px] sm:text-sm">
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
                  className="w-full text-xs sm:w-auto sm:text-sm"
                >
                  <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table/Cards */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#2c7451]" />
            </div>
          ) : data?.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-gray-300 sm:h-16 sm:w-16" />
              <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
                No members found
              </h3>
              <p className="mb-4 text-xs text-gray-500 sm:text-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Get started by adding your first member."}
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#2c7451] text-xs text-white hover:bg-[#2c7451]/90 sm:text-sm"
                >
                  <UserPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block space-y-3 p-3 sm:p-4 lg:hidden">
                {data?.members.map((member: Member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onView={() => handleView(member)}
                    onEdit={() => handleEdit(member)}
                    onDelete={() => handleDeleteClick(member.id)}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      {[
                        "Profile",
                        "Name",
                        "Type",
                        "Sex",
                        "Date of Birth",
                        "Contact",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="p-4 text-left text-sm font-semibold text-gray-900"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.members.map((member: Member) => (
                      <tr
                        key={member.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="h-10 w-10 rounded-full border-2 border-[#2c7451] object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100">
                                <UserCircle2 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {member.middleName || "No middle name"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={
                              member.userType === "MEMBER"
                                ? "bg-[#2c7451] text-white"
                                : "bg-gray-200 text-gray-800"
                            }
                          >
                            {member.userType}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-normal">
                            {member.sex || "—"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(
                              new Date(member.dateofBirth),
                              "MMM dd, yyyy",
                            )}
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

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <Pagination
                  currentPage={data.currentPage}
                  totalPages={data.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              <Edit className="h-5 w-5 text-[#2c7451] sm:h-6 sm:w-6" />
              Edit Member
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update the member information below. Fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedMember(null);
              form.reset();
              setSelectedImageFile(null);
            }}
            isSubmitting={updateMember.isPending}
            isUploading={isUploading}
            onImageChange={handleImageChange}
            mode="edit"
          />
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-6xl overflow-y-auto md:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              <Eye className="h-5 w-5 text-[#2c7451] sm:h-6 sm:w-6" />
              Member Details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Viewing complete information for {selectedMember?.firstName}{" "}
              {selectedMember?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <ViewMemberDetails
              member={selectedMember}
              onEdit={() => {
                setIsViewModalOpen(false);
                handleEdit(selectedMember);
              }}
              onClose={() => setIsViewModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="w-[90vw] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trash2 className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This action cannot be undone. This will permanently delete the
              member record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full text-xs sm:w-auto sm:text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full bg-red-600 text-xs hover:bg-red-700 sm:w-auto sm:text-sm"
              disabled={deleteMember.isPending}
            >
              {deleteMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
