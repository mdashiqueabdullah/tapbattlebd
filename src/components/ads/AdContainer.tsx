/**
 * Google AdSense Ad Container Components
 * 
 * These are placeholder containers ready for AdSense script integration.
 * Replace the placeholder content with actual AdSense ad units when ready.
 * 
 * To integrate AdSense:
 * 1. Add the AdSense script to index.html <head>
 * 2. Replace placeholder divs with <ins class="adsbygoogle" ...> tags
 * 3. Call (adsbygoogle = window.adsbygoogle || []).push({}) after mount
 */

interface AdContainerProps {
  className?: string;
  label?: string;
}

/** Responsive banner ad — full width, ~90px height on mobile, ~90-250px on desktop */
export function BannerAd({ className = "", label = "বিজ্ঞাপন" }: AdContainerProps) {
  return (
    <div className={`w-full flex flex-col items-center py-3 ${className}`}>
      <span className="text-[10px] text-muted-foreground/50 mb-1">{label}</span>
      {/* ADSENSE: Replace this div with responsive banner ad unit */}
      <div
        className="w-full max-w-[728px] h-[90px] rounded-lg bg-muted/20 border border-border/10 flex items-center justify-center"
        data-ad-slot="banner"
        data-ad-format="horizontal"
      >
        <span className="text-xs text-muted-foreground/30 select-none">Ad Space — 728×90</span>
      </div>
    </div>
  );
}

/** Medium rectangle ad — 300x250 */
export function RectangleAd({ className = "", label = "বিজ্ঞাপন" }: AdContainerProps) {
  return (
    <div className={`w-full flex flex-col items-center py-4 ${className}`}>
      <span className="text-[10px] text-muted-foreground/50 mb-1">{label}</span>
      {/* ADSENSE: Replace this div with 300x250 rectangle ad unit */}
      <div
        className="w-[300px] h-[250px] rounded-lg bg-muted/20 border border-border/10 flex items-center justify-center"
        data-ad-slot="rectangle"
        data-ad-format="rectangle"
      >
        <span className="text-xs text-muted-foreground/30 select-none">Ad Space — 300×250</span>
      </div>
    </div>
  );
}

/** Responsive ad — adapts to container width */
export function ResponsiveAd({ className = "", label = "বিজ্ঞাপন" }: AdContainerProps) {
  return (
    <div className={`w-full flex flex-col items-center py-4 ${className}`}>
      <span className="text-[10px] text-muted-foreground/50 mb-1">{label}</span>
      {/* ADSENSE: Replace this div with responsive ad unit (data-ad-format="auto") */}
      <div
        className="w-full max-w-[336px] sm:max-w-[468px] md:max-w-[728px] h-[100px] sm:h-[120px] rounded-lg bg-muted/20 border border-border/10 flex items-center justify-center"
        data-ad-slot="responsive"
        data-ad-format="auto"
      >
        <span className="text-xs text-muted-foreground/30 select-none">Responsive Ad</span>
      </div>
    </div>
  );
}
