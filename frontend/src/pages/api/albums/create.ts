import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const token = cookies.get('jwt')?.value;
  if (!token) return redirect('/login');

  const formData = await request.formData();
  const name = formData.get('name');
  const description = formData.get('description');
  const is_shared = formData.get('is_shared') === 'on';

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';

  await fetch(`${backendUrl}/albums`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description, is_shared }),
  });

  return redirect('/');
};