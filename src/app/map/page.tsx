import fs from "node:fs/promises";
import path from "node:path";
import MapPageClient from "./MapPageClient";

export const revalidate = false;
export const dynamic = "error"; // ensure SSG only

function normalizeSvg(text: string) {
  return text.replace(/title="Compostela Valley"/g, 'title="Davao de Oro"');
}

function extractProvinceIds(svgText: string): string[] {
  const matches = svgText.match(/id="PH-[^"]+"/g) || [];
  return matches
    .map((m) => m.match(/id="([^"]+)"/)?.[1])
    .filter(Boolean) as string[];
}

export default async function MapPage() {
  const svgPath = path.join(process.cwd(), "public", "philippines.svg");
  const svgRaw = await fs.readFile(svgPath, "utf8");
  const normalizedSvg = normalizeSvg(svgRaw);
  const ids = extractProvinceIds(normalizedSvg);

  return (
    <MapPageClient
      initialSvgContent={normalizedSvg}
      initialValidProvinceIds={ids}
    />
  );
}
