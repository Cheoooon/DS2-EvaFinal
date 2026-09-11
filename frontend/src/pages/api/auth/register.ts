import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';

  const res = await fetch(`${backendUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return redirect('/register?error=true');
  }

  const data = await res.json();

  cookies.set('jwt', data.access_token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  return redirect('/');
};