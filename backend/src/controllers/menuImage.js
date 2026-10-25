
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'menu-images';
const MAX_SIZE = 500 * 1024;

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

function getStorageClient() {
  if (!supabaseUrl || !secretKey) {
    throw new Error(
      'Missing SUPABASE_URL or Supabase server secret key'
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function detectImageType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { mime: 'image/jpeg', extension: 'jpg' };
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) {
    return { mime: 'image/png', extension: 'png' };
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mime: 'image/webp', extension: 'webp' };
  }

  return null;
}

export async function uploadMenuImage(req, res) {
  try {
    const restaurantId = Number(req.user?.restaurant_id);

    if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Restaurant access is not available.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image.',
      });
    }

    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'Image must be 500 KB or smaller.',
      });
    }

    const imageType = detectImageType(req.file.buffer);

    if (
      !imageType ||
      imageType.mime !== req.file.mimetype
    ) {
      return res.status(400).json({
        success: false,
        message: 'Only valid JPG, PNG, or WebP images are supported.',
      });
    }

    const filename =
      `${restaurantId}/${randomUUID()}.${imageType.extension}`;

    const supabase = getStorageClient();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, req.file.buffer, {
        contentType: imageType.mime,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase image upload failed:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to upload image.',
      });
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        image_url: data.publicUrl,
      },
    });
  } catch (error) {
    console.error('Menu image upload error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to upload image.',
    });
  }
}
