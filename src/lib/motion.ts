/**
 * Set on <html> by a check at page load (see layout.tsx) when the browser can only draw WebGL in software,
 * with no GPU: old machines, some locked-down ones, and test servers. Repainting is costly there, so the 3D
 * scenes aren't loaded at all and the endless decorative animations rest (see globals.css).
 */
export const lowPower = () => "lowPower" in document.documentElement.dataset;

/**
 * The check itself, run inline before the page paints: it asks for a WebGL context that won't settle for
 * software, and in case the browser hands one over anyway, reads the renderer's name for the software ones
 * (SwiftShader, llvmpipe and the like)
 */
export const LOW_POWER_CHECK = `try{var c=document.createElement("canvas"),o={failIfMajorPerformanceCaveat:true},g=c.getContext("webgl2",o)||c.getContext("webgl",o),low=!g;if(g){var d=g.getExtension("WEBGL_debug_renderer_info"),r=String(g.getParameter(d?d.UNMASKED_RENDERER_WEBGL:g.RENDERER));low=/swiftshader|llvmpipe|softpipe|software/i.test(r);var x=g.getExtension("WEBGL_lose_context");x&&x.loseContext()}if(low)document.documentElement.dataset.lowPower=""}catch(e){}`;
