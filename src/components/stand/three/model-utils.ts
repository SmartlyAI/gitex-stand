import { Color } from "three";
import { StandElement } from "@/lib/types";

export function tone(color: string, amount: number) {
  const next = new Color(color);
  const target = amount >= 0 ? new Color("#ffffff") : new Color("#111827");
  next.lerp(target, Math.min(Math.abs(amount), 1));
  return `#${next.getHexString()}`;
}

export function getElementHeight(element: StandElement) {
  switch (element.catalogId) {
    case "bar_central":
      return 1.15;
    case "comptoir_accueil":
      return 1.05;
    case "canape":
      return 0.88;
    case "fauteuil":
      return 0.86;
    case "tabouret_haut":
      return 0.78;
    case "pouf":
      return 0.48;
    case "table_demo":
      return 1.02;
    case "table_haute":
      return 1.04;
    case "table_basse":
      return 0.42;
    case "ecran_pied":
      return 2.28;
    case "totem":
      return 2.15;
    case "mur_image":
      return 2.3;
    case "plante":
      return 1.55;
    case "tapis":
      return 0.03;
    default:
      if (element.category === "texte") {
        return 1.4;
      }
      if (element.category === "decoration") {
        return 1.2;
      }
      return 1;
  }
}

export function getElementFootprint(element: StandElement) {
  if (element.category === "texte") {
    return {
      width: Math.max(element.width, 1),
      depth: 0.12,
    };
  }

  return {
    width: element.width,
    depth: element.height,
  };
}
