"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ChromeLion from "@/components/nas/ChromeLion";
import { BlockButton, ChromeOutlineButton } from "@/components/ui/Buttons";
import { BUSINESS } from "@/data/business";
import { MOTION } from "@/lib/motion";

const SLIDE = { duration: 0.9, ease: MOTION.ease };

/**
 * "LEAD. DON'T FOLLOW." (#dealer), the layer the footer slides out from under. Panel background
 * (#161616) so it reads as its own layer; about one screen tall on desktop.
 * Left: headline ("LEAD." in chrome, "DON'T FOLLOW." red), text, buttons. Right: the chrome lion.
 * Phones: the lion (60% wide) above the headline.
 * Entrance (25% in view): "LEAD." slides in from the left, "DON'T" / "FOLLOW." sweep in from the
 * right behind their masks a beat later, then one glint crosses "LEAD.".
 * Bottom edge: a 2px chrome line where the footer comes out; its glint travels left → right with
 * the footer reveal (--footer-reveal, published by FooterReveal; no extra scroll listener).
 * Chrome is used only here and on the footer wordmark (see app/globals.css).
 */
export default function DealerCta() {
  const [shown, setShown] = useState(false);

  return (
    <section id="dealer" aria-label="Become a dealer" className="relative scroll-mt-20 bg-panel-2">
      <div className="container-moto grid items-center gap-12 py-[clamp(90px,10vw,140px)] lg:min-h-svh lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Phones: lion first */}
        <div className="order-1 mx-auto w-[60%] max-w-[300px] lg:order-2 lg:w-[min(460px,80%)] lg:max-w-none">
          <ChromeLion />
        </div>

        <motion.div className="order-2 lg:order-1" initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.25 }} onViewportEnter={() => setShown(true)}>
          <h2 className="headline text-[clamp(56px,7.4vw,136px)] leading-[0.92]">
            <motion.span
              data-anim
              className={`chrome-text block pb-[0.04em] ${shown ? "animate-[glint-sweep-text_0.9s_cubic-bezier(.7,0,.2,1)_1.15s_both]" : ""}`}
              variants={{ hidden: { opacity: 0, x: -80 }, shown: { opacity: 1, x: 0, transition: SLIDE } }}
            >
              LEAD.
            </motion.span>
            {["DON’T", "FOLLOW."].map((line, i) => (
              <span key={line} className="-mb-[0.06em] block overflow-hidden pb-[0.06em]">
                <motion.span
                  data-anim
                  className="block text-red"
                  variants={{ hidden: { x: "101%" }, shown: { x: "0%", transition: { ...SLIDE, delay: 0.15 + i * 0.1 } } }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.div
            data-anim
            variants={{ hidden: { opacity: 0, y: MOTION.rise }, shown: { opacity: 1, y: 0, transition: { ...SLIDE, delay: 0.45 } } }}
          >
            <p className="mt-9 max-w-[460px] text-[17px] leading-[1.6] text-body">
              Bring NAS to your showroom. Tell us about your business and our team will get back to you with the range and partnership terms.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              {/* TODO(client): header CTA says "Kërko ofertë" (→ /kerko-oferte), this one "Become a dealer" (→ /kontakti).
                  Decide one wording and action for both. */}
              <BlockButton href="/kontakti" marks={false}>
                Become a dealer
              </BlockButton>
              {/* TODO(client): confirm the secondary action: "Call 044 155 662" (now) or "Find a showroom". */}
              <ChromeOutlineButton href={`tel:${BUSINESS.phone}`}>Call {BUSINESS.phoneDisplay}</ChromeOutlineButton>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Chrome edge: the footer slides out from under this line; its glint follows the reveal. */}
      <div aria-hidden className="chrome absolute inset-x-0 bottom-0 h-[2px]">
        <div className="glint absolute inset-0 [background-position:calc((1_-_var(--footer-reveal,0))_*_100%)_0]" />
      </div>
    </section>
  );
}
