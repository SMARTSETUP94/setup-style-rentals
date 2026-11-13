/** Strict input schema for POST /api/quotes/submit — the browser sends NO prices, totals, HTML or URL. */
import { z } from "zod";
import { SUR_MESURE_KEYS } from "@/lib/sur-mesure";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const isRealDate = (s: string) => DATE_RE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const dateStr = z.string().refine(isRealDate, "invalid date");
const optStr = (max: number) => z.string().trim().max(max).optional().nullable();

export const ItemSchema = z
  .object({
    line_id: z.string().min(1).max(64),
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(500),
    startDate: dateStr.optional().nullable(),
    endDate: dateStr.optional().nullable(),
    days: z.number().int().min(1).max(365).optional().nullable(),
    option_ids: z.array(z.string().uuid()).max(50).default([]),
    custom_chosen: z.boolean().optional().nullable(),
    configurator_recap: z.string().max(5000).optional().nullable(),
    configurator_data: z
      .record(z.string(), z.unknown())
      .optional()
      .nullable()
      .refine((v) => v == null || JSON.stringify(v).length <= 20000, "configurator_data too large"),
    logo_path: z
      .string()
      .max(300)
      .refine((p) => p.startsWith("client-logos/") && !p.includes(".."), "invalid logo path")
      .optional()
      .nullable(),
    logo_filename: z.string().max(300).optional().nullable(),
  })
  .strict()
  .refine((i) => !!i.startDate === !!i.endDate, "both dates required")
  .refine((i) => !i.startDate || !i.endDate || i.endDate >= i.startDate, "endDate before startDate");

export const CustomItemSchema = z
  .object({
    kind: z.literal("custom"),
    line_id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    piece: z.enum(SUR_MESURE_KEYS),
    quantity: z.number().int().min(1).max(50),
    reference: z.string().trim().min(1).max(120),
    configuration: z
      .record(z.string(), z.unknown())
      .refine((v) => JSON.stringify(v).length <= 20000, "configuration too large"),
    recap: z.string().max(5000).default(""),
    alerts: z.array(z.string().max(400)).max(12).default([]),
    weight_kg: z.number().min(0).max(5000).nullable().optional(),
    thumbnail: z.string().max(160000).nullable().optional(),
  })
  .strict();
export type CustomItem = z.infer<typeof CustomItemSchema>;
export type RentalItem = z.infer<typeof ItemSchema>;
export const isCustomItem = (i: CustomItem | RentalItem): i is CustomItem => (i as CustomItem).kind === "custom";

export const PayloadSchema = z
  .object({
    customer_name: z.string().trim().min(1).max(200),
    company: optStr(200),
    email: z.string().trim().email().max(320),
    phone: optStr(50),
    message: optStr(5000),
    event_date: dateStr.optional().nullable(),
    event_location: optStr(500),
    delivery_time: z.string().regex(TIME_RE).optional().nullable(),
    pickup_time: z.string().regex(TIME_RE).optional().nullable(),
    lang: z.enum(["fr", "en"]),
    website: z.string().max(500).optional().nullable(),
    turnstile_token: z.string().max(4096).optional().nullable(),
    items: z.array(z.union([CustomItemSchema, ItemSchema])).min(1).max(50),
    custom_delivery_date: dateStr.optional().nullable(),
    custom_after_event: z.enum(["keep", "pickup", "discuss"]).optional().nullable(),
    wants_samples: z.boolean().optional(),
  })
  .strict();

export type Payload = z.infer<typeof PayloadSchema>;
