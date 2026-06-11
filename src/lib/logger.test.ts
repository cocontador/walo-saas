import { afterEach, describe, expect, it, vi } from "vitest"

import { logError, logInfo, logWarn, sanitizeMeta } from "./logger"

vi.mock("server-only", () => ({}))

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("emite logs info con estructura estable", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined)

    logInfo({
      event: "public_catalog.render_ok",
      scope: "store",
      message: "Catalogo publico renderizado",
      storeId: "store_1",
      slug: "mi-tienda",
      meta: { visibleProducts: 3 },
    })

    expect(infoSpy).toHaveBeenCalledOnce()

    const payload = JSON.parse(infoSpy.mock.calls[0][0])

    expect(payload).toMatchObject({
      level: "info",
      event: "public_catalog.render_ok",
      scope: "store",
      message: "Catalogo publico renderizado",
      storeId: "store_1",
      slug: "mi-tienda",
      meta: { visibleProducts: 3 },
    })
    expect(typeof payload.timestamp).toBe("string")
  })

  it("emite warnings y errores en el canal correcto", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)

    logWarn({
      event: "authz.membership.denied",
      scope: "store",
      message: "Usuario sin membresia",
      storeId: "store_1",
    })

    logError({
      event: "store_logo.upload.failed",
      scope: "media",
      message: "Fallo upload logo",
      storeId: "store_1",
      errorCode: "R2_UPLOAD_FAILED",
    })

    expect(warnSpy).toHaveBeenCalledOnce()
    expect(errorSpy).toHaveBeenCalledOnce()
    expect(JSON.parse(warnSpy.mock.calls[0][0]).level).toBe("warn")
    expect(JSON.parse(errorSpy.mock.calls[0][0]).level).toBe("error")
  })

  it("sanitiza metadata sensible y payloads binarios", () => {
    const sanitized = sanitizeMeta({
      password: "123456",
      authToken: "token-real",
      cookie: "session=value",
      DATABASE_URL: "postgres://user:pass@localhost/db",
      nested: {
        R2_SECRET_ACCESS_KEY: "secret-real",
        safeValue: "visible",
      },
      body: new Uint8Array([1, 2, 3]),
    })

    expect(sanitized).toEqual({
      password: "[redacted]",
      authToken: "[redacted]",
      cookie: "[redacted]",
      DATABASE_URL: "[redacted]",
      nested: {
        R2_SECRET_ACCESS_KEY: "[redacted]",
        safeValue: "visible",
      },
      body: "[redacted:binary]",
    })
  })
})
