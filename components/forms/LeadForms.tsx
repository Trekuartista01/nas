"use client";

import { ConsentField, LeadForm, TextArea, TextField } from "@/components/forms/FormParts";
import { motion } from "framer-motion";
import { submitContact, submitDealer } from "@/lib/forms/actions";
import { MOTION } from "@/lib/motion";

/**
 * The site lead forms (the service, offer and test-ride forms were removed; their schemas stay for old leads in Admin → Kërkesat). Each lands in Admin → Kërkesat (and in the shop's inbox once email is set up).
 * Fields match the server schemas in lib/forms/schemas.ts.
 */

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
