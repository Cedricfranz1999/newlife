import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { OfferingType, UserType } from "@prisma/client";

export const tithesOfferingsRouter = createTRPCRouter({
  // Update your list procedure in the API router
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(10),
        type: z.nativeEnum(OfferingType).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        search: z.string().optional(),
        userType: z.nativeEnum(UserType).optional(),
        isAnonymous: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        limit,
        type,
        startDate,
        endDate,
        search,
        userType,
        isAnonymous,
      } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (typeof isAnonymous === "boolean") {
        where.isAnonymous = isAnonymous;
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

      // User type filter (member vs guest)
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
            note: { contains: search, mode: "insensitive" as const },
          },
          {
            receiptNumber: { contains: search, mode: "insensitive" as const },
          },
        ];
      }

      const [tithesOfferings, totalCount, totalAmountResult] =
        await Promise.all([
          ctx.db.tithesOfferings.findMany({
            where,
            skip,
            take: limit,
            orderBy: { date: "desc" },
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
          ctx.db.tithesOfferings.count({ where }),
          // Calculate total amount
          ctx.db.tithesOfferings.aggregate({
            where,
            _sum: {
              amount: true,
            },
          }),
        ]);

      return {
        tithesOfferings,
        totalCount,
        totalAmount: totalAmountResult._sum.amount || 0,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const tithesOffering = await ctx.db.tithesOfferings.findUnique({
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

      if (!tithesOffering) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tithes and offerings record not found",
        });
      }

      return tithesOffering;
    }),

  create: publicProcedure
    .input(
      z.object({
        memberId: z.number().optional(),
        date: z.string().min(1, "Date is required"),
        type: z.nativeEnum(OfferingType),
        amount: z.number().min(0, "Amount must be positive"),
        note: z.string().optional(),
        receiptNumber: z.string().optional(),
        isAnonymous: z.boolean().default(false),
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

      // Check for duplicate receipt number if provided
      if (input.receiptNumber) {
        const existingReceipt = await ctx.db.tithesOfferings.findFirst({
          where: {
            receiptNumber: input.receiptNumber,
          },
        });

        if (existingReceipt) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Receipt number already exists",
          });
        }
      }

      const tithesOffering = await ctx.db.tithesOfferings.create({
        data: {
          memberId: input.memberId,
          date: new Date(input.date),
          type: input.type,
          amount: input.amount,
          note: input.note,
          receiptNumber: input.receiptNumber,
          isAnonymous: input.isAnonymous,
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

      return tithesOffering;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        memberId: z.number().optional().nullable(),
        date: z.string().optional(),
        type: z.nativeEnum(OfferingType).optional(),
        amount: z.number().min(0, "Amount must be positive").optional(),
        note: z.string().optional().nullable(),
        receiptNumber: z.string().optional().nullable(),
        isAnonymous: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingRecord = await ctx.db.tithesOfferings.findUnique({
        where: { id },
      });

      if (!existingRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tithes and offerings record not found",
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

      // Check for duplicate receipt number if provided
      if (updateData.receiptNumber) {
        const existingReceipt = await ctx.db.tithesOfferings.findFirst({
          where: {
            receiptNumber: updateData.receiptNumber,
            NOT: { id: id },
          },
        });

        if (existingReceipt) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Receipt number already exists",
          });
        }
      }

      const transformedData: any = { ...updateData };
      if (updateData.date) {
        transformedData.date = new Date(updateData.date);
      }

      // Handle memberId null case (unlinking from member)
      if (updateData.memberId === null) {
        transformedData.memberId = null;
      }

      const tithesOffering = await ctx.db.tithesOfferings.update({
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

      return tithesOffering;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tithesOffering = await ctx.db.tithesOfferings.findUnique({
        where: { id: input.id },
      });

      if (!tithesOffering) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tithes and offerings record not found",
        });
      }

      await ctx.db.tithesOfferings.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getStats: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        type: z.nativeEnum(OfferingType).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, type } = input;

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

      const records = await ctx.db.tithesOfferings.findMany({
        where,
        select: {
          type: true,
          amount: true,
          date: true,
          isAnonymous: true,
          member: {
            select: {
              userType: true,
            },
          },
        },
      });

      const totalAmount = records.reduce(
        (sum, record) => sum + record.amount,
        0,
      );

      const amountByType = records.reduce(
        (acc, record) => {
          acc[record.type] = (acc[record.type] || 0) + record.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      const amountByUserType = records.reduce(
        (acc, record) => {
          const userType = record.member?.userType || "GUEST";
          acc[userType] = (acc[userType] || 0) + record.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      const anonymousCount = records.filter(
        (record) => record.isAnonymous,
      ).length;

      return {
        totalAmount,
        totalRecords: records.length,
        amountByType,
        amountByUserType,
        anonymousCount,
      };
    }),
});
