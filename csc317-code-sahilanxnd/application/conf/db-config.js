const fs = require("fs");

function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }
  return value.trim();
}

function isTiDB() {
  const host = env("DB_HOST", "");
  return (
    host.includes("tidbcloud.com") ||
    env("TIDB_ENABLE_SSL", "") === "true"
  );
}

function getSslConfig() {
  if (env("DB_SSL", "true") === "false") {
    return undefined;
  }

  if (isTiDB()) {
    const ssl = {
      minVersion: "TLSv1.2",
      rejectUnauthorized: env("DB_SSL_REJECT_UNAUTHORIZED", "true") !== "false",
    };
    const caPath = env("DB_CA_PATH", "");
    if (caPath) {
      ssl.ca = fs.readFileSync(caPath);
    }
    return ssl;
  }

  return { rejectUnauthorized: false };
}

function getDbConfig(overrides = {}) {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  return {
    host: env("DB_HOST"),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
    database: env("DB_NAME"),
    port: Number(env("DB_PORT", isTiDB() ? "4000" : "3306")),
    ssl: getSslConfig(),
    waitForConnections: true,
    connectTimeout: 15000,
    connectionLimit: isServerless ? 5 : 20,
    enableKeepAlive: true,
    ...overrides,
  };
}

module.exports = {
  env,
  isTiDB,
  getSslConfig,
  getDbConfig,
};
