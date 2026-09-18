/**
 * Utility to process, compress, remove backgrounds, and convert images to Base64
 * for efficient Firestore storage and crisp display on ID cards, tables, and profiles.
 */

export interface ProcessImageOptions {
  maxDimension?: number;
  quality?: number;
  mode?: 'original' | 'remove-bg' | 'studio-white';
  bgTolerance?: number; // 0 to 100
}

/**
 * Loads an image from a File or Data URL into an HTMLImageElement.
 */
export function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Removes background using edge-sampling and color-distance keying with feathering.
 */
function applyBackgroundRemoval(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: 'remove-bg' | 'studio-white',
  tolerance = 32
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample perimeter colors to estimate background
  const samplePoints: [number, number][] = [
    [2, 2],
    [width - 3, 2],
    [2, Math.min(20, height - 1)],
    [width - 3, Math.min(20, height - 1)],
    [Math.floor(width / 2), 2],
    [2, Math.floor(height / 2)],
    [width - 3, Math.floor(height / 2)],
  ];

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let validPoints = 0;

  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * 4;
    sumR += data[idx];
    sumG += data[idx + 1];
    sumB += data[idx + 2];
    validPoints++;
  }

  const bgR = Math.round(sumR / validPoints);
  const bgG = Math.round(sumG / validPoints);
  const bgB = Math.round(sumB / validPoints);

  const tolSq = tolerance * tolerance * 3;
  const softRange = tolSq * 1.5;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq < tolSq) {
      if (mode === 'remove-bg') {
        data[i + 3] = 0; // fully transparent
      } else {
        // studio white
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    } else if (distSq < softRange && mode === 'remove-bg') {
      // Soft feather edge
      const alphaFactor = (distSq - tolSq) / (softRange - tolSq);
      data[i + 3] = Math.round(data[i + 3] * alphaFactor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Compresses an image, optionally cleans or removes the background, and returns an optimized Base64 string.
 */
export async function processStudentImage(
  source: File | string,
  options: ProcessImageOptions = {}
): Promise<{ base64: string; sizeKb: number; width: number; height: number }> {
  const {
    maxDimension = 720,
    quality = 0.85,
    mode = 'original',
    bgTolerance = 36,
  } = options;

  const img = await loadImage(source);

  // Compute scaled dimensions preserving aspect ratio
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  const ratio = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
  const targetWidth = Math.max(1, Math.round(originalWidth * ratio));
  const targetHeight = Math.max(1, Math.round(originalHeight * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  if (mode === 'remove-bg' || mode === 'studio-white') {
    applyBackgroundRemoval(ctx, targetWidth, targetHeight, mode, bgTolerance);
  }

  // Choose format: PNG for transparency, JPEG for compressed opaque portraits
  const mimeType = mode === 'remove-bg' ? 'image/png' : 'image/jpeg';
  const base64 = canvas.toDataURL(mimeType, quality);

  // Approximate Base64 size in KB
  const sizeKb = Math.round((base64.length * (3 / 4)) / 1024);

  return {
    base64,
    sizeKb,
    width: targetWidth,
    height: targetHeight,
  };
}
