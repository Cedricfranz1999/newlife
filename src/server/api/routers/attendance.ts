import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { AttendanceType } from "@prisma/client";

export const attendanceRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(10),
        type: z.nativeEnum(AttendanceType).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, type, startDate, endDate, search } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type;
      }

      // Date range filter
      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = new Date(startDate);
        }
        if (endDate) {
          where.date.lte = new Date(endDate);
        }
      }

      // Search filter (by date string or type)
      if (search) {
        where.OR = [
          {
            type: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          // You can add more search fields here if needed
        ];
      }

      const [attendance, totalCount] = await Promise.all([
        ctx.db.attendance.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: "desc" },
        }),
        ctx.db.attendance.count({ where }),
      ]);

      return {
        attendance,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const attendance = await ctx.db.attendance.findUnique({
        where: { id: input.id },
      });

      if (!attendance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attendance record not found",
        });
      }

      return attendance;
    }),

  create: publicProcedure
    .input(
      z.object({
        date: z.string().min(1, "Date is required"),
        type: z.nativeEnum(AttendanceType).default("SUNDAY_SERVICE"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if attendance already exists for this date and type
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAttendance = await ctx.db.attendance.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
          type: input.type,
        },
      });

      if (existingAttendance) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Attendance for ${input.type} on this date already exists`,
        });
      }

      const attendance = await ctx.db.attendance.create({
        data: {
          date: new Date(input.date),
          type: input.type,
        },
      });

      return attendance;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        date: z.string().optional(),
        type: z.nativeEnum(AttendanceType).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingAttendance = await ctx.db.attendance.findUnique({
        where: { id },
      });

      if (!existingAttendance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attendance record not found",
        });
      }

      // If updating date and type, check for duplicates
      if (updateData.date && updateData.type) {
        const startOfDay = new Date(updateData.date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(updateData.date);
        endOfDay.setHours(23, 59, 59, 999);

        const duplicateAttendance = await ctx.db.attendance.findFirst({
          where: {
            date: {
              gte: startOfDay,
              lt: endOfDay,
            },
            type: updateData.type,
            NOT: { id: id },
          },
        });

        if (duplicateAttendance) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Attendance for ${updateData.type} on this date already exists`,
          });
        }
      }

      const transformedData: any = { ...updateData };
      if (updateData.date) {
        transformedData.date = new Date(updateData.date);
      }

      const attendance = await ctx.db.attendance.update({
        where: { id },
        data: transformedData,
      });

      return attendance;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const attendance = await ctx.db.attendance.findUnique({
        where: { id: input.id },
      });

      if (!attendance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attendance record not found",
        });
      }

      await ctx.db.attendance.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
