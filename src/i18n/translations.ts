import type { Locale } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import type { Language } from "@/lib/types";

type Entry = Record<Language, string>;

const translations = {
  // General
  loading: { en: "Loading...", fr: "Chargement...", es: "Cargando..." },
  appName: { en: "Timesheets", fr: "Timesheets", es: "Timesheets" },
  close: { en: "Close", fr: "Fermer", es: "Cerrar" },

  // Sign in
  signInWithGoogle: { en: "Sign in with Google", fr: "Se connecter avec Google", es: "Iniciar sesión con Google" },
  signInDescription: {
    en: "Connect your Google Calendar to auto-generate billable hours.",
    fr: "Connectez votre Google Agenda pour générer automatiquement les heures facturables.",
    es: "Conecta tu Google Calendar para generar automáticamente las horas facturables.",
  },
  signInAccess: {
    en: "We need read-only access to your calendar to categorize your events.",
    fr: "Nous avons besoin d'un accès en lecture seule à votre agenda pour catégoriser vos événements.",
    es: "Necesitamos acceso de solo lectura a tu calendario para categorizar tus eventos.",
  },
  signInAgain: { en: "Sign in again", fr: "Se reconnecter", es: "Volver a iniciar sesión" },
  signOut: { en: "Sign out", fr: "Déconnexion", es: "Cerrar sesión" },

  // Errors
  calendarAccessError: {
    en: "Unable to access Google Calendar. Please sign in again.",
    fr: "Impossible d'accéder à Google Agenda. Veuillez vous reconnecter.",
    es: "No se puede acceder a Google Calendar. Vuelve a iniciar sesión.",
  },
  fetchFailed: {
    en: "Failed to load events. Please try again.",
    fr: "Échec du chargement des événements. Veuillez réessayer.",
    es: "No se pudieron cargar los eventos. Inténtalo de nuevo.",
  },

  // Nav bar
  searchEvents: { en: "Search events...", fr: "Rechercher...", es: "Buscar eventos..." },
  compactIs: { en: "Compact is", fr: "Compact", es: "Compacto" },
  on: { en: "on", fr: "activé", es: "activado" },
  off: { en: "off", fr: "désactivé", es: "desactivado" },
  settings: { en: "Settings", fr: "Paramètres", es: "Ajustes" },
  switchToDefault: { en: "Switch to default layout", fr: "Disposition par défaut", es: "Diseño predeterminado" },
  switchToCompact: { en: "Switch to compact layout", fr: "Disposition compacte", es: "Diseño compacto" },

  // Sidebar
  category: { en: "Category", fr: "Catégorie", es: "Categoría" },
  author: { en: "Author", fr: "Auteur", es: "Autor" },
  categorized: { en: "Categorized", fr: "Catégorisés", es: "Categorizados" },
  uncategorized: { en: "Uncategorized", fr: "Non catégorisé", es: "Sin categoría" },
  unknownAuthor: { en: "Unknown", fr: "Inconnu", es: "Desconocido" },
  primary: { en: "primary", fr: "principal", es: "principal" },
  fetchToSeeCategories: {
    en: "Fetch events to see categories",
    fr: "Récupérez les événements pour voir les catégories",
    es: "Obtén eventos para ver las categorías",
  },

  // Date range
  startDate: { en: "Start date", fr: "Date de début", es: "Fecha de inicio" },
  endDate: { en: "End date", fr: "Date de fin", es: "Fecha de fin" },
  to: { en: "to", fr: "au", es: "al" },
  fetch: { en: "Fetch", fr: "Charger", es: "Cargar" },
  fetching: { en: "Fetching...", fr: "Chargement...", es: "Cargando..." },
  clear: { en: "Clear", fr: "Effacer", es: "Limpiar" },
  weeks: { en: "Select weeks", fr: "Sélectionner semaines", es: "Seleccionar semanas" },

  // Summary
  totalEvents: { en: "Total Events", fr: "Total événements", es: "Total eventos" },
  totalHours: { en: "Total Hours", fr: "Total heures", es: "Total horas" },
  events: { en: "events", fr: "événements", es: "eventos" },
  total: { en: "total", fr: "total", es: "total" },
  hrs: { en: "Hrs", fr: "Hrs", es: "Hrs" },

  // Events table
  eventsTitle: { en: "Events", fr: "Événements", es: "Eventos" },
  noEvents: {
    en: "No events in this range",
    fr: "Aucun événement pour cette période",
    es: "No hay eventos en este período",
  },
  autoCopyIs: { en: "Auto-copy is", fr: "Copie auto", es: "Auto-copia" },
  enableAutoCopy: { en: "Enable auto-copy", fr: "Activer la copie auto", es: "Activar auto-copia" },
  disableAutoCopy: { en: "Disable auto-copy", fr: "Désactiver la copie auto", es: "Desactivar auto-copia" },
  copy: { en: "Copy", fr: "Copier", es: "Copiar" },
  copied: { en: "Copied", fr: "Copié", es: "Copiado" },
  date: { en: "Date", fr: "Date", es: "Fecha" },
  duration: { en: "Duration", fr: "Durée", es: "Duración" },
  colStartTime: { en: "Start", fr: "Début", es: "Inicio" },
  colEndTime: { en: "End", fr: "Fin", es: "Fin" },
  colTitle: { en: "Title", fr: "Titre", es: "Título" },
  colDescription: { en: "Description", fr: "Description", es: "Descripción" },
  colGuests: { en: "Guests", fr: "Invités", es: "Invitados" },
  colLocation: { en: "Location", fr: "Lieu", es: "Ubicación" },
  colMonthNumber: { en: "Month #", fr: "Mois n°", es: "N° mes" },
  colWeekNumber: { en: "Week #", fr: "Semaine n°", es: "N° semana" },

  // Settings
  dateFormat: { en: "Date Format", fr: "Format de date", es: "Formato de fecha" },
  durationPrecision: { en: "Duration Precision", fr: "Précision de durée", es: "Precisión de duración" },
  decimal: { en: "decimal", fr: "décimale", es: "decimal" },
  decimals: { en: "decimals", fr: "décimales", es: "decimales" },
  weekStartsOn: { en: "Starting day of the week", fr: "Premier jour de la semaine", es: "Primer día de la semana" },
  sunday: { en: "Sunday", fr: "Dimanche", es: "Domingo" },
  monday: { en: "Monday", fr: "Lundi", es: "Lunes" },
  bwMode: { en: "B&W Mode", fr: "Mode N&B", es: "Modo B&N" },
  bwModeHint: { en: "Black and white interface", fr: "Interface noir et blanc", es: "Interfaz blanco y negro" },
  darkMode: { en: "Dark Mode", fr: "Mode sombre", es: "Modo oscuro" },
  darkModeHint: { en: "Dark background interface", fr: "Interface fond sombre", es: "Interfaz de fondo oscuro" },
  excludedKeywords: { en: "Excluded Keywords", fr: "Mots-clés exclus", es: "Palabras clave excluidas" },
  excludedKeywordsPlaceholder: { en: "Lunch, Personal, OOO", fr: "Lunch, Personnel, ABS", es: "Almuerzo, Personal, AUS" },
  excludedKeywordsHint: {
    en: "Comma-separated. Events with these words in the title are hidden.",
    fr: "Séparés par des virgules. Les événements contenant ces mots sont masqués.",
    es: "Separados por comas. Los eventos con estas palabras en el título se ocultan.",
  },
  language: { en: "Language", fr: "Langue", es: "Idioma" },
  includeAllDay: { en: "Include all-day events", fr: "Inclure les événements journée", es: "Incluir eventos de día completo" },
  allDayHours: { en: "Hours per day", fr: "Heures par jour", es: "Horas por día" },
  copyWithHeaders: { en: "Copy with headers", fr: "Copier avec en-têtes", es: "Copiar con encabezados" },
  tableColumns: { en: "Table Columns", fr: "Colonnes du tableau", es: "Columnas de la tabla" },
  columnsDefault: { en: "Default", fr: "Défaut", es: "Predeterminado" },
  columnsAll: { en: "All", fr: "Tout", es: "Todo" },

  // Months
  monthJan: { en: "Jan", fr: "Jan", es: "Ene" },
  monthFeb: { en: "Feb", fr: "Fév", es: "Feb" },
  monthMar: { en: "Mar", fr: "Mar", es: "Mar" },
  monthApr: { en: "Apr", fr: "Avr", es: "Abr" },
  monthMay: { en: "May", fr: "Mai", es: "May" },
  monthJun: { en: "Jun", fr: "Jun", es: "Jun" },
  monthJul: { en: "Jul", fr: "Jul", es: "Jul" },
  monthAug: { en: "Aug", fr: "Aoû", es: "Ago" },
  monthSep: { en: "Sep", fr: "Sep", es: "Sep" },
  monthOct: { en: "Oct", fr: "Oct", es: "Oct" },
  monthNov: { en: "Nov", fr: "Nov", es: "Nov" },
  monthDec: { en: "Dec", fr: "Déc", es: "Dic" },
} satisfies Record<string, Entry>;

export type TranslationKey = keyof typeof translations;

export function translate(key: TranslationKey, lang: Language): string {
  return translations[key][lang];
}

const LOCALES: Record<Language, Locale> = { en: enUS, fr, es };

export const getDateLocale = (lang: Language): Locale => LOCALES[lang];

const MONTH_KEYS: TranslationKey[] = [
  "monthJan", "monthFeb", "monthMar", "monthApr", "monthMay", "monthJun",
  "monthJul", "monthAug", "monthSep", "monthOct", "monthNov", "monthDec",
];

export const getMonthLabels = (lang: Language): string[] => MONTH_KEYS.map((key) => translate(key, lang));
