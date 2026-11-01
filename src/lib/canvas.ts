/**
 * A brand-new canvas standing in for `placeholder` (the one React renders) for one run of a WebGL
 * scene, removed again by `release`. A canvas keeps its first GPU context for life, and Next keeps a
 * page's DOM around when you navigate away, so a scene coming back to its old canvas would be handed
 * the context it gave up when it left: a dead one, which the browser paints as a blank sheet.
 */
export function freshCanvas(placeholder: HTMLCanvasElement) {
  // Same classes and attributes, so it sits exactly where the placeholder does
  const canvas = placeholder.cloneNode() as HTMLCanvasElement;
  placeholder.hidden = true;
  placeholder.after(canvas);
  return {
    canvas,
    release: () => {
      canvas.remove();
      placeholder.hidden = false;
    },
  };
}
