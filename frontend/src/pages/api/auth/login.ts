import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';

  const res = await fetch(`${backendUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return redirect('/login?error=invalid_credentials');
  }

  const data = await res.json();

  cookies.set('jwt', data.access_token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect('/');
};