import React, { useEffect, useRef, useState } from 'react';
import { Check, Move, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { loadImage } from '../../utils/imageProcessor';

type Crop = { x: number; y: number; width: number; height: number };
type Handle = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const aspectPresets = [
  { label: 'Square', value: 1 },
  { label: 'Portrait', value: 4 / 5 },
  { label: 'Landscape', value: 4 / 3 },
  { label: 'Free', value: null },
];

const outputSizes = [256, 512, 1024];

export const ImageCropEditor: React.FC<{
  source: string;
  onCancel: () => void;
  onApply: (image: string) => void;
}> = ({ source, onCancel, onApply }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<Crop>({ x: 15, y: 10, width: 70, height: 80 });
  const [aspect, setAspect] = useState<number | null>(1);
  const [outputSize, setOutputSize] = useState(512);
  const dragRef = useRef<{ handle: Handle; startX: number; startY: number; crop: Crop } | null>(null);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      const stage = stageRef.current;
      if (!drag || !stage) return;
      const dx = ((event.clientX - drag.startX) / stage.clientWidth) * 100;
      const dy = ((event.clientY - drag.startY) / stage.clientHeight) * 100;
      const min = 8;
      let next = { ...drag.crop };
      if (drag.handle === 'move') {
        next.x = Math.max(0, Math.min(100 - next.width, drag.crop.x + dx));
        next.y = Math.max(0, Math.min(100 - next.height, drag.crop.y + dy));
      } else {
        if (drag.handle.includes('e')) next.width = Math.max(min, Math.min(100 - next.x, drag.crop.width + dx));
        if (drag.handle.includes('s')) next.height = Math.max(min, Math.min(100 - next.y, drag.crop.height + dy));
        if (drag.handle.includes('w')) {
          const x = Math.max(0, Math.min(drag.crop.x + drag.crop.width - min, drag.crop.x + dx));
          next.width = drag.crop.width + drag.crop.x - x;
          next.x = x;
        }
        if (drag.handle.includes('n')) {
          const y = Math.max(0, Math.min(drag.crop.y + drag.crop.height - min, drag.crop.y + dy));
          next.height = drag.crop.height + drag.crop.y - y;
          next.y = y;
        }
      }
      setCrop(next);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const startDrag = (handle: Handle) => (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { handle, startX: event.clientX, startY: event.clientY, crop: { ...crop } };
  };

  const applyAspect = (value: number | null) => {
    setAspect(value);
    if (!value || !stageRef.current) return;
    const stageRatio = stageRef.current.clientWidth / stageRef.current.clientHeight;
    let width = 70;
    let height = (width * stageRatio) / value;
    if (height > 80) {
      height = 80;
      width = (height * value) / stageRatio;
    }
    setCrop({ x: (100 - width) / 2, y: (100 - height) / 2, width, height });
  };

  const exportCrop = async () => {
    const image = await loadImage(source);
    const canvas = document.createElement('canvas');
    const ratio = crop.width / crop.height;
    canvas.width = outputSize;
    canvas.height = Math.max(1, Math.round(outputSize / ratio));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(
      image,
      image.naturalWidth * crop.x / 100,
      image.naturalHeight * crop.y / 100,
      image.naturalWidth * crop.width / 100,
      image.naturalHeight * crop.height / 100,
      0,
      0,
      canvas.width,
      canvas.height
    );
    onApply(canvas.toDataURL('image/jpeg', 0.88));
  };

  const handles: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  const handlePosition: Record<string, string> = {
    nw: '-left-2 -top-2 cursor-nwse-resize', n: 'left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize', ne: '-right-2 -top-2 cursor-nesw-resize',
    e: '-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize', se: '-bottom-2 -right-2 cursor-nwse-resize', s: 'bottom-[-8px] left-1/2 -translate-x-1/2 cursor-ns-resize',
    sw: '-bottom-2 -left-2 cursor-nesw-resize', w: '-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize',
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex flex-col bg-slate-950 text-white">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div><h2 className="text-sm font-semibold">Crop staff photo</h2><p className="mt-0.5 text-xs text-slate-400">Move the frame or drag any anchor.</p></div>
        <button type="button" onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"><X size={17} /></button>
      </header>
      <main className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black p-4 sm:p-8">
          <div ref={stageRef} className="relative max-h-full max-w-4xl select-none overflow-hidden">
            <img src={source} alt="Crop source" draggable={false} className="block max-h-[68vh] max-w-full object-contain" />
            <div className="pointer-events-none absolute inset-0 bg-black/55" />
            <div
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.02)]"
              style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%`, overflow: 'visible' }}
              onPointerDown={startDrag('move')}
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <img src={source} alt="" draggable={false} className="absolute max-w-none" style={{ width: `${10000 / crop.width}%`, height: `${10000 / crop.height}%`, left: `${-crop.x * 100 / crop.width}%`, top: `${-crop.y * 100 / crop.height}%` }} />
              </div>
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-60">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="border border-white/35" />)}</div>
              <Move size={18} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
              {handles.map(handle => <button key={handle} type="button" aria-label={`Resize ${handle}`} onPointerDown={startDrag(handle)} className={`absolute z-10 h-4 w-4 rounded-full border-2 border-slate-950 bg-white shadow ${handlePosition[handle]}`} />)}
            </div>
          </div>
        </div>
        <aside className="shrink-0 space-y-6 overflow-y-auto border-t border-white/10 bg-slate-900 p-5 lg:border-l lg:border-t-0">
          <div><p className="mb-3 text-xs font-semibold">Crop preset</p><div className="grid grid-cols-2 gap-2">{aspectPresets.map(preset => <button key={preset.label} type="button" onClick={() => applyAspect(preset.value)} className={`rounded-lg border px-3 py-2 text-xs ${aspect === preset.value ? 'border-white bg-white text-slate-950' : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'}`}>{preset.label}</button>)}</div></div>
          <div><p className="mb-3 text-xs font-semibold">Output size</p><div className="space-y-2">{outputSizes.map(size => <button key={size} type="button" onClick={() => setOutputSize(size)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs ${outputSize === size ? 'border-blue-400 bg-blue-500/15 text-blue-200' : 'border-white/15 text-slate-300'}`}><span>{size}px wide</span>{outputSize === size && <Check size={14} />}</button>)}</div></div>
          <button type="button" onClick={exportCrop} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-slate-950 hover:bg-slate-100"><Check size={16} /> Apply crop</button>
        </aside>
      </main>
    </div>,
    document.body
  );
};
