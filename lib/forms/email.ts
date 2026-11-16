import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { requireEnv } from "@/lib/env";
import { eur } from "@/lib/format";
import { FIELD_LABELS, formatFieldValue } from "@/lib/forms/labels";
import type { Submission } from "@/lib/forms/deliver";

/**
 * Email to the SHOP for each form submission. No auto-reply to the customer (decided):
 * that also means nobody can use our forms to send mail to a stranger's address.
 * Reply-To is the customer's email (when given), so "Reply" answers them directly.
 */

/** Turn a submission into [label, value] rows, with readable values (labels: lib/forms/labels.ts). */
export function emailRows(s: Submission): [string, string][] {
  const data = s.data as Record<string, unknown>;
  const value = (key: string): string | undefined => {
    if (key === "model") {
      const v = data.model;
      if (v === undefined || v === null || v === "") return undefined;
      return s.model ? `${s.model.name} (${eur(s.model.price)})` : String(v);
    }
    if (key === "monthly") return s.model?.monthly !== undefined ? `${eur(s.model.monthly)}/muaj (shembull, 0% interes)` : undefined;
    return formatFieldValue(key, data[key]);
  };
  const rows: [string, string][] = [];
  for (const key of Object.keys(FIELD_LABELS)) {
    const v = value(key);
    if (v !== undefined) rows.push([FIELD_LABELS[key], v]);
  }
  return rows;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Remove anything that could break an email header (defence in depth; the schemas already refuse it). */
const headerSafe = (s: string) => s.replace(/[\p{Cc}]+/gu, " ").trim().slice(0, 150);

export function composeEmail(s: Submission) {
  const data = s.data as Record<string, unknown>;
  const who = typeof data.name === "string" ? data.name : typeof data.email === "string" ? data.email : "";
  const subject = headerSafe(`[Moto Shpati] ${s.label}${who ? ` · ${who}` : ""}`);
  const rows = emailRows(s);
  const received = new Intl.DateTimeFormat("sq-AL", { timeZone: "Europe/Belgrade", dateStyle: "short", timeStyle: "short" }).format(new Date(s.receivedAt));

  const text = [`${s.label} nga faqja e internetit`, `Marrë: ${received}`, "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");

  const html = `<!doctype html><html lang="sq"><body style="margin:0;padding:24px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#fff;border-top:4px solid #e10600">
<tr><td style="padding:24px 28px 8px"><div style="font-size:12px;letter-spacing:2px;color:#e10600;font-weight:bold">MOTO SHPATI</div>
<h1 style="margin:6px 0 4px;font-size:22px">${escapeHtml(s.label)}</h1>
<div style="font-size:13px;color:#666">Marrë: ${escapeHtml(received)}</div></td></tr>
<tr><td style="padding:12px 28px 28px"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #eee;color:#666;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
</table></td></tr></table></body></html>`;

  const replyTo = typeof data.email === "string" && data.email ? data.email : undefined;
  return { subject, text, html, replyTo };
}

let transporter: Transporter | undefined;

/** SMTP connection from .env.local / Vercel settings. Port 465 = SSL, otherwise STARTTLS is required. */
function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(requireEnv("SMTP_PORT"));
  if (!Number.isInteger(port) || port <= 0) throw new Error("SMTP_PORT must be a number.");
  transporter = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port,
    secure: port === 465,
    requireTLS: port !== 465, // never send form data unencrypted
    auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASS") },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/** Send the submission to the shop inbox. `transport` is only passed in tests. */
export async function sendSubmissionEmail(s: Submission, transport: Transporter = getTransporter()) {
  const { subject, text, html, replyTo } = composeEmail(s);
  return transport.sendMail({
    from: requireEnv("MAIL_FROM"),
    to: requireEnv("MAIL_TO"),
    replyTo,
    subject,
    text,
    html,
  });
}

/** True when the SMTP settings exist (lets development work before the account is set up). */
export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST);
}
