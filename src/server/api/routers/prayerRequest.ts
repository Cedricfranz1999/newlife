import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrayerRequestStatus } from "@prisma/client";

export const prayerRequestRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(10),
        status: z.nativeEnum(PrayerRequestStatus).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        search: z.string().optional(),
        userType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status, startDate, endDate, search, userType } =
        input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // User type filter
      if (userType) {
        where.member = {
          userType: userType,
        };
      }

      // Search filter
      if (search) {
        where.OR = [
          {
            member: {
              OR: [
                {
                  firstName: { contains: search, mode: "insensitive" as const },
                },
                {
                  lastName: { contains: search, mode: "insensitive" as const },
                },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            },
          },
          {
            title: { contains: search, mode: "insensitive" as const },
          },
          {
            description: { contains: search, mode: "insensitive" as const },
          },
          {
            note: { contains: search, mode: "insensitive" as const },
          },
        ];
      }

      const [prayerRequests, totalCount] = await Promise.all([
        ctx.db.prayerRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                userType: true,
              },
            },
          },
        }),
        ctx.db.prayerRequest.count({ where }),
      ]);

      return {
        prayerRequests,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const prayerRequest = await ctx.db.prayerRequest.findUnique({
        where: { id: input.id },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userType: true,
              email: true,
              cellphoneNumber: true,
            },
          },
        },
      });

      if (!prayerRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prayer request not found",
        });
      }

      return prayerRequest;
    }),

  create: publicProcedure
    .input(
      z.object({
        memberId: z.number().optional(),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        note: z.string().optional(),
        dateToPray: z.string().optional(),
        status: z.nativeEnum(PrayerRequestStatus).default("PENDING"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate member exists if provided
      if (input.memberId) {
        const member = await ctx.db.members.findUnique({
          where: { id: input.memberId },
        });

        if (!member) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Member not found",
          });
        }
      }

      const prayerRequest = await ctx.db.prayerRequest.create({
        data: {
          memberId: input.memberId,
          title: input.title,
          description: input.description,
          note: input.note,
          dateToPray: input.dateToPray ? new Date(input.dateToPray) : null,
          status: input.status,
        },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userType: true,
            },
          },
        },
      });

      return prayerRequest;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        memberId: z.number().optional().nullable(),
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        note: z.string().optional().nullable(),
        dateToPray: z.string().optional().nullable(),
        status: z.nativeEnum(PrayerRequestStatus).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingRecord = await ctx.db.prayerRequest.findUnique({
        where: { id },
      });

      if (!existingRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prayer request not found",
        });
      }

      // Validate member exists if provided
      if (updateData.memberId !== undefined && updateData.memberId !== null) {
        const member = await ctx.db.members.findUnique({
          where: { id: updateData.memberId },
        });

        if (!member) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Member not found",
          });
        }
      }

      const transformedData: any = { ...updateData };
      if (updateData.dateToPray !== undefined) {
        transformedData.dateToPray = updateData.dateToPray
          ? new Date(updateData.dateToPray)
          : null;
      }

      // Handle memberId null case (unlinking from member)
      if (updateData.memberId === null) {
        transformedData.memberId = null;
      }

      const prayerRequest = await ctx.db.prayerRequest.update({
        where: { id },
        data: transformedData,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userType: true,
            },
          },
        },
      });

      return prayerRequest;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const prayerRequest = await ctx.db.prayerRequest.findUnique({
        where: { id: input.id },
      });

      if (!prayerRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prayer request not found",
        });
      }

      await ctx.db.prayerRequest.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getStats: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.nativeEnum(PrayerRequestStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, status } = input;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      const records = await ctx.db.prayerRequest.findMany({
        where,
        select: {
          status: true,
          createdAt: true,
          member: {
            select: {
              userType: true,
            },
          },
        },
      });

      const totalCount = records.length;

      const countByStatus = records.reduce(
        (acc, record) => {
          acc[record.status] = (acc[record.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const countByUserType = records.reduce(
        (acc, record) => {
          const userType = record.member?.userType || "GUEST";
          acc[userType] = (acc[userType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalCount,
        countByStatus,
        countByUserType,
      };
    }),
});
