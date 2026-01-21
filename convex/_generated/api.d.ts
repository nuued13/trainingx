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
import type * as admin from "../admin.js";
import type * as aiEvaluation from "../aiEvaluation.js";
import type * as aiMatching from "../aiMatching.js";
import type * as aiService from "../aiService.js";
import type * as analytics from "../analytics.js";
import type * as assessmentGrading from "../assessmentGrading.js";
import type * as assessmentQuestions from "../assessmentQuestions.js";
import type * as assessments from "../assessments.js";
import type * as auth from "../auth.js";
import type * as careerCoach_db from "../careerCoach/db.js";
import type * as careerCoach_index from "../careerCoach/index.js";
import type * as certificates from "../certificates.js";
import type * as contentModeration from "../contentModeration.js";
import type * as creatorStudio from "../creatorStudio.js";
import type * as customDomains from "../customDomains.js";
import type * as customGPTs from "../customGPTs.js";
import type * as dailyDrills from "../dailyDrills.js";
import type * as debug from "../debug.js";
import type * as debugAllSlugs from "../debugAllSlugs.js";
import type * as debugSlug from "../debugSlug.js";
import type * as digitalThumbprint from "../digitalThumbprint.js";
import type * as domainAssessments from "../domainAssessments.js";
import type * as duels from "../duels.js";
import type * as errors from "../errors.js";
import type * as feedback from "../feedback.js";
import type * as fixSlug from "../fixSlug.js";
import type * as fixUserProgress from "../fixUserProgress.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as itemTemplates from "../itemTemplates.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lib_ai from "../lib/ai.js";
import type * as messages from "../messages.js";
import type * as migrateToNewTracks from "../migrateToNewTracks.js";
import type * as migrations from "../migrations.js";
import type * as migrations_backfillDuelMembers from "../migrations/backfillDuelMembers.js";
import type * as migrations_cleanOldDuels from "../migrations/cleanOldDuels.js";
import type * as moderation from "../moderation.js";
import type * as normalizeEmail from "../normalizeEmail.js";
import type * as otp_ResendOTP from "../otp/ResendOTP.js";
import type * as otp_TwilioOTP from "../otp/TwilioOTP.js";
import type * as otp_TwilioSDK from "../otp/TwilioSDK.js";
import type * as otp_TwilioVerify from "../otp/TwilioVerify.js";
import type * as otp_VerificationCodeEmail from "../otp/VerificationCodeEmail.js";
import type * as passwordReset_PasswordResetEmail from "../passwordReset/PasswordResetEmail.js";
import type * as passwordReset_ResendOTPPasswordReset from "../passwordReset/ResendOTPPasswordReset.js";
import type * as pathways from "../pathways.js";
import type * as placementTest from "../placementTest.js";
import type * as posts from "../posts.js";
import type * as practiceDomains from "../practiceDomains.js";
import type * as practiceProjects from "../practiceProjects.js";
import type * as practiceTracks from "../practiceTracks.js";
import type * as practiceUserSkills from "../practiceUserSkills.js";
import type * as practiceZoneProgress from "../practiceZoneProgress.js";
import type * as projects from "../projects.js";
import type * as promptScoring from "../promptScoring.js";
import type * as quests from "../quests.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
import type * as resetTrack1 from "../resetTrack1.js";
import type * as seed from "../seed.js";
import type * as seedAssessment from "../seedAssessment.js";
import type * as seedCommunity from "../seedCommunity.js";
import type * as seedPhase3 from "../seedPhase3.js";
import type * as seedStarterDomain from "../seedStarterDomain.js";
import type * as sharing from "../sharing.js";
import type * as skillTags from "../skillTags.js";
import type * as spacedRepetition from "../spacedRepetition.js";
import type * as userProgress from "../userProgress.js";
import type * as userStatsUtils from "../userStatsUtils.js";
import type * as users from "../users.js";
import type * as vibeProjects from "../vibeProjects.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adaptiveEngine: typeof adaptiveEngine;
  admin: typeof admin;
  aiEvaluation: typeof aiEvaluation;
  aiMatching: typeof aiMatching;
  aiService: typeof aiService;
  analytics: typeof analytics;
  assessmentGrading: typeof assessmentGrading;
  assessmentQuestions: typeof assessmentQuestions;
  assessments: typeof assessments;
  auth: typeof auth;
  "careerCoach/db": typeof careerCoach_db;
  "careerCoach/index": typeof careerCoach_index;
  certificates: typeof certificates;
  contentModeration: typeof contentModeration;
  creatorStudio: typeof creatorStudio;
  customDomains: typeof customDomains;
  customGPTs: typeof customGPTs;
  dailyDrills: typeof dailyDrills;
  debug: typeof debug;
  debugAllSlugs: typeof debugAllSlugs;
  debugSlug: typeof debugSlug;
  digitalThumbprint: typeof digitalThumbprint;
  domainAssessments: typeof domainAssessments;
  duels: typeof duels;
  errors: typeof errors;
  feedback: typeof feedback;
  fixSlug: typeof fixSlug;
  fixUserProgress: typeof fixUserProgress;
  helpers: typeof helpers;
  http: typeof http;
  itemTemplates: typeof itemTemplates;
  leaderboard: typeof leaderboard;
  "lib/ai": typeof lib_ai;
  messages: typeof messages;
  migrateToNewTracks: typeof migrateToNewTracks;
  migrations: typeof migrations;
  "migrations/backfillDuelMembers": typeof migrations_backfillDuelMembers;
  "migrations/cleanOldDuels": typeof migrations_cleanOldDuels;
  moderation: typeof moderation;
  normalizeEmail: typeof normalizeEmail;
  "otp/ResendOTP": typeof otp_ResendOTP;
  "otp/TwilioOTP": typeof otp_TwilioOTP;
  "otp/TwilioSDK": typeof otp_TwilioSDK;
  "otp/TwilioVerify": typeof otp_TwilioVerify;
  "otp/VerificationCodeEmail": typeof otp_VerificationCodeEmail;
  "passwordReset/PasswordResetEmail": typeof passwordReset_PasswordResetEmail;
  "passwordReset/ResendOTPPasswordReset": typeof passwordReset_ResendOTPPasswordReset;
  pathways: typeof pathways;
  placementTest: typeof placementTest;
  posts: typeof posts;
  practiceDomains: typeof practiceDomains;
  practiceProjects: typeof practiceProjects;
  practiceTracks: typeof practiceTracks;
  practiceUserSkills: typeof practiceUserSkills;
  practiceZoneProgress: typeof practiceZoneProgress;
  projects: typeof projects;
  promptScoring: typeof promptScoring;
  quests: typeof quests;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
  resetTrack1: typeof resetTrack1;
  seed: typeof seed;
  seedAssessment: typeof seedAssessment;
  seedCommunity: typeof seedCommunity;
  seedPhase3: typeof seedPhase3;
  seedStarterDomain: typeof seedStarterDomain;
  sharing: typeof sharing;
  skillTags: typeof skillTags;
  spacedRepetition: typeof spacedRepetition;
  userProgress: typeof userProgress;
  userStatsUtils: typeof userStatsUtils;
  users: typeof users;
  vibeProjects: typeof vibeProjects;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
