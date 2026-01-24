export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_CONVEX_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file.`
    );
  }

  if (process.env.NODE_ENV === 'production') {
    const productionRequired = ['OPENAI_API_KEY'];
    const missingProd = productionRequired.filter(key => !process.env[key]);
    
    if (missingProd.length > 0) {
      console.warn(`Missing production environment variables: ${missingProd.join(', ')}`);
    }
  }
}
