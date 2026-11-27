import HoverColumns from "@/components/nas/HoverColumns";
import { NAS_HOME } from "@/data/nas-home";

/**
 * Lifestyle / Speed / Freedom on the homepage: the same photo columns as Iron / Light / Concrete on /sport-line
 * (HoverColumns, Nov 2026): side by side, the hovered one widens and its photo zooms in, the others go grey.
 * Replaced the pinned full-screen stack (the next panel slid up over the one before; see git history).
 */
export default function VisionPanels() {
  return <HoverColumns label="Lifestyle, Speed, Freedom" variant="body" heading="h2" items={NAS_HOME.panels} />;
}
