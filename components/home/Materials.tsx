import HoverColumns from "@/components/nas/HoverColumns";
import { NAS_HOME } from "@/data/nas-home";

/** Iron / Light / Concrete on /sport-line, above the footer: three photo columns that widen on hover (HoverColumns). */
export default function Materials() {
  return (
    <HoverColumns
      label="Materialet"
      variant="tags"
      items={NAS_HOME.materials.map((m) => ({ title: m.title, text: m.tags, image: m.image }))}
    />
  );
}
