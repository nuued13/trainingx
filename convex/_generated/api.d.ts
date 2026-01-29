/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adaptiveEngine from "../adaptiveEngine.js";
import type * as agents from "../agents.js";
import type * as aiEvaluation from "../aiEvaluation.js";
import type * as aiMatching from "../aiMatching.js";
import type * as analytics from "../analytics.js";
import type * as assessments from "../assessments.js";
import type * as auth from "../auth.js";
import type * as certificates from "../certificates.js";
import type * as creatorStudio from "../creatorStudio.js";
import type * as customGPTs from "../customGPTs.js";
import type * as dailyDrills from "../dailyDrills.js";
import type * as debug from "../debug.js";
import type * as digitalThumbprint from "../digitalThumbprint.js";
import type * as duels from "../duels.js";
import type * as errors from "../errors.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as itemTemplates from "../itemTemplates.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lib_database_pathwayRequirements from "../lib/database/pathwayRequirements.js";
import type * as messages from "../messages.js";
import type * as migrations_backfillDuelMembers from "../migrations/backfillDuelMembers.js";
import type * as migrations_cleanOldDuels from "../migrations/cleanOldDuels.js";
import type * as migrations from "../migrations.js";
import type * as moderation from "../moderation.js";
import type * as otp_ResendOTP from "../otp/ResendOTP.js";
import type * as otp_TwilioOTP from "../otp/TwilioOTP.js";
import type * as otp_TwilioSDK from "../otp/TwilioSDK.js";
import type * as otp_TwilioVerify from "../otp/TwilioVerify.js";
import type * as otp_VerificationCodeEmail from "../otp/VerificationCodeEmail.js";
import type * as passwordReset_PasswordResetEmail from "../passwordReset/PasswordResetEmail.js";
import type * as passwordReset_ResendOTPPasswordReset from "../passwordReset/ResendOTPPasswordReset.js";
import type * as placementTest from "../placementTest.js";
import type * as posts from "../posts.js";
import type * as practiceProjects from "../practiceProjects.js";
import type * as practiceUserSkills from "../practiceUserSkills.js";
import type * as projects from "../projects.js";
import type * as quests from "../quests.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
import type * as seedPhase3 from "../seedPhase3.js";
import type * as sharing from "../sharing.js";
import type * as spacedRepetition from "../spacedRepetition.js";
import type * as testTokens from "../testTokens.js";
import type * as userStatsUtils from "../userStatsUtils.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adaptiveEngine: typeof adaptiveEngine;
  agents: typeof agents;
  aiEvaluation: typeof aiEvaluation;
  aiMatching: typeof aiMatching;
  analytics: typeof analytics;
  assessments: typeof assessments;
  auth: typeof auth;
  certificates: typeof certificates;
  creatorStudio: typeof creatorStudio;
  customGPTs: typeof customGPTs;
  dailyDrills: typeof dailyDrills;
  debug: typeof debug;
  digitalThumbprint: typeof digitalThumbprint;
  duels: typeof duels;
  errors: typeof errors;
  helpers: typeof helpers;
  http: typeof http;
  itemTemplates: typeof itemTemplates;
  leaderboard: typeof leaderboard;
  "lib/database/pathwayRequirements": typeof lib_database_pathwayRequirements;
  messages: typeof messages;
  "migrations/backfillDuelMembers": typeof migrations_backfillDuelMembers;
  "migrations/cleanOldDuels": typeof migrations_cleanOldDuels;
  migrations: typeof migrations;
  moderation: typeof moderation;
  "otp/ResendOTP": typeof otp_ResendOTP;
  "otp/TwilioOTP": typeof otp_TwilioOTP;
  "otp/TwilioSDK": typeof otp_TwilioSDK;
  "otp/TwilioVerify": typeof otp_TwilioVerify;
  "otp/VerificationCodeEmail": typeof otp_VerificationCodeEmail;
  "passwordReset/PasswordResetEmail": typeof passwordReset_PasswordResetEmail;
  "passwordReset/ResendOTPPasswordReset": typeof passwordReset_ResendOTPPasswordReset;
  placementTest: typeof placementTest;
  posts: typeof posts;
  practiceProjects: typeof practiceProjects;
  practiceUserSkills: typeof practiceUserSkills;
  projects: typeof projects;
  quests: typeof quests;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
  seedPhase3: typeof seedPhase3;
  sharing: typeof sharing;
  spacedRepetition: typeof spacedRepetition;
  testTokens: typeof testTokens;
  userStatsUtils: typeof userStatsUtils;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
