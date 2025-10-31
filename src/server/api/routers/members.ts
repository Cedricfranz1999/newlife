// ~/server/api/routers/members.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const membersRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        sex: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sex } = input;
      const skip = (page - 1) * limit;

      const where: any = {
        AND: [],
      };

      if (search) {
        where.AND.push({
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { middleName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        });
      }

      if (sex) {
        where.AND.push({ sex });
      }

      if (where.AND.length === 0) {
        delete where.AND;
      }

      const [members, totalCount] = await Promise.all([
        ctx.db.members.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.members.count({ where }),
      ]);

      return {
        members,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.members.findUnique({
        where: { id: input.id },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return member;
    }),

  create: publicProcedure
    .input(
      z.object({
        userType: z.enum(["MEMBER", "GUEST"]).default("MEMBER"),
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
        citizenship: z.string().default("Filipino"),
        previousReligion: z.string().optional(),
        dateAcceptedTheLord: z.string().optional(),
        personLedYouToTheLord: z.string().optional(),
        firstDayOfChurchAttendance: z.string().optional(),
        dateWaterBaptized: z.string().optional(),
        dateSpiritBaptized: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const transformedData = {
        ...input,
        dateofBirth: new Date(input.dateofBirth),
        dateAcceptedTheLord: input.dateAcceptedTheLord
          ? new Date(input.dateAcceptedTheLord)
          : null,
        firstDayOfChurchAttendance: input.firstDayOfChurchAttendance
          ? new Date(input.firstDayOfChurchAttendance)
          : null,
        dateWaterBaptized: input.dateWaterBaptized
          ? new Date(input.dateWaterBaptized)
          : null,
        dateSpiritBaptized: input.dateSpiritBaptized
          ? new Date(input.dateSpiritBaptized)
          : null,
      };

      const member = await ctx.db.members.create({
        data: transformedData,
      });

      return member;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        userType: z.enum(["MEMBER", "GUEST"]).optional(),
        image: z.string().optional(),
        lastName: z.string().min(1, "Last name is required").optional(),
        firstName: z.string().min(1, "First name is required").optional(),
        middleName: z.string().optional(),
        fathesrName: z.string().optional(),
        mothersName: z.string().optional(),
        dateofBirth: z.string().optional(),
        placeOfbirth: z.string().optional(),
        sex: z.string().optional(),
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
        citizenship: z.string().optional(),
        previousReligion: z.string().optional(),
        dateAcceptedTheLord: z.string().optional(),
        personLedYouToTheLord: z.string().optional(),
        firstDayOfChurchAttendance: z.string().optional(),
        dateWaterBaptized: z.string().optional(),
        dateSpiritBaptized: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const existingMember = await ctx.db.members.findUnique({
        where: { id },
      });

      if (!existingMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      const transformedData: any = { ...updateData };
      if (updateData.dateofBirth)
        transformedData.dateofBirth = new Date(updateData.dateofBirth);
      if (updateData.dateAcceptedTheLord)
        transformedData.dateAcceptedTheLord = new Date(
          updateData.dateAcceptedTheLord,
        );
      if (updateData.firstDayOfChurchAttendance)
        transformedData.firstDayOfChurchAttendance = new Date(
          updateData.firstDayOfChurchAttendance,
        );
      if (updateData.dateWaterBaptized)
        transformedData.dateWaterBaptized = new Date(
          updateData.dateWaterBaptized,
        );
      if (updateData.dateSpiritBaptized)
        transformedData.dateSpiritBaptized = new Date(
          updateData.dateSpiritBaptized,
        );

      const member = await ctx.db.members.update({
        where: { id },
        data: transformedData,
      });

      return member;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.members.findUnique({
        where: { id: input.id },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      await ctx.db.members.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
