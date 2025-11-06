import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { membersRouter } from "./routers/members";
import { authRouter } from "./routers/auth";
import { attendanceRouter } from "./routers/attendance";
import { attendanceMemberRouter } from "./routers/attendanceMembers";
import { tithesOfferingsRouter } from "./routers/offering";
import { prayerRequestRouter } from "./routers/prayerRequest";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  members: membersRouter,
  attendance: attendanceRouter,
  attendanceMembers: attendanceMemberRouter,
  offering: tithesOfferingsRouter,
  prayerRequest: prayerRequestRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
