const required = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "APP_URL",
  "APP_ENCRYPTION_KEY"
];

const optional = [
  "RESEND_API_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "MERCADOPAGO_ACCESS_TOKEN",
  "WHATSAPP_TOKEN"
];

const missing = required.filter((key) => !process.env[key] || process.env[key]?.includes("replace-with"));

if (missing.length > 0) {
  console.error("Faltan variables obligatorias para producción:");
  for (const key of missing) console.error(`- ${key}`);
  console.error("\nPodés lanzar en modo local para probar, pero online necesitás Postgres real porque el JSON local no persiste en serverless.");
  process.exit(1);
}

console.log("Variables obligatorias listas para producción.");
console.log("Opcionales configuradas:");
for (const key of optional) {
  console.log(`- ${key}: ${process.env[key] ? "sí" : "no, usará modo demo/fallback"}`);
}
