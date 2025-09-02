export const I18N = {
  en: {
    app_title: "Paraglider Polar Curve Visualizer",
    controls_title: "Controls",
    mode_simple: "Simple",
    mode_advanced: "Advanced",

    glider_selection_label: "Select Glider",
    pilot_control: "Pilot Control",
    brakes: "Brakes",
    trim: "Trim",
    speedbar: "Speedbar",
    wind: "Wind",
    headwind: "Headwind",
    tailwind: "Tailwind",
    lift_sink: "Lift / Sink",
    lift: "Lift",
    sink: "Sink",
    units: "Units",
    unit_kmh: "km/h",
    unit_ms: "m/s",
    unit_mph: "mph",
    unit_kt: "kt",

    data_panel: "Live Data",
    airspeed: "Airspeed",
    sink_rate: "Sink Rate",
    groundspeed: "Groundspeed",
    glide_ratio_air: "Glide Ratio (air)",
    glide_ratio_ground: "Glide Ratio (ground)",

    axis_airspeed: "Airspeed",
    axis_sinkrate: "Sink Rate",

    presets: "Scenarios",
    preset_none: "—",
    preset_calm: "Calm Evening Glide",
    preset_ridge: "Ridge Soaring",
    preset_valley: "Valley Crossing",
    preset_thermal: "Strong Thermal Climb",

    wing_loading: "Wing Loading (relative)",
  },
  de: {
    app_title: "Gleitschirm‑Polare Visualizer",
    controls_title: "Bedienfeld",
    mode_simple: "Einfach",
    mode_advanced: "Erweitert",

    glider_selection_label: "Schirm wählen",
    pilot_control: "Piloteneingabe",
    brakes: "Bremsen",
    trim: "Trimm",
    speedbar: "Beschleuniger",
    wind: "Wind",
    headwind: "Gegenwind",
    tailwind: "Rückenwind",
    lift_sink: "Steigen / Sinken",
    lift: "Steigen",
    sink: "Sinken",
    units: "Einheiten",
    unit_kmh: "km/h",
    unit_ms: "m/s",
    unit_mph: "mph",
    unit_kt: "kt",

    data_panel: "Live‑Daten",
    airspeed: "Fluggeschwindigkeit",
    sink_rate: "Sinkrate",
    groundspeed: "Geschwindigkeit über Grund",
    glide_ratio_air: "Gleitzahl (Luft)",
    glide_ratio_ground: "Gleitzahl (Boden)",

    axis_airspeed: "Fluggeschwindigkeit",
    axis_sinkrate: "Sinkrate",

    presets: "Szenarien",
    preset_none: "—",
    preset_calm: "Ruhiger Abendgleitflug",
    preset_ridge: "Hangsoaren",
    preset_valley: "Talsprung",
    preset_thermal: "Starkes Thermiksteigen",

    wing_loading: "Flächenbelastung (relativ)",
  },
  fr: {
    app_title: "Visualiseur de Polaire (Parapente)",
    controls_title: "Commandes",
    mode_simple: "Simple",
    mode_advanced: "Avancé",

    glider_selection_label: "Choisir l’aile",
    pilot_control: "Commande pilote",
    brakes: "Freins",
    trim: "Bras hauts",
    speedbar: "Accélérateur",
    wind: "Vent",
    headwind: "Vent de face",
    tailwind: "Vent arrière",
    lift_sink: "Ascendance / Descendance",
    lift: "Ascendance",
    sink: "Descendance",
    units: "Unités",
    unit_kmh: "km/h",
    unit_ms: "m/s",
    unit_mph: "mph",
    unit_kt: "kt",

    data_panel: "Données en direct",
    airspeed: "Vitesse air",
    sink_rate: "Taux de chute",
    groundspeed: "Vitesse sol",
    glide_ratio_air: "Finesse (air)",
    glide_ratio_ground: "Finesse (sol)",

    axis_airspeed: "Vitesse air",
    axis_sinkrate: "Taux de chute",

    presets: "Scénarios",
    preset_none: "—",
    preset_calm: "Soirée calme",
    preset_ridge: "Vol de pente",
    preset_valley: "Traversée de vallée",
    preset_thermal: "Forte thermique",

    wing_loading: "Charge alaire (relative)",
  },
};

export function detectLang() {
  const nav = (typeof navigator !== "undefined" && navigator.language) || "en";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("de")) return "de";
  return "en";
}
