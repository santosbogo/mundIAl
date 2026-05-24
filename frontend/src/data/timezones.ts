export interface TimezoneOption {
  value: string;
  label: string;
}

export const TIMEZONES: TimezoneOption[] = [
  {
    value: "America/Argentina/Buenos_Aires",
    label: "Buenos Aires (ART, UTC-3)",
  },
  { value: "America/Bogota", label: "Bogotá (COT, UTC-5)" },
  { value: "America/Santiago", label: "Santiago (CLT, UTC-3/4)" },
  { value: "America/Lima", label: "Lima (PET, UTC-5)" },
  { value: "America/La_Paz", label: "La Paz (BOT, UTC-4)" },
  { value: "America/Asuncion", label: "Asunción (PYT, UTC-3/4)" },
  { value: "America/Caracas", label: "Caracas (VET, UTC-4)" },
  { value: "America/Montevideo", label: "Montevideo (UYT, UTC-3)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT, UTC-3)" },
  { value: "America/Guayaquil", label: "Guayaquil (ECT, UTC-5)" },
  { value: "America/New_York", label: "Nueva York (ET, UTC-4/5)" },
  { value: "America/Chicago", label: "Chicago (CT, UTC-5/6)" },
  { value: "America/Denver", label: "Denver (MT, UTC-6/7)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (PT, UTC-7/8)" },
  { value: "America/Mexico_City", label: "Ciudad de México (CST, UTC-6)" },
  { value: "America/Toronto", label: "Toronto (ET, UTC-4/5)" },
  { value: "America/Vancouver", label: "Vancouver (PT, UTC-7/8)" },
  { value: "Europe/Madrid", label: "Madrid (CET, UTC+1/2)" },
  { value: "Europe/London", label: "Londres (BST, UTC+0/1)" },
  { value: "Europe/Paris", label: "París (CET, UTC+1/2)" },
  { value: "Europe/Berlin", label: "Berlín (CET, UTC+1/2)" },
  { value: "Europe/Rome", label: "Roma (CET, UTC+1/2)" },
  { value: "Europe/Lisbon", label: "Lisboa (WET, UTC+0/1)" },
  { value: "Africa/Cairo", label: "El Cairo (EET, UTC+2)" },
  { value: "Africa/Lagos", label: "Lagos (WAT, UTC+1)" },
  { value: "Africa/Johannesburg", label: "Johannesburgo (SAST, UTC+2)" },
  { value: "Africa/Casablanca", label: "Casablanca (WET, UTC+0/1)" },
  { value: "Asia/Tokyo", label: "Tokio (JST, UTC+9)" },
  { value: "Asia/Seoul", label: "Seúl (KST, UTC+9)" },
  { value: "Asia/Shanghai", label: "Shanghái (CST, UTC+8)" },
  { value: "Asia/Riyadh", label: "Riad (AST, UTC+3)" },
  { value: "Australia/Sydney", label: "Sídney (AEST, UTC+10/11)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST, UTC+12/13)" },
  { value: "UTC", label: "UTC (UTC+0)" },
];
