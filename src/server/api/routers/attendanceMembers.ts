// src/server/api/routers/attendanceMembers.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Define the attendance type enum based on your schema
const AttendanceType = {
  SUNDAY_SERVICE: "SUNDAY_SERVICE",
  BIBLE_STUDY: "BIBLE_STUDY",
  PRAYER_MEETING: "PRAYER_MEETING",
  YOUTH_SERVICE: "YOUTH_SERVICE",
  MIDWEEK_SERVICE: "MIDWEEK_SERVICE",
  SPECIAL_EVENT: "SPECIAL_EVENT",
} as const;

type AttendanceType = keyof typeof AttendanceType;

const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
} as const;

type AttendanceStatus = keyof typeof AttendanceStatus;

export const attendanceMemberRouter = createTRPCRouter({
  getMembersAttendance: publicProcedure
    .input(
      z.object({
        attendanceId: z.number().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { attendanceId, search } = input;

      const memberWhere: any = {};
      if (search) {
        memberWhere.OR = [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { middleName: { contains: search, mode: "insensitive" as const } },
        ];
      }

      // Fetch all members (or filtered members)
      const members = await ctx.db.members.findMany({
        where: memberWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          image: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });

      // If we have an attendanceId, fetch existing attendance records
      let memberAttendances: any[] = [];
      if (attendanceId) {
        memberAttendances = await ctx.db.attendanceMembers.findMany({
          where: { attendanceId },
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                image: true,
              },
            },
          },
        });
      }

      return {
        members,
        memberAttendances,
      };
    }),

  createOrUpdateWithMembers: publicProcedure
    .input(
      z.object({
        date: z.string().min(1, "Date is required"),
        type: z
          .enum([
            "SUNDAY_SERVICE",
            "BIBLE_STUDY",
            "PRAYER_MEETING",
            "YOUTH_SERVICE",
            "MIDWEEK_SERVICE",
            "SPECIAL_EVENT",
          ])
          .default("SUNDAY_SERVICE"),
        memberAttendances: z.array(
          z.object({
            memberId: z.number(),
            status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { date, type, memberAttendances } = input;

      // Check if attendance already exists for this date and type
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAttendance = await ctx.db.attendance.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
          type: type,
        },
      });

      if (existingAttendance) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Attendance for ${type} on this date already exists`,
        });
      }

      // Create the attendance record
      const attendance = await ctx.db.attendance.create({
        data: {
          date: new Date(date),
          type: type,
          AttendanceMembers: {
            create: memberAttendances.map((ma) => ({
              memberId: ma.memberId,
              status: ma.status,
            })),
          },
        },
        include: {
          AttendanceMembers: true,
        },
      });

      return attendance;
    }),

  updateMemberAttendance: publicProcedure
    .input(
      z.object({
        attendanceId: z.number(),
        memberAttendances: z.array(
          z.object({
            memberId: z.number(),
            status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { attendanceId, memberAttendances } = input;

      // Verify attendance exists
      const existingAttendance = await ctx.db.attendance.findUnique({
        where: { id: attendanceId },
      });

      if (!existingAttendance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attendance record not found",
        });
      }

      // Delete all existing attendance members for this record
      await ctx.db.attendanceMembers.deleteMany({
        where: { attendanceId },
      });

      // Create new attendance members
      const createdAttendances = await ctx.db.attendanceMembers.createMany({
        data: memberAttendances.map((ma) => ({
          attendanceId,
          memberId: ma.memberId,
          status: ma.status,
        })),
      });

      return { success: true, count: createdAttendances.count };
    }),
});
