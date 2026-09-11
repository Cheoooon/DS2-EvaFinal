import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const albumId = params.id;
  const token = cookies.get('jwt')?.value;

  if (!token) return redirect('/login');
  if (!albumId) return redirect('/my-albums');

  const incomingFormData = await request.formData();
  const outgoingFormData = new FormData();
  const stickers: Array<{ number: number; name: string; sticker_type: string }> = [];

  let index = 0;

  while (incomingFormData.has(`number_${index}`)) {
    const rawNumber = incomingFormData.get(`number_${index}`);
    const name = incomingFormData.get(`name_${index}`);
    const sticker_type = incomingFormData.get(`type_${index}`);

    if (rawNumber && name) {
      stickers.push({
        number: parseInt(rawNumber as string, 10),
        name: name as string,
        sticker_type: (sticker_type as string) || 'normal',
      });

      const imageFile = incomingFormData.get(`image_${index}`) as File;
      if (imageFile && imageFile.size > 0 && imageFile.name) {
        outgoingFormData.append(`image_${index}`, imageFile);
      }
    }

    index++;
  }

  if (stickers.length === 0) {
    return redirect(`/my-albums/${albumId}/stickers/new?error=empty_data`);
  }

  outgoingFormData.append('stickers', JSON.stringify(stickers));

  const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${backendUrl}/albums/${albumId}/stickers/bulk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: outgoingFormData,
    });

    if (!res.ok) {
      return redirect(`/my-albums/${albumId}/stickers/new?error=backend`);
    }

    return redirect(`/my-albums/${albumId}`);
  } catch {
    return redirect(`/my-albums/${albumId}/stickers/new?error=server_error`);
  }
};