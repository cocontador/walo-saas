import "server-only"

type LogLevel = "info" | "warn" | "error"

type LogMeta = Record<string, unknown>

type LogPayload = {
  level: LogLevel
  event: string
  scope: string
  message: string
  timestamp: string
  storeId?: string
  slug?: string
  userId?: string
  errorCode?: string
  meta?: LogMeta
}

type LogInput = {
  event: string
  scope: string
  message: string
  storeId?: string
  slug?: string
  userId?: string
  errorCode?: string
  meta?: LogMeta
}

const SENSITIVE_KEY_PATTERNS = [
  "password",
  "secret",
  "token",
  "cookie",
  "authorization",
  "database_url",
  "nextauth_secret",
  "r2_secret_access_key",
  "r2_access_key_id",
]

function isSensitiveKey(key: string): boolean {
  const normalizedKey = key.toLowerCase()

  return SENSITIVE_KEY_PATTERNS.some((pattern) => normalizedKey.includes(pattern))
}

function sanitizeValue(value: unknown): unknown {
  if (value instanceof Uint8Array || value instanceof ArrayBuffer || value instanceof File) {
    return "[redacted:binary]"
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (value && typeof value === "object") {
    return sanitizeMeta(value as LogMeta)
  }

  return value
}

export function sanitizeMeta(meta: LogMeta = {}): LogMeta {
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [
      key,
      isSensitiveKey(key) ? "[redacted]" : sanitizeValue(value),
    ])
  )
}

function createPayload(level: LogLevel, input: LogInput): LogPayload {
  return {
    level,
    event: input.event,
    scope: input.scope,
    message: input.message,
    timestamp: new Date().toISOString(),
    ...(input.storeId ? { storeId: input.storeId } : {}),
    ...(input.slug ? { slug: input.slug } : {}),
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.errorCode ? { errorCode: input.errorCode } : {}),
    ...(input.meta ? { meta: sanitizeMeta(input.meta) } : {}),
  }
}

function writeLog(level: LogLevel, input: LogInput): void {
  const payload = createPayload(level, input)
  const serializedPayload = JSON.stringify(payload)

  if (level === "error") {
    console.error(serializedPayload)
    return
  }

  if (level === "warn") {
    console.warn(serializedPayload)
    return
  }

  console.info(serializedPayload)
}

export function logInfo(input: LogInput): void {
  writeLog("info", input)
}

export function logWarn(input: LogInput): void {
  writeLog("warn", input)
}

export function logError(input: LogInput): void {
  writeLog("error", input)
}
