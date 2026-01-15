import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Img,
} from "@react-email/components";

export function PasswordResetEmail({
  code,
  expires,
}: {
  code: string;
  expires: Date;
}) {
  const expirationMinutes = Math.floor((+expires - Date.now()) / (60 * 1000));

  return (
    <Html>
      <Head />
      <Preview>Your TrainingX.AI password reset code: {code}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[560px] bg-white shadow-sm">
            <Section className="mt-[32px] text-center">
              <Img
                src="https://trainingx.ai/logo.webp"
                width="80"
                height="80"
                alt="TrainingX.AI"
                className="mx-auto rounded-xl shadow-sm"
              />
              <Heading className="text-black text-[28px] font-bold text-center p-0 mt-[20px] mb-[30px] mx-0">
                TrainingX.AI
              </Heading>
            </Section>

            <Heading className="text-black text-[20px] font-semibold text-center p-0 mb-[24px] mx-0">
              Reset your password
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Hello,
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              We received a request to reset your password for your{" "}
              <strong>TrainingX.AI</strong> account. Use the code below to set a
              new password.
            </Text>

            <Section className="bg-slate-100 rounded-lg p-[24px] my-[32px] text-center border-dashed border-2 border-slate-200">
              <Text className="text-slate-500 text-[12px] uppercase tracking-widest font-semibold mb-[8px] mt-0">
                Reset Code
              </Text>
              <Text className="text-black text-[42px] font-bold tracking-[10px] m-0 leading-none">
                {code}
              </Text>
            </Section>

            <Text className="text-slate-500 text-[13px] text-center mb-[32px]">
              This code expires in <strong>{expirationMinutes} minutes</strong>.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              If you didn't request a password reset, you can safely ignore this
              email. Your password will not change until you use this code.
            </Text>

            <Text className="text-black text-[14px] leading-[24px] mt-[32px]">
              Best regards,
              <br />
              <strong>The TrainingX.AI Team</strong>
            </Text>

            <Section className="mt-[40px] border-t border-solid border-[#eaeaea] pt-[20px]">
              <Text className="text-[#666] text-[12px] leading-[20px] text-center m-0">
                &copy; {new Date().getFullYear()} TrainingX.AI. All rights
                reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
