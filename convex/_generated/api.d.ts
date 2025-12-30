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
import type * as assessments from "../assessments.js";
import type * as auth from "../auth.js";
import type * as careerCoach_db from "../careerCoach/db.js";
import type * as careerCoach_index from "../careerCoach/index.js";
import type * as careerCoach_opportunities from "../careerCoach/opportunities.js";
import type * as careerCoach_roadmap from "../careerCoach/roadmap.js";
import type * as careerCoach_schemas from "../careerCoach/schemas.js";
import type * as certificates from "../certificates.js";
import type * as creatorStudio from "../creatorStudio.js";
import type * as customGPTs from "../customGPTs.js";
import type * as dailyDrills from "../dailyDrills.js";
import type * as debug from "../debug.js";
import type * as domainAssessments from "../domainAssessments.js";
import type * as duels from "../duels.js";
import type * as errors from "../errors.js";
import type * as feedback from "../feedback.js";
import type * as fixChallengeCounts from "../fixChallengeCounts.js";
import type * as fixUserProgress from "../fixUserProgress.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as itemTemplates from "../itemTemplates.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lib_ai from "../lib/ai.js";
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
import type * as practiceDomains from "../practiceDomains.js";
import type * as practiceItems from "../practiceItems.js";
import type * as practiceLevels from "../practiceLevels.js";
import type * as practiceProjects from "../practiceProjects.js";
import type * as practiceTracks from "../practiceTracks.js";
import type * as practiceUserSkills from "../practiceUserSkills.js";
import type * as projects from "../projects.js";
import type * as pruneItems from "../pruneItems.js";
import type * as quests from "../quests.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
import type * as seedAssessment from "../seedAssessment.js";
import type * as seedCommunity from "../seedCommunity.js";
import type * as seedLevel1Items from "../seedLevel1Items.js";
import type * as seedPhase3 from "../seedPhase3.js";
import type * as seedStarterDomain from "../seedStarterDomain.js";
import type * as seedTrack2Items from "../seedTrack2Items.js";
import type * as seedTrack3Items from "../seedTrack3Items.js";
import type * as seedTrack4Items from "../seedTrack4Items.js";
import type * as seedTrack5Items from "../seedTrack5Items.js";
import type * as seedTrack6Items from "../seedTrack6Items.js";
import type * as seedTrack7Items from "../seedTrack7Items.js";
import type * as seedTrack8Items from "../seedTrack8Items.js";
import type * as sharing from "../sharing.js";
import type * as spacedRepetition from "../spacedRepetition.js";
import type * as userProgress from "../userProgress.js";
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
  admin: typeof admin;
  aiEvaluation: typeof aiEvaluation;
  aiMatching: typeof aiMatching;
  aiService: typeof aiService;
  analytics: typeof analytics;
  assessmentGrading: typeof assessmentGrading;
  assessments: typeof assessments;
  auth: typeof auth;
  "careerCoach/db": typeof careerCoach_db;
  "careerCoach/index": typeof careerCoach_index;
  "careerCoach/opportunities": typeof careerCoach_opportunities;
  "careerCoach/roadmap": typeof careerCoach_roadmap;
  "careerCoach/schemas": typeof careerCoach_schemas;
  certificates: typeof certificates;
  creatorStudio: typeof creatorStudio;
  customGPTs: typeof customGPTs;
  dailyDrills: typeof dailyDrills;
  debug: typeof debug;
  domainAssessments: typeof domainAssessments;
  duels: typeof duels;
  errors: typeof errors;
  feedback: typeof feedback;
  fixChallengeCounts: typeof fixChallengeCounts;
  fixUserProgress: typeof fixUserProgress;
  helpers: typeof helpers;
  http: typeof http;
  itemTemplates: typeof itemTemplates;
  leaderboard: typeof leaderboard;
  "lib/ai": typeof lib_ai;
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
  practiceDomains: typeof practiceDomains;
  practiceItems: typeof practiceItems;
  practiceLevels: typeof practiceLevels;
  practiceProjects: typeof practiceProjects;
  practiceTracks: typeof practiceTracks;
  practiceUserSkills: typeof practiceUserSkills;
  projects: typeof projects;
  pruneItems: typeof pruneItems;
  quests: typeof quests;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
  seedAssessment: typeof seedAssessment;
  seedCommunity: typeof seedCommunity;
  seedLevel1Items: typeof seedLevel1Items;
  seedPhase3: typeof seedPhase3;
  seedStarterDomain: typeof seedStarterDomain;
  seedTrack2Items: typeof seedTrack2Items;
  seedTrack3Items: typeof seedTrack3Items;
  seedTrack4Items: typeof seedTrack4Items;
  seedTrack5Items: typeof seedTrack5Items;
  seedTrack6Items: typeof seedTrack6Items;
  seedTrack7Items: typeof seedTrack7Items;
  seedTrack8Items: typeof seedTrack8Items;
  sharing: typeof sharing;
  spacedRepetition: typeof spacedRepetition;
  userProgress: typeof userProgress;
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
