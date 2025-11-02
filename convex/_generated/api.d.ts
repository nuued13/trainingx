/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiMatching from "../aiMatching.js";
import type * as assessments from "../assessments.js";
import type * as auth from "../auth.js";
import type * as customGPTs from "../customGPTs.js";
import type * as errors from "../errors.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as leaderboard from "../leaderboard.js";
import type * as messages from "../messages.js";
import type * as otp_ResendOTP from "../otp/ResendOTP.js";
import type * as otp_TwilioOTP from "../otp/TwilioOTP.js";
import type * as otp_TwilioSDK from "../otp/TwilioSDK.js";
import type * as otp_TwilioVerify from "../otp/TwilioVerify.js";
import type * as otp_VerificationCodeEmail from "../otp/VerificationCodeEmail.js";
import type * as passwordReset_PasswordResetEmail from "../passwordReset/PasswordResetEmail.js";
import type * as passwordReset_ResendOTPPasswordReset from "../passwordReset/ResendOTPPasswordReset.js";
import type * as posts from "../posts.js";
import type * as practiceProjects from "../practiceProjects.js";
import type * as projects from "../projects.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
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
  aiMatching: typeof aiMatching;
  assessments: typeof assessments;
  auth: typeof auth;
  customGPTs: typeof customGPTs;
  errors: typeof errors;
  helpers: typeof helpers;
  http: typeof http;
  leaderboard: typeof leaderboard;
  messages: typeof messages;
  "otp/ResendOTP": typeof otp_ResendOTP;
  "otp/TwilioOTP": typeof otp_TwilioOTP;
  "otp/TwilioSDK": typeof otp_TwilioSDK;
  "otp/TwilioVerify": typeof otp_TwilioVerify;
  "otp/VerificationCodeEmail": typeof otp_VerificationCodeEmail;
  "passwordReset/PasswordResetEmail": typeof passwordReset_PasswordResetEmail;
  "passwordReset/ResendOTPPasswordReset": typeof passwordReset_ResendOTPPasswordReset;
  posts: typeof posts;
  practiceProjects: typeof practiceProjects;
  projects: typeof projects;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
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
