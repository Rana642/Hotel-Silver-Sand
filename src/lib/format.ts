const TZ = "Asia/Karachi";

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDate(iso: string) {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function pkr(n: number) {
  return "PKR " + Math.round(n).toLocaleString("en-PK");
}
