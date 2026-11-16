import { GhostButton, SlashButton } from "@/components/ui/Buttons";
import StatusScreen from "@/components/ui/StatusScreen";

export default function NotFoundPage() {
  return (
    <StatusScreen
      word="404"
      eyebrow="GABIM 404"
      lines={["FAQJA NUK", "U GJET"]}
      text={<p>Kjo faqe nuk ekziston ose është zhvendosur. Shiko modelet tona ose kthehu në faqen kryesore.</p>}
      actions={
        <>
          <SlashButton href="/modelet">SHIKO MODELET</SlashButton>
          <GhostButton href="/">FAQJA KRYESORE</GhostButton>
        </>
      }
    />
  );
}
