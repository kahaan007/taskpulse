import type { FieldOptions, Opt } from "./types";

const o = (name: string, color = "default"): Opt => ({ name, color });

/** Offline / demo fallback only. The live schema from Notion always wins. */
export const FALLBACK_OPTIONS: FieldOptions = {
  client: [
    o("Ashok Kumar Mittal", "pink"), o("Redington Group", "green"), o("CoreOpsAI", "brown"), o("JerHigh", "orange"),
    o("NDMC"), o("GoaAirport", "red"), o("Azenthio", "blue"), o("Internal", "purple"), o("GoEarnest", "yellow"),
    o("Easybuy", "gray"), o("Team Support", "orange"), o("ilumina", "pink"), o("Redington Foundation", "gray"),
    o("GR Infra", "purple"), o("Hashtag Orange", "orange"), o("Good Earth Infra", "brown"), o("Hunter Beer", "purple"),
    o("JioFrames", "orange"), o("GMR", "gray"), o("Livguard", "pink"), o("ShanFoods", "gray"),
    o("Lovely Professional University", "gray"), o("Monte Carlo", "brown"), o("GMR Aero XP", "pink"),
    o("Ramp 360", "gray"), o("AEDEX Expo & Airport EXPO", "red"), o("Whizrobot Pitch", "blue"), o("GMR Raxa", "brown"),
    o("Honeywell", "red"), o("Udaiti", "yellow"), o("HPCL"), o("The Plan Beyond", "brown"), o("Udaiti CGG", "purple"),
    o("Raman Kant Mujal Foundation", "blue"), o("Sunsure Energy", "pink"), o("Safetree Insurance", "green"),
    o("Siemens", "red"), o("SafeAir"), o("Pyramid Infrastructure", "red"),
  ],
  goal: [
    o("Website Revamp", "green"), o("UX Strategy", "yellow"), o("Pitch"), o("Maintanence", "gray"), o("Product Design", "red"),
  ],
  taskType: [
    o("AI Image Generation"), o("AI Video Generation", "purple"), o("Asset handover", "red"), o("Banner", "brown"),
    o("Business Research", "orange"), o("Client Meeting", "green"), o("Colour Paltte", "red"), o("Competition Analysis"),
    o("Deck", "orange"), o("Design System", "orange"), o("Find stock image", "purple"), o("High Fidelity", "yellow"),
    o("Ideation", "red"), o("Image Resize", "orange"), o("Internal Research", "brown"), o("Kick Off Meeting", "green"),
    o("Logo resize", "blue"), o("Low Fidelity"), o("Medium Fidelity Wireframe", "blue"), o("New Component", "red"),
    o("New Design", "pink"), o("On SIte Visit", "gray"), o("Pitch Design", "green"), o("Prototype", "orange"),
    o("Prototype Walkthrough"), o("Sitemap", "green"), o("Sitemap Review", "gray"), o("Typography Selection"),
    o("UI tweak", "green"), o("Uplift Design", "red"), o("User Flow Creation", "gray"), o("User Flow Exploration", "orange"),
    o("UX Research", "brown"), o("Video Editing", "purple"), o("Visual Direction", "blue"), o("Workshop", "red"),
  ],
  status: [o("Not started"), o("In progress", "blue"), o("Done", "green")],
  priority: [o("High", "red"), o("Medium", "yellow"), o("Low", "green")],
  effort: [o("Small", "green"), o("Medium", "yellow"), o("Large", "red")],
};
