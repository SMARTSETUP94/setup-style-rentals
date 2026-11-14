/** Pure bridge shared with server repricing. Camera/dimensions never imply branding. */
export function isPersonalisedConfiguration(data: unknown, recap = ""): boolean {
  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (value && typeof value === "object" && "mode" in value) {
        const mode = String(value.mode).toLowerCase();
        if (["custom", "personnalise", "peinture", "adhesif", "print", "logo"].includes(mode)) return true;
      }
    }
  }
  return recap.split("\n").some(line => {
    const match = line.match(/^(?:finition|fond|logo|structure|panneau|adhésif)\s*:\s*(.*)$/i);
    const value = match?.[1]?.trim() ?? "";
    return !/^(?:sans|blanc|standard|origine)\b/i.test(value) && /personnalis|peinture|adhésif|logo|placage|stratifié/i.test(value);
  });
}

export function isDailyService(name: string): boolean {
  return /animateur|host|par jour|per day/i.test(name);
}

export function optionCharge(price: number, name: string, days: number): number {
  return price * (isDailyService(name) ? days : 1);
}

export function eventDetailRows(event: {priceEvent: number; extraDays: number; priceExtraDay: number; customUnit: number}, quantity: number, lang: "fr" | "en", format: (n: number) => string): string[] {
  return [
    `${lang === "fr" ? "Événement" : "Event"} : ${format(event.priceEvent)} × ${quantity}`,
    `${lang === "fr" ? "Jours sup." : "Extra days"} : ${event.extraDays} × ${format(event.priceExtraDay)} × ${quantity}`,
    `${lang === "fr" ? "Personnalisation" : "Customisation"} : ${format(event.customUnit)} × ${quantity}`,
  ];
}