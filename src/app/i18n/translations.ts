import { Language } from "@/app/types/settings";

const translations = {
  // General
  loading: { en: "Loading...", fr: "Chargement...", es: "Cargando..." },
  billingSync: { en: "Timesheets", fr: "Timesheets", es: "Timesheets" },
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
  signOut: { en: "Sign out", fr: "Déconnexion", es: "Cerrar sesión" },

  // Nav bar
  searchEvents: { en: "Search events...", fr: "Rechercher...", es: "Buscar eventos..." },
  billingIs: { en: "Billing is", fr: "Facturation", es: "Facturación" },
  compactIs: { en: "Compact is", fr: "Compact", es: "Compacto" },
  on: { en: "on", fr: "activé", es: "activado" },
  off: { en: "off", fr: "désactivé", es: "desactivado" },
  settings: { en: "Settings", fr: "Paramètres", es: "Ajustes" },

  // Tabs
  billing: { en: "Billing", fr: "Facturation", es: "Facturación" },
  analytics: { en: "Analytics", fr: "Analytique", es: "Analítica" },

  // Sidebar
  categories: { en: "Categories", fr: "Catégories", es: "Categorías" },
  clear: { en: "Clear", fr: "Effacer", es: "Limpiar" },
  fetchToSeeCategories: {
    en: "Fetch events to see categories",
    fr: "Récupérez les événements pour voir les catégories",
    es: "Obtén eventos para ver las categorías",
  },

  // Date range
  to: { en: "to", fr: "au", es: "al" },
  fetching: { en: "Fetching...", fr: "Chargement...", es: "Cargando..." },
  fetch: { en: "Fetch", fr: "Charger", es: "Cargar" },

  // Summary cards
  totalEvents: { en: "Total Events", fr: "Total événements", es: "Total eventos" },
  totalHours: { en: "Total Hours", fr: "Total heures", es: "Total horas" },
  totalBillable: { en: "Total Billable", fr: "Total facturable", es: "Total facturable" },
  events: { en: "events", fr: "événements", es: "eventos" },
  total: { en: "total", fr: "total", es: "total" },
  Total: { en: "Total", fr: "Total", es: "Total" },
  billable: { en: "billable", fr: "facturable", es: "facturable" },

  // Table & actions
  eventsTitle: { en: "Events", fr: "Événements", es: "Eventos" },
  autoCopyIs: { en: "Auto-copy is", fr: "Copie auto", es: "Auto-copia" },
  copied: { en: "Copied", fr: "Copié", es: "Copiado" },
  copy: { en: "Copy", fr: "Copier", es: "Copiar" },
  exporting: { en: "Exporting...", fr: "Exportation...", es: "Exportando..." },
  date: { en: "Date", fr: "Date", es: "Fecha" },
  duration: { en: "Duration", fr: "Durée", es: "Duración" },
  eventTitle: { en: "Event Title", fr: "Titre", es: "Título" },
  client: { en: "Client", fr: "Client", es: "Cliente" },
  clientMatch: { en: "Client", fr: "Client", es: "Cliente" },
  hrs: { en: "Hrs", fr: "Hrs", es: "Hrs" },
  amount: { en: "Amount", fr: "Montant", es: "Monto" },
  uncategorized: { en: "Uncategorized", fr: "Non catégorisé", es: "Sin categoría" },

  // Charts
  monthlyRevenue: { en: "Monthly Revenue", fr: "Revenus mensuels", es: "Ingresos mensuales" },
  revenue: { en: "Revenue", fr: "Revenus", es: "Ingresos" },
  hoursByClient: { en: "Hours by Client", fr: "Heures par client", es: "Horas por cliente" },
  hours: { en: "Hours", fr: "Heures", es: "Horas" },
  revenueByClient: { en: "Revenue by Client", fr: "Revenus par client", es: "Ingresos por cliente" },
  invoiceStatus: { en: "Invoice Status", fr: "Statut des factures", es: "Estado de facturas" },
  fetchDataForCharts: {
    en: "Fetch billing data or generate invoices to see charts",
    fr: "Récupérez les données ou générez des factures pour voir les graphiques",
    es: "Obtén datos de facturación o genera facturas para ver gráficos",
  },
  draft: { en: "draft", fr: "brouillon", es: "borrador" },
  sent: { en: "sent", fr: "envoyé", es: "enviado" },
  paid: { en: "paid", fr: "payé", es: "pagado" },
  overdue: { en: "overdue", fr: "en retard", es: "vencido" },

  // Settings modal
  defaultHourlyRate: { en: "Default Hourly Rate", fr: "Taux horaire par défaut", es: "Tarifa horaria por defecto" },
  hourlyRateHint: {
    en: "Used when no client rate is matched",
    fr: "Utilisé quand aucun taux client ne correspond",
    es: "Se usa cuando no coincide ninguna tarifa de cliente",
  },
  currency: { en: "Currency", fr: "Devise", es: "Moneda" },
  businessName: { en: "Business Name", fr: "Nom de l'entreprise", es: "Nombre de empresa" },
  businessNamePlaceholder: { en: "Your business name", fr: "Nom de votre entreprise", es: "Nombre de tu empresa" },
  businessNameHint: {
    en: "Shown on exported invoices (overrides template)",
    fr: "Affiché sur les factures exportées (remplace le modèle)",
    es: "Se muestra en las facturas exportadas (reemplaza la plantilla)",
  },
  invoiceNumberPrefix: { en: "Invoice Number Prefix", fr: "Préfixe de facture", es: "Prefijo de factura" },
  dateFormat: { en: "Date Format", fr: "Format de date", es: "Formato de fecha" },
  durationPrecision: { en: "Duration Precision", fr: "Précision de durée", es: "Precisión de duración" },
  decimal: { en: "decimal", fr: "décimale", es: "decimal" },
  decimals: { en: "decimals", fr: "décimales", es: "decimales" },
  showDecimalsInAmounts: { en: "Show decimals in amounts", fr: "Afficher les décimales", es: "Mostrar decimales" },
  showDecimalsHint: {
    en: "Display cents in money values (e.g. $100.00 vs $100)",
    fr: "Afficher les centimes (ex. 100,00 $ vs 100 $)",
    es: "Mostrar centavos en valores monetarios (ej. $100.00 vs $100)",
  },
  defaultCalendars: { en: "Default Calendars", fr: "Agendas par défaut", es: "Calendarios por defecto" },
  loadingCalendars: { en: "Loading calendars...", fr: "Chargement des agendas...", es: "Cargando calendarios..." },
  primary: { en: "primary", fr: "principal", es: "principal" },
  language: { en: "Language", fr: "Langue", es: "Idioma" },
  bwMode: { en: "B&W Mode", fr: "Mode N&B", es: "Modo B&N" },
  bwModeHint: { en: "Black and white interface", fr: "Interface noir et blanc", es: "Interfaz blanco y negro" },
  excludedKeywords: { en: "Excluded Keywords", fr: "Mots-clés exclus", es: "Palabras clave excluidas" },
  excludedKeywordsPlaceholder: { en: "Lunch, Personal, OOO", fr: "Lunch, Personnel, ABS", es: "Almuerzo, Personal, AUS" },
  excludedKeywordsHint: {
    en: "Comma-separated. Events with these words in the title are hidden.",
    fr: "Séparés par des virgules. Les événements contenant ces mots sont masqués.",
    es: "Separados por comas. Los eventos con estas palabras en el título se ocultan.",
  },

  // Tooltips
  hideBillingInfo: { en: "Hide billing info", fr: "Masquer la facturation", es: "Ocultar facturación" },
  showBillingInfo: { en: "Show billing info", fr: "Afficher la facturation", es: "Mostrar facturación" },
  switchToDefault: { en: "Switch to default layout", fr: "Disposition par défaut", es: "Diseño predeterminado" },
  switchToCompact: { en: "Switch to compact layout", fr: "Disposition compacte", es: "Diseño compacto" },
  disableAutoCopy: { en: "Disable auto-copy", fr: "Désactiver la copie auto", es: "Desactivar auto-copia" },
  enableAutoCopy: { en: "Enable auto-copy", fr: "Activer la copie auto", es: "Activar auto-copia" },

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
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key][lang];
}

export function getMonths(lang: Language): string[] {
  return [
    t("monthJan", lang), t("monthFeb", lang), t("monthMar", lang),
    t("monthApr", lang), t("monthMay", lang), t("monthJun", lang),
    t("monthJul", lang), t("monthAug", lang), t("monthSep", lang),
    t("monthOct", lang), t("monthNov", lang), t("monthDec", lang),
  ];
}
