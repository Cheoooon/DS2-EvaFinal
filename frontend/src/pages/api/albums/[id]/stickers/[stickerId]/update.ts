import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const token = cookies.get('jwt')?.value;
  if (!token) return redirect('/login');

  const incomingFormData = await request.formData();
  const outgoingFormData = new FormData();

  outgoingFormData.append('number', incomingFormData.get('number') as string);
  outgoingFormData.append('name', incomingFormData.get('name') as string);
  outgoingFormData.append('sticker_type', incomingFormData.get('sticker_type') as string);

  const imageFile = incomingFormData.get('image') as File;
  if (imageFile && imageFile.size > 0 && imageFile.name) {
    outgoingFormData.append('image', imageFile);
  }

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';

  await fetch(`${backendUrl}/albums/${params.id}/stickers/${params.stickerId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: outgoingFormData,
  });

  return redirect(`/my-albums/${params.id}`);
};