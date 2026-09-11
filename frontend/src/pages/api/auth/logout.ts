import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ cookies, redirect }) => {
  cookies.delete('jwt', { path: '/' });
  return redirect('/login');
};