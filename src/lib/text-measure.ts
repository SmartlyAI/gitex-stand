interface TextMeasureOptions {
  text?: string;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
}

let measurementCanvas: HTMLCanvasElement | null = null;

export function measureTextContent({
  text,
  fontSize = 18,
  fontBold = false,
  fontItalic = false,
}: TextMeasureOptions) {
  const content = text && text.length > 0 ? text : "Texte";
  const lines = content.split(/\r?\n/);

  if (typeof document === "undefined") {
    const widthPx =
      Math.max(...lines.map((line) => Math.max(line.length, 1))) * fontSize * 0.58 + 10;
    const heightPx = lines.length * fontSize * 1.15 + 8;

    return {
      widthPx: Math.max(widthPx, fontSize),
      heightPx: Math.max(heightPx, fontSize * 1.2),
    };
  }

  if (!measurementCanvas) {
    measurementCanvas = document.createElement("canvas");
  }

  const context = measurementCanvas.getContext("2d");
  if (!context) {
    return {
      widthPx: Math.max(fontSize * 2, 24),
      heightPx: Math.max(fontSize * 1.2, 24),
    };
  }

  context.font = `${fontItalic ? "italic " : ""}${fontBold ? "700 " : "400 "}${fontSize}px Inter, system-ui, sans-serif`;

  const widthPx =
    Math.max(
      ...lines.map((line) => context.measureText(line || " ").width)
    ) + 10;
  const heightPx = lines.length * fontSize * 1.15 + 8;

  return {
    widthPx: Math.max(widthPx, fontSize),
    heightPx: Math.max(heightPx, fontSize * 1.2),
  };
}
