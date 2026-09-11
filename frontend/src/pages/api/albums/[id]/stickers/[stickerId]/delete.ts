import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, cookies, redirect }) => {
  const token = cookies.get('jwt')?.value;
  if (!token) return redirect('/login');

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';

  await fetch(`${backendUrl}/albums/${params.id}/stickers/${params.stickerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return redirect(`/my-albums/${params.id}`);
};