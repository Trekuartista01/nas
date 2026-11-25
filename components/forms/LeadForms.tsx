"use client";

import { ConsentField, ContactFields, LeadForm, SelectField, TextArea, TextField, type SelectOption } from "@/components/forms/FormParts";
import { DEPOSIT_STEPS, TERM_OPTIONS } from "@/lib/finance";
import { motion } from "framer-motion";
import { submitContact, submitDealer, submitFinance } from "@/lib/forms/actions";
import { MOTION } from "@/lib/motion";

/**
 * The site lead forms (the service, offer and test-ride forms were removed; their schemas stay for old leads in Admin → Kërkesat). Each lands in Admin → Kërkesat (and in the shop's inbox once email is set up).
 * Fields match the server schemas in lib/forms/schemas.ts.
 * `models`: the published models ({ value: slug, label }), loaded on the server.
 * `model`: preselect one (e.g. coming from a model page).
 */

interface ModelProps {
  models: SelectOption[];
  model?: string;
}

/** Only preselect a model that is actually in the list. */
const pick = (models: SelectOption[], slug?: string) => (slug && models.some((m) => m.value === slug) ? slug : undefined);

export function FinanceForm({ models, model }: ModelProps) {
  return (
    <LeadForm action={submitFinance} label="Apliko për financim" submitLabel="APLIKO">
      <ContactFields emailRequired />
      <SelectField name="model" label="Modeli" options={models} defaultValue={pick(models, model)} required wide />
      <SelectField
        name="deposit"
        label="Kapari"
        required
        defaultValue="20"
        options={DEPOSIT_STEPS.map((d) => ({ value: String(d), label: `${d}%` }))}
      />
      <SelectField
        name="months"
        label="Afati"
        required
        defaultValue="24"
        options={TERM_OPTIONS.map((m) => ({ value: String(m), label: `${m} muaj` }))}
      />
      <TextArea name="message" label="Mesazhi" rows={3} />
      <ConsentField />
    </LeadForm>
  );
}

export function ContactForm() {
  return (
    <LeadForm action={submitContact} label="Na shkruaj" submitLabel="DËRGO MESAZHIN">
      <TextField name="name" label="Emri dhe mbiemri" required autoComplete="name" maxLength={80} wide />
      <TextField name="email" label="Email" type="email" inputMode="email" autoComplete="email" required maxLength={254} placeholder="email@shembull.com" />
      <TextField name="phone" label="Telefoni" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} placeholder="044 123 456" />
      <TextField name="subject" label="Tema" maxLength={120} wide />
      <TextArea name="message" label="Mesazhi" required rows={6} />
      <ConsentField />
    </LeadForm>
  );
}

/** Field that rises in after the one before it (homepage dealer form). */
function Staggered({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <motion.div
      data-anim
      initial={{ opacity: 0, y: MOTION.rise }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: MOTION.text, ease: MOTION.ease, delay: i * MOTION.fieldStagger }}
    >
      {children}
    </motion.div>
  );
}

/** Homepage "Lead. Don't follow.": businesses asking to become a NAS dealer (design copy is English). */
export function DealerForm() {
  return (
    <LeadForm action={submitDealer} label="Become a dealer" submitLabel="Send enquiry" look="block" className="relative grid gap-8 [&>*]:col-span-full!">
      <Staggered i={0}>
        <TextField line name="name" label="Full name" placeholder="Your name" required autoComplete="name" maxLength={80} />
      </Staggered>
      <Staggered i={1}>
        <TextField line name="company" label="Company" placeholder="Dealership or business" required autoComplete="organization" maxLength={120} />
      </Staggered>
      <Staggered i={2}>
        <TextField line name="reach" label="Phone or email" placeholder="How we reach you" required autoComplete="email" maxLength={254} />
      </Staggered>
      <Staggered i={3}>
        <ConsentField />
      </Staggered>
    </LeadForm>
  );
}
