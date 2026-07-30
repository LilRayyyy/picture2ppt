import fs from "node:fs/promises";
import path from "node:path";

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("Usage: node validate-visual-qa.mjs <visual-qa-report.json>");
  process.exit(2);
}

const absoluteReportPath = path.resolve(reportPath);
const reportDirectory = path.dirname(absoluteReportPath);
const report = JSON.parse(await fs.readFile(absoluteReportPath, "utf8"));
const deckWidth = report?.deckSize?.width;
const deckHeight = report?.deckSize?.height;
const slides = report?.slides;
const errors = [];

const MAX_ASPECT_ERROR = 0.002;
const MAX_ANCHOR_CENTER_DRIFT = 0.012;
const MAX_ANCHOR_SIZE_DRIFT = 0.025;
const MAX_CONNECTOR_POINT_DRIFT = 0.012;

const positive = (value) => Number.isFinite(value) && value > 0;
const validBox = (box) =>
  Array.isArray(box) &&
  box.length === 4 &&
  box.every(Number.isFinite) &&
  box[0] >= 0 &&
  box[1] >= 0 &&
  box[2] >= 0 &&
  box[3] >= 0 &&
  box[0] + box[2] <= deckWidth &&
  box[1] + box[3] <= deckHeight;
const validPoint = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  point.every(Number.isFinite) &&
  point[0] >= 0 &&
  point[1] >= 0 &&
  point[0] <= deckWidth &&
  point[1] <= deckHeight;
const normalizedPointDistance = (a, b) =>
  Math.hypot(a[0] - b[0], a[1] - b[1]) /
  Math.hypot(deckWidth, deckHeight);

if (!positive(deckWidth) || !positive(deckHeight)) {
  errors.push("deckSize.width and deckSize.height must be positive numbers");
}
if (report?.structureQaPassed !== true) {
  errors.push("structureQaPassed must be true");
}
if (report?.visualQaPassed !== true) {
  errors.push("top-level visualQaPassed must be true");
}
if (!Array.isArray(slides) || slides.length === 0) {
  errors.push("slides must be a non-empty array");
}

