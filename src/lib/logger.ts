type LogLevel = "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  [key: string]: unknown;
}

const LEVEL_ORDER: Record<LogLevel, number> = { error: 0, warn: 1, info: 2 };

function getMinLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel === "error" || envLevel === "warn" || envLevel === "info") {
    return envLevel;
  }

  return "info";
}

function shouldLog(level: LogLevel): boolean {
  const min = getMinLevel();
  return LEVEL_ORDER[level] <= LEVEL_ORDER[min];
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (message: string, context?: LogContext) =>
    log("info", message, context),
  warn: (message: string, context?: LogContext) =>
    log("warn", message, context),
  error: (message: string, context?: LogContext) =>
    log("error", message, context),
};
