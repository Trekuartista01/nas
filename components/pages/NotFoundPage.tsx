import { GhostButton, SlashButton } from "@/components/ui/Buttons";
import StatusScreen from "@/components/ui/StatusScreen";
import T from "@/components/i18n/T";

export default function NotFoundPage() {
  return (
    <StatusScreen
      word="404"
      eyebrow={<T sq="GABIM 404" en="ERROR 404" />}
      lines={["PAGE NOT", "FOUND"]}
      text={
        <p>
          <T
            sq="Kjo faqe nuk ekziston ose është zhvendosur. Shiko modelet tona ose kthehu në faqen kryesore."
            en="This page doesn't exist or has moved. See our models or go back to the homepage."
          />
        </p>
      }
      actions={
        <>
          <SlashButton href="/modelet">
            <T sq="SHIKO MODELET" en="SEE THE MODELS" />
          </SlashButton>
          <GhostButton href="/">
            <T sq="FAQJA KRYESORE" en="HOMEPAGE" />
          </GhostButton>
        </>
      }
    />
  );
}