const slideNumbers = new Set();
for (const [index, slide] of (slides || []).entries()) {
  const label = `slide ${slide?.slide ?? index + 1}`;
  if (!Number.isInteger(slide?.slide) || slide.slide < 1) {
    errors.push(`${label}: slide must be a positive integer`);
  } else if (slideNumbers.has(slide.slide)) {
    errors.push(`${label}: duplicate slide number`);
  } else {
    slideNumbers.add(slide.slide);
  }

  const referenceWidth = slide?.referenceSize?.width;
  const referenceHeight = slide?.referenceSize?.height;
  if (!positive(referenceWidth) || !positive(referenceHeight)) {
    errors.push(`${label}: referenceSize must contain positive width and height`);
  }

  if (!validBox(slide?.contentFrame)) {
    errors.push(`${label}: contentFrame must be an in-bounds [x,y,width,height] box`);
  } else if (positive(referenceWidth) && positive(referenceHeight)) {
    const referenceRatio = referenceWidth / referenceHeight;
    const frameRatio = slide.contentFrame[2] / slide.contentFrame[3];
    const aspectError = Math.abs(frameRatio - referenceRatio) / referenceRatio;
    if (aspectError > MAX_ASPECT_ERROR) {
      errors.push(
        `${label}: contentFrame aspect ratio differs from the reference by ${(aspectError * 100).toFixed(2)}%`
      );
    }
  }

  if (!["exact", "contain"].includes(slide?.fitMode)) {
    errors.push(`${label}: fitMode must be exact or contain; reflow, stretch, and crop are prohibited`);
  }
  if (slide?.reflowed === true && slide?.userRequestedReflow !== true) {
    errors.push(`${label}: reference was reflowed without an explicit user request`);
  }
  if (slide?.renderedAfterLastEdit !== true) {
    errors.push(`${label}: final render must be produced after the last edit`);
  }
  if (slide?.fullSizeInspected !== true) {
    errors.push(`${label}: comparison must be inspected at full size`);
  }

  const artifacts = slide?.comparisonArtifacts;
  for (const key of ["reference", "final", "overlay", "difference"]) {
    const value = artifacts?.[key];
    if (typeof value !== "string" || !value.trim()) {
      errors.push(`${label}: comparisonArtifacts.${key} is required`);
      continue;
    }
    const artifactPath = path.resolve(reportDirectory, value);
    try {
      const stat = await fs.stat(artifactPath);
      if (!stat.isFile() || stat.size === 0) {
        errors.push(`${label}: comparison artifact is empty: ${value}`);
      }
    } catch {
      errors.push(`${label}: comparison artifact does not exist: ${value}`);
    }
  }

  if (!Array.isArray(slide?.keyAnchors) || slide.keyAnchors.length === 0) {
    errors.push(`${label}: keyAnchors must contain at least one reviewed anchor`);
  }
  for (const [anchorIndex, anchor] of (slide?.keyAnchors || []).entries()) {
    const anchorLabel = `${label} anchor ${anchor?.id || anchorIndex + 1}`;
    if (typeof anchor?.id !== "string" || !anchor.id.trim()) {
      errors.push(`${anchorLabel}: id is required`);
    }
    if (!validBox(anchor?.referenceBox) || !validBox(anchor?.finalBox)) {
      errors.push(`${anchorLabel}: referenceBox and finalBox must be in-bounds boxes`);
      continue;
    }
    if (anchor?.styleMatch !== true) {
      errors.push(`${anchorLabel}: styleMatch must be true`);
    }
    if (anchor?.zOrderMatch !== true) {
      errors.push(`${anchorLabel}: zOrderMatch must be true`);
    }
    if (anchor?.critical === true) {
      const [rx, ry, rw, rh] = anchor.referenceBox;
      const [fx, fy, fw, fh] = anchor.finalBox;
      const referenceCenter = [rx + rw / 2, ry + rh / 2];
      const finalCenter = [fx + fw / 2, fy + fh / 2];
      const centerDrift = normalizedPointDistance(referenceCenter, finalCenter);
      const widthDrift = Math.abs(fw - rw) / deckWidth;
      const heightDrift = Math.abs(fh - rh) / deckHeight;
      if (centerDrift > MAX_ANCHOR_CENTER_DRIFT) {
        errors.push(`${anchorLabel}: critical anchor center drift exceeds the visual gate`);
      }
      if (
        widthDrift > MAX_ANCHOR_SIZE_DRIFT ||
        heightDrift > MAX_ANCHOR_SIZE_DRIFT
      ) {
        errors.push(`${anchorLabel}: critical anchor size drift exceeds the visual gate`);
      }
    }
  }

  if (!Array.isArray(slide?.connectors)) {
    errors.push(`${label}: connectors must be an array`);
  }
  for (const [connectorIndex, connector] of (slide?.connectors || []).entries()) {
    const connectorLabel = `${label} connector ${connector?.id || connectorIndex + 1}`;
    if (
      !Array.isArray(connector?.referencePoints) ||
      !Array.isArray(connector?.finalPoints) ||
      connector.referencePoints.length < 2 ||
      connector.referencePoints.length !== connector.finalPoints.length ||
      connector.referencePoints.some((point) => !validPoint(point)) ||
      connector.finalPoints.some((point) => !validPoint(point))
    ) {
      errors.push(
        `${connectorLabel}: referencePoints and finalPoints must contain matching in-bounds points`
      );
      continue;
    }
    for (let pointIndex = 0; pointIndex < connector.referencePoints.length; pointIndex += 1) {
      const drift = normalizedPointDistance(
        connector.referencePoints[pointIndex],
        connector.finalPoints[pointIndex]
      );
      if (drift > MAX_CONNECTOR_POINT_DRIFT) {
        errors.push(`${connectorLabel}: point ${pointIndex + 1} drift exceeds the visual gate`);
      }
    }
    if (connector?.styleMatch !== true) {
      errors.push(`${connectorLabel}: styleMatch must be true`);
    }
    if (connector?.arrowheadDirectionVerified !== true) {
      errors.push(`${connectorLabel}: arrowhead direction must be verified`);
    }
    if (connector?.sourcePixelsRemoved !== true) {
      errors.push(`${connectorLabel}: old source pixels must be removed`);
    }
  }

  if (
    !Array.isArray(slide?.unresolvedCriticalDifferences) ||
    slide.unresolvedCriticalDifferences.some(
      (difference) => typeof difference !== "string"
    )
  ) {
    errors.push(`${label}: unresolvedCriticalDifferences must be an array of strings`);
  } else if (slide.unresolvedCriticalDifferences.length > 0) {
    errors.push(`${label}: unresolved critical visual differences remain`);
  }
  if (slide?.visualQaPassed !== true) {
    errors.push(`${label}: visualQaPassed must be true`);
  }
}

if (errors.length) {
  console.error(
    `Visual QA validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `PASS: ${slides.length} slide${slides.length === 1 ? "" : "s"}, ${slides.reduce(
    (sum, slide) => sum + slide.keyAnchors.length,
    0
  )} reviewed anchors, ${slides.reduce(
    (sum, slide) => sum + slide.connectors.length,
    0
  )} reviewed connectors`
);
