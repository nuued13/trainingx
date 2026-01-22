import { INVALID_PASSWORD } from "./errors.js";
// import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import Apple from "@auth/core/providers/apple";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./otp/ResendOTP.js";
import { TwilioOTP } from "./otp/TwilioOTP.js";
import { TwilioVerify } from "./otp/TwilioVerify.js";
import { ResendOTPPasswordReset } from "./passwordReset/ResendOTPPasswordReset.js";
import { DataModel } from "./_generated/dataModel.js";
import { normalizeEmail } from "./normalizeEmail.js";

const profileWithOptionalName = (params: Record<string, unknown>) => {
  const name = (params.name as string | undefined)?.trim();
  const ageParam = params.age;
  const ageValue =
    typeof ageParam === "number"
      ? ageParam
      : typeof ageParam === "string"
      ? Number.parseInt(ageParam.trim(), 10)
      : undefined;
  const age =
    typeof ageValue === "number" && Number.isFinite(ageValue) && ageValue > 0
      ? ageValue
      : undefined;
  return {
    email: normalizeEmail(params.email as string),
    ...(name ? { name } : {}),
    ...(age !== undefined ? { age } : {}),
  };
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // GitHub,
    Google({
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile) {
        const id =
          typeof profile.sub === "string"
            ? profile.sub
            : typeof profile.id === "string"
              ? profile.id
              : null;
        if (!id) {
          throw new Error("Google profile is missing an id");
        }
        const email =
          typeof profile.email === "string"
            ? normalizeEmail(profile.email)
            : undefined;
        const legacyVerified =
          (profile as { verified_email?: boolean }).verified_email === true;
        const emailVerified =
          profile.email_verified === true || legacyVerified === true;
        return {
          id,
          email,
          emailVerified,
          name: profile.name,
          image: profile.picture,
        };
      },
    }),
    Apple({
      clientSecret: process.env.AUTH_APPLE_SECRET!,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      profile: undefined,
    }),
    Resend({
      from: process.env.AUTH_EMAIL ?? "My App <onboarding@resend.dev>",
      normalizeIdentifier: normalizeEmail,
    }),
    ResendOTP,
    TwilioVerify,
    TwilioOTP,
    Password<DataModel>({
      profile: profileWithOptionalName,
    }),
    // Sample password auth with a custom parameter provided during sign-up
    // flow and custom password validation requirements (at least six chars
    // with at least one number, upper and lower case chars).
    Password<DataModel>({
      id: "password-custom",
      profile(params, _ctx) {
        const name = (params.name as string | undefined)?.trim();
        const favoriteColor = params.favoriteColor as string | undefined;
        return {
          email: normalizeEmail(params.email as string),
          ...(name ? { name } : {}),
          ...(favoriteColor ? { favoriteColor } : {}),
        };
      },
      validatePasswordRequirements: (password: string) => {
        if (
          !password ||
          password.length < 6 ||
          !/\d/.test(password) ||
          !/[a-z]/.test(password) ||
          !/[A-Z]/.test(password)
        ) {
          throw new ConvexError(INVALID_PASSWORD);
        }
      },
    }),
    Password<DataModel>({
      id: "password-with-reset",
      reset: ResendOTPPasswordReset,
      profile: profileWithOptionalName,
    }),
    Password<DataModel>({
      id: "password-code",
      reset: ResendOTPPasswordReset,
      verify: ResendOTP,
      profile: profileWithOptionalName,
    }),
    // This one only makes sense with routing, ignore for now:
    Password<DataModel>({
      id: "password-link",
      verify: Resend,
      profile: profileWithOptionalName,
    }),
    Anonymous,
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, type, provider }) {
      const isOAuth =
        type === "oauth" || provider.type === "oauth" || provider.type === "oidc";
      if (existingUserId === null && isOAuth) {
        await ctx.db.patch(userId, { needsProfileCompletion: true });
      }
    },
  },
});
