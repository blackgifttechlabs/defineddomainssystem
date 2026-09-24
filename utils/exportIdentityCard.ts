import { toCanvas } from 'html-to-image';

/** Render text with the browser's layout engine, including its actual font baselines. */
export async function exportIdentityCard(element: HTMLElement): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  await Promise.all(Array.from(element.querySelectorAll('img')).map(image => image.decode().catch(() => undefined)));
  return toCanvas(element, {
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    width: element.offsetWidth,
    height: element.offsetHeight,
    // Export the unscaled static face, independent of the preview's position or animation.
    style: { transform: 'none', margin: '0', boxShadow: 'none' },
    preferredFontFormat: 'woff2',
  });
}
