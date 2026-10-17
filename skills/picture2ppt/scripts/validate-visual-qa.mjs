import fs from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {object} VisualAnchor
 * @property {string} [id]
 * @property {boolean} [critical]
 * @property {number[]} [referenceBox]
 * @property {number[]} [finalBox]
 * @property {boolean} [styleMatch]
 * @property {boolean} [zOrderMatch]
 */

/**
 * @typedef {object} VisualConnector
 * @property {string} [id]
 * @property {number[][]} [referencePoints]
 * @property {number[][]} [finalPoints]
 * @property {boolean} [styleMatch]
 * @property {boolean} [arrowheadDirectionVerified]
 * @property {boolean} [sourcePixelsRemoved]
 */

/**
 * @typedef {object} VisualSlide
 * @property {number} [slide]
 * @property {{ width?: number, height?: number }} [referenceSize]
 * @property {number[]} [contentFrame]
 * @property {string} [fitMode]
 * @property {boolean} [reflowed]
 * @property {boolean} [userRequestedReflow]
 * @property {boolean} [renderedAfterLastEdit]
 * @property {boolean} [fullSizeInspected]
 * @property {Record<string, string>} [comparisonArtifacts]
 * @property {VisualAnchor[]} keyAnchors
 * @property {VisualConnector[]} connectors
 * @property {string[]} [unresolvedCriticalDifferences]
 * @property {boolean} [visualQaPassed]
 */

/**
 * @typedef {object} VisualQaReport
 * @property {{ width?: number, height?: number }} [deckSize]
 * @property {boolean} [structureQaPassed]
 * @property {boolean} [visualQaPassed]
 * @property {VisualSlide[]} [slides]
 */

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("Usage: node validate-visual-qa.mjs <visual-qa-report.json>");
  process.exit(2);
}

const absoluteReportPath = path.resolve(reportPath);
const reportDirectory = path.dirname(absoluteReportPath);
const report = /** @type {VisualQaReport} */ (JSON.parse(await fs.readFile(absoluteReportPath, "utf8")));
const deckWidth = /** @type {number} */ (report?.deckSize?.width);
const deckHeight = /** @type {number} */ (report?.deckSize?.height);
const slides = report?.slides;
const errors = [];

const MAX_ASPECT_ERROR = 0.002;
const MAX_ANCHOR_CENTER_DRIFT = 0.012;
const MAX_ANCHOR_SIZE_DRIFT = 0.025;
const MAX_CONNECTOR_POINT_DRIFT = 0.012;

/**
 * Number.isFinite is true only for finite numbers, so the typeof guard does not
 * change which values pass.
 *
 * @param {unknown} value
 * @returns {value is number}
 */
const positive = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;
/**
 * @param {unknown} box
 * @returns {box is number[]}
 */
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
/**
 * @param {unknown} point
 * @returns {point is number[]}
 */
const validPoint = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  point.every(Number.isFinite) &&
  point[0] >= 0 &&
  point[1] >= 0 &&
  point[0] <= deckWidth &&
  point[1] <= deckHeight;
/**
 * @param {number[]} a
 * @param {number[]} b
 */
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
  if (!Number.isInteger(slide?.slide) || /** @type {number} */ (slide.slide) < 1) {
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

  const contentFrame = slide?.contentFrame;
  if (!validBox(contentFrame)) {
    errors.push(`${label}: contentFrame must be an in-bounds [x,y,width,height] box`);
  } else if (positive(referenceWidth) && positive(referenceHeight)) {
    const referenceRatio = referenceWidth / referenceHeight;
    const frameRatio = contentFrame[2] / contentFrame[3];
    const aspectError = Math.abs(frameRatio - referenceRatio) / referenceRatio;
    if (aspectError > MAX_ASPECT_ERROR) {
      errors.push(
        `${label}: contentFrame aspect ratio differs from the reference by ${(aspectError * 100).toFixed(2)}%`
      );
    }
  }

  if (!["exact", "contain"].includes(/** @type {string} */ (slide?.fitMode))) {
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
    const referenceBox = anchor?.referenceBox;
    const finalBox = anchor?.finalBox;
    if (!validBox(referenceBox) || !validBox(finalBox)) {
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
      const [rx, ry, rw, rh] = referenceBox;
      const [fx, fy, fw, fh] = finalBox;
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
    const referencePoints = connector?.referencePoints;
    const finalPoints = connector?.finalPoints;
    if (
      !Array.isArray(referencePoints) ||
      !Array.isArray(finalPoints) ||
      referencePoints.length < 2 ||
      referencePoints.length !== finalPoints.length ||
      referencePoints.some((point) => !validPoint(point)) ||
      finalPoints.some((point) => !validPoint(point))
    ) {
      errors.push(
        `${connectorLabel}: referencePoints and finalPoints must contain matching in-bounds points`
      );
      continue;
    }
    for (let pointIndex = 0; pointIndex < referencePoints.length; pointIndex += 1) {
      const drift = normalizedPointDistance(
        referencePoints[pointIndex],
        finalPoints[pointIndex]
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

const checkedSlides = /** @type {VisualSlide[]} */ (slides);
console.log(
  `PASS: ${checkedSlides.length} slide${checkedSlides.length === 1 ? "" : "s"}, ${checkedSlides.reduce(
    (sum, slide) => sum + slide.keyAnchors.length,
    0
  )} reviewed anchors, ${checkedSlides.reduce(
    (sum, slide) => sum + slide.connectors.length,
    0
  )} reviewed connectors`
);
