import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, cookies }) => {
  const token = cookies.get('jwt')?.value;
  if (!token) return new Response('Unauthorized', { status: 401 });

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';
  const res = await fetch(`${backendUrl}/collection/stickers/${params.id}/remove`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
};