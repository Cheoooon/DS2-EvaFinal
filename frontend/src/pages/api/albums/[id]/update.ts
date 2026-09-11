import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const token = cookies.get('jwt')?.value;
  if (!token) return redirect('/login');

  const incomingFormData = await request.formData();
  const outgoingFormData = new FormData();

  outgoingFormData.append('name', incomingFormData.get('name') as string);
  outgoingFormData.append('description', incomingFormData.get('description') as string);
  outgoingFormData.append('is_shared', incomingFormData.get('is_shared') === 'on' ? 'true' : 'false');

  const coverFile = incomingFormData.get('cover') as File;
  if (coverFile && coverFile.size > 0 && coverFile.name) {
    outgoingFormData.append('cover', coverFile);
  }

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';

  await fetch(`${backendUrl}/albums/${params.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: outgoingFormData,
  });

  return redirect(`/my-albums/${params.id}`);
};