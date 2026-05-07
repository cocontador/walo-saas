import { http, HttpResponse } from 'msw'

export const handlers = [
  // Login: éxito por defecto, 401 para credenciales inválidas.
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    const isInvalidCredentials =
      body.email === 'invalid@walo.com' || body.password === 'wrong-password'

    if (isInvalidCredentials) {
      return HttpResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    return HttpResponse.json(
      {
        message: 'Login exitoso',
        user: { id: 'user_test_1', email: body.email ?? 'test@walo.com' },
      },
      { status: 200 }
    )
  }),

  // Register: éxito por defecto, 400 para payload inválido/duplicado.
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
      storeName?: string
    }

    const hasMissingFields =
      !body.name || !body.email || !body.password || !body.storeName
    const isDuplicateEmail = body.email === 'existing@walo.com'

    if (hasMissingFields || isDuplicateEmail) {
      return HttpResponse.json(
        { error: 'Datos de registro inválidos' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      {
        message: 'Registro exitoso',
        user: { id: 'user_new_1', email: body.email, name: body.name },
      },
      { status: 201 }
    )
  }),
]
