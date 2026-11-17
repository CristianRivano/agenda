export type Service = {
  id: string;
  dbId?: number;
  name: string;
  shortName: string;
  category: string;
  description: string;
  duration: number;
  price: number;
  deposit: number;
  tone: string;
};

export type Therapist = {
  id: string;
  dbId?: number;
  name: string;
  initials: string;
  specialty: string;
  availability: string;
};

export type Slot = {
  id: string;
  time: string;
  localTime: string;
  therapist: string;
  status: "available" | "popular" | "held";
};

export type Booking = {
  id: string;
  start: string;
  end: string;
  customer: string;
  service: string;
  therapist: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  amount: number;
  zone: string;
  phone: string;
};

export const business = {
  name: "Masajes Nanai",
  location: "Talca · atención a domicilio",
  timezone: "America/Santiago",
  tagline: "Una pausa de bienestar, en casa.",
  coverage: "Talca y sectores cercanos",
};

export const services: Service[] = [
  {
    id: "nirvana",
    name: "Masaje Relajante Nirvana",
    shortName: "Relajante Nirvana",
    category: "Relajación",
    description: "Pases largos y presión suave para bajar el ritmo y volver al cuerpo.",
    duration: 60,
    price: 30000,
    deposit: 9000,
    tone: "Sereno",
  },
  {
    id: "descontracturante",
    name: "Masaje Descontracturante",
    shortName: "Descontracturante",
    category: "Tensión muscular",
    description: "Trabajo focalizado en cuello, espalda y hombros con intensidad conversada.",
    duration: 60,
    price: 28000,
    deposit: 8400,
    tone: "Focalizado",
  },
  {
    id: "deep-tissue",
    name: "Tejido profundo",
    shortName: "Tejido profundo",
    category: "Recuperación",
    description: "Presión progresiva sobre tejidos blandos, siempre dentro de tu tolerancia.",
    duration: 60,
    price: 35000,
    deposit: 10500,
    tone: "Intenso",
  },
  {
    id: "deportivo",
    name: "Deportivo de descarga",
    shortName: "Deportivo",
    category: "Movimiento",
    description: "Una sesión cómoda para acompañar tu entrenamiento y tu sensación de descarga.",
    duration: 60,
    price: 30000,
    deposit: 9000,
    tone: "Activo",
  },
  {
    id: "drenaje",
    name: "Drenaje linfático manual",
    shortName: "Drenaje manual",
    category: "Suave",
    description: "Movimientos superficiales y rítmicos; modalidad de bienestar, no médica.",
    duration: 60,
    price: 30000,
    deposit: 9000,
    tone: "Suave",
  },
  {
    id: "piernas",
    name: "Bienestar en piernas",
    shortName: "Bienestar en piernas",
    category: "Descanso",
    description: "Pases lentos y ascendentes para una sensación de descanso en piernas cansadas.",
    duration: 45,
    price: 24000,
    deposit: 7200,
    tone: "Ligero",
  },
];

export const therapists: Therapist[] = [
  { id: "any", name: "Cualquiera disponible", initials: "∞", specialty: "La primera opción disponible", availability: "Más franjas" },
  { id: "sofia", name: "Sofía Rojas", initials: "SR", specialty: "Relajación y tejido profundo", availability: "Hoy · 3 franjas" },
  { id: "camila", name: "Camila Torres", initials: "CT", specialty: "Descontracturante y deportivo", availability: "Hoy · 2 franjas" },
];

export const slotsByDate: Record<string, Slot[]> = {
  "2026-11-18": [
    { id: "s1", time: "09:00", localTime: "09:00", therapist: "Sofía Rojas", status: "available" },
    { id: "s2", time: "11:00", localTime: "11:00", therapist: "Camila Torres", status: "popular" },
    { id: "s3", time: "15:30", localTime: "15:30", therapist: "Sofía Rojas", status: "available" },
    { id: "s4", time: "18:00", localTime: "18:00", therapist: "Cualquiera disponible", status: "available" },
  ],
  "2026-11-19": [
    { id: "s5", time: "10:30", localTime: "10:30", therapist: "Camila Torres", status: "available" },
    { id: "s6", time: "13:00", localTime: "13:00", therapist: "Sofía Rojas", status: "popular" },
    { id: "s7", time: "17:00", localTime: "17:00", therapist: "Cualquiera disponible", status: "available" },
  ],
  "2026-11-20": [
    { id: "s8", time: "09:30", localTime: "09:30", therapist: "Sofía Rojas", status: "available" },
    { id: "s9", time: "12:00", localTime: "12:00", therapist: "Camila Torres", status: "available" },
    { id: "s10", time: "16:30", localTime: "16:30", therapist: "Cualquiera disponible", status: "popular" },
  ],
  "2026-11-21": [
    { id: "s11", time: "10:00", localTime: "10:00", therapist: "Cualquiera disponible", status: "available" },
    { id: "s12", time: "14:30", localTime: "14:30", therapist: "Sofía Rojas", status: "available" },
  ],
};

export const bookings: Booking[] = [
  { id: "BN-1048", start: "2026-11-17T09:00:00", end: "2026-11-17T10:00:00", customer: "Martina Silva", service: "Masaje Relajante Nirvana", therapist: "Sofía Rojas", status: "confirmed", amount: 30000, zone: "Las Rastras", phone: "+56 9 7456 1182" },
  { id: "BN-1049", start: "2026-11-17T11:30:00", end: "2026-11-17T12:30:00", customer: "Diego Muñoz", service: "Descontracturante", therapist: "Camila Torres", status: "confirmed", amount: 28000, zone: "Centro", phone: "+56 9 6321 9044" },
  { id: "BN-1050", start: "2026-11-17T15:00:00", end: "2026-11-17T16:00:00", customer: "Antonia Pérez", service: "Tejido profundo", therapist: "Sofía Rojas", status: "pending", amount: 35000, zone: "Bicentenario", phone: "+56 9 8123 5502" },
  { id: "BN-1051", start: "2026-11-17T18:30:00", end: "2026-11-17T19:30:00", customer: "Felipe Castro", service: "Deportivo de descarga", therapist: "Camila Torres", status: "confirmed", amount: 30000, zone: "Avenida Colín", phone: "+56 9 9981 4420" },
  { id: "BN-1046", start: "2026-11-16T10:00:00", end: "2026-11-16T11:00:00", customer: "Valentina Díaz", service: "Drenaje linfático manual", therapist: "Sofía Rojas", status: "completed", amount: 30000, zone: "El Tabaco", phone: "+56 9 6112 0377" },
  { id: "BN-1044", start: "2026-11-15T16:00:00", end: "2026-11-15T17:00:00", customer: "Renato Bravo", service: "Masaje Relajante Nirvana", therapist: "Camila Torres", status: "cancelled", amount: 30000, zone: "San Miguel", phone: "+56 9 7220 6611" },
];

export const formatCLP = (value: number) => `$${value.toLocaleString("es-CL")}`;
export const formatDate = (date: string | Date, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat("es-CL", options).format(typeof date === "string" ? new Date(date) : date);
