import fs from "node:fs/promises";

const ledgerPath = process.argv[2];
if (!ledgerPath) {
  console.error("Usage: node validate-fidelity-ledger.mjs <ledger.json>");
  process.exit(2);
}

const ledger = JSON.parse(await fs.readFile(ledgerPath, "utf8"));
const width = ledger?.slideSize?.width;
const height = ledger?.slideSize?.height;
const elements = ledger?.elements;
const errors = [];

if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
  errors.push("slideSize.width and slideSize.height must be positive numbers");
}
if (!Array.isArray(elements) || elements.length === 0) {
  errors.push("elements must be a non-empty array");
}

const ids = new Set();
const visualKeys = new Set();
const representations = new Set(["native", "sticker", "background"]);
const backgroundActions = new Set(["remove-before-overlay", "retain", "none"]);
const assetOrigins = new Set(["native-rebuild", "generated", "source-asset", "ambient"]);
const sourceAssetTypes = new Set(["photo", "logo", "brand-asset"]);
const prohibitedCompositeTypes = new Set(["screenshot", "slide-crop", "composite-region"]);
const requiredBooleanFields = ["semantic", "atomic", "editable", "containsText"];
const visualComplexities = new Set(["simple", "complex", "not-applicable"]);
const constructionMethods = new Set([
  "native-text",
  "native-shapes",
  "native-connector",
  "generated-image",
  "source-asset",
  "ambient"
]);
const iconLikeTypes = new Set([
  "icon",
  "pictogram",
  "device",
  "character",
  "illustration",
  "3d-illustration"
]);
const iconBooleanFields = ["referenceIsEmoji", "usesEmoji", "usesSymbolFont", "usesClipart"];

const pointInside = ([x, y]) =>
  Number.isFinite(x) &&
  Number.isFinite(y) &&
  x >= 0 &&
  y >= 0 &&
  x <= width &&
  y <= height;

for (const [index, element] of (elements || []).entries()) {
  const label = element?.id || `elements[${index}]`;
  if (typeof element?.id !== "string" || !element.id) {
    errors.push(`${label}: id is required`);
  } else if (ids.has(element.id)) {
    errors.push(`${label}: duplicate id`);
  } else {
    ids.add(element.id);
  }

  if (typeof element?.visualKey !== "string" || !element.visualKey) {
    errors.push(`${label}: visualKey is required`);
  } else if (visualKeys.has(element.visualKey)) {
    errors.push(`${label}: duplicate visualKey violates the single-visual-layer invariant`);
  } else {
    visualKeys.add(element.visualKey);
  }

  if (!Number.isInteger(element?.slide) || element.slide < 1) {
    errors.push(`${label}: slide must be a positive integer`);
  }
  if (!representations.has(element?.representation)) {
    errors.push(`${label}: representation must be native, sticker, or background`);
  }
  if (!backgroundActions.has(element?.backgroundAction)) {
    errors.push(`${label}: invalid backgroundAction`);
  }

  for (const field of requiredBooleanFields) {
    if (typeof element?.[field] !== "boolean") {
      errors.push(`${label}: ${field} must be a boolean`);
    }
  }

  if (!assetOrigins.has(element?.assetOrigin)) {
    errors.push(
      `${label}: assetOrigin must be native-rebuild, generated, source-asset, or ambient; source-crop is prohibited`
    );
  }

  if (!visualComplexities.has(element?.visualComplexity)) {
    errors.push(`${label}: visualComplexity must be simple, complex, or not-applicable`);
  }
  if (!constructionMethods.has(element?.constructionMethod)) {
    errors.push(
      `${label}: constructionMethod must be native-text, native-shapes, native-connector, generated-image, source-asset, or ambient`
    );
  }

  const isIconLike = iconLikeTypes.has(element?.type);
  if (isIconLike) {
    for (const field of iconBooleanFields) {
      if (typeof element?.[field] !== "boolean") {
        errors.push(`${label}: icon-like elements require boolean ${field}`);
      }
    }

    if (element?.usesSymbolFont === true) {
      errors.push(`${label}: symbol-font glyphs cannot substitute for reference icons`);
    }
    if (element?.usesClipart === true) {
      errors.push(`${label}: clipart cannot substitute for reference icons`);
    }
    if (element?.usesEmoji === true) {
      if (element?.referenceIsEmoji !== true) {
        errors.push(`${label}: Emoji is allowed only when the reference itself is Emoji`);
      }
      if (
        element?.representation !== "native" ||
        element?.constructionMethod !== "native-text" ||
        element?.containsText !== true ||
        element?.visualComplexity !== "simple"
      ) {
        errors.push(
          `${label}: a reference-native Emoji must be simple native text, not a generated or complex icon substitute`
        );
      }
    }

    if (element?.visualComplexity === "complex") {
      if (
        element?.representation !== "sticker" ||
        element?.assetOrigin !== "generated" ||
        element?.constructionMethod !== "generated-image" ||
        element?.containsText !== false
      ) {
        errors.push(
          `${label}: complex icon-like visuals must use a text-free generated sticker; primitive native shapes and Emoji are prohibited`
        );
      }
    }
  }

  if (
    !Array.isArray(element?.semanticRoles) ||
    element.semanticRoles.some((role) => typeof role !== "string" || !role.trim())
  ) {
    errors.push(`${label}: semanticRoles must be an array of non-empty strings`);
  } else if (element?.semantic === true && element.semanticRoles.length !== 1) {
    errors.push(`${label}: each semantic element must have exactly one semantic role`);
  } else if (element?.semantic === false && element.semanticRoles.length !== 0) {
    errors.push(`${label}: non-semantic elements cannot declare semantic roles`);
  }

  if (element?.atomic !== true) {
    errors.push(`${label}: every final element must be atomic and independently selectable`);
  }
  if (element?.semantic === true && element?.editable !== true) {
    errors.push(`${label}: semantic elements must be editable`);
  }
  if (element?.semantic === true && element?.representation === "background") {
    errors.push(`${label}: semantic elements cannot be retained in the background`);
  }
  if (element?.containsText === true && element?.representation !== "native") {
    errors.push(`${label}: every visible text element must use a native representation`);
  }
  if (prohibitedCompositeTypes.has(element?.type)) {
    errors.push(`${label}: screenshot, slide-crop, and composite-region objects are prohibited`);
  }

  if (element?.representation === "native") {
    if (element?.editable !== true) {
      errors.push(`${label}: native elements must be editable`);
    }
    if (element?.assetOrigin !== "native-rebuild") {
      errors.push(`${label}: native elements must use assetOrigin=native-rebuild`);
    }
    const expectedNativeMethod =
      element?.type === "connector"
        ? "native-connector"
        : element?.containsText === true
          ? "native-text"
          : "native-shapes";
    if (element?.constructionMethod !== expectedNativeMethod) {
      errors.push(`${label}: native ${element?.type || "element"} must use constructionMethod=${expectedNativeMethod}`);
    }
  }

  if (element?.representation === "sticker") {
    if (element?.editable !== true) {
      errors.push(`${label}: sticker elements must be independently editable`);
    }
    if (element?.atomic !== true) {
      errors.push(`${label}: a sticker may contain only one indivisible visual singleton`);
    }
    if (element?.containsText !== false) {
      errors.push(`${label}: generated or raster stickers cannot contain visible text`);
    }
    if (
      !Array.isArray(element?.visibleSubcomponents) ||
      element.visibleSubcomponents.length === 0 ||
      element.visibleSubcomponents.some(
        (component) => typeof component !== "string" || !component.trim()
      )
    ) {
      errors.push(
        `${label}: stickers require a non-empty visibleSubcomponents inventory`
      );
    } else if (element.visibleSubcomponents.length !== 1) {
      errors.push(
        `${label}: generation does not make a composite atomic; a sticker must contain exactly one visible subcomponent`
      );
    }
    if (!["generated", "source-asset"].includes(element?.assetOrigin)) {
      errors.push(`${label}: stickers must be newly generated or an allowed independent source asset`);
    }
    const expectedStickerMethod =
      element?.assetOrigin === "source-asset" ? "source-asset" : "generated-image";
    if (element?.constructionMethod !== expectedStickerMethod) {
      errors.push(`${label}: sticker must use constructionMethod=${expectedStickerMethod}`);
    }
    if (element?.assetOrigin === "source-asset" && !sourceAssetTypes.has(element?.type)) {
      errors.push(`${label}: source-asset is allowed only for photo, logo, or brand-asset types`);
    }
  }

  if (element?.representation === "background") {
    if (element?.semantic !== false) {
      errors.push(`${label}: backgrounds must be non-semantic`);
    }
    if (element?.editable !== false) {
      errors.push(`${label}: backgrounds must use editable=false`);
    }
    if (element?.containsText !== false) {
      errors.push(`${label}: backgrounds cannot contain visible text`);
    }
    if (element?.assetOrigin !== "ambient") {
      errors.push(`${label}: backgrounds must use assetOrigin=ambient`);
    }
    if (element?.constructionMethod !== "ambient") {
      errors.push(`${label}: backgrounds must use constructionMethod=ambient`);
    }
    if (element?.visualComplexity !== "not-applicable") {
      errors.push(`${label}: backgrounds must use visualComplexity=not-applicable`);
    }
  }

  if (
    (element?.representation === "native" || element?.representation === "sticker") &&
    element?.backgroundAction === "retain"
  ) {
    errors.push(`${label}: native/sticker element cannot retain the same source pixels`);
  }
  if (element?.representation === "background" && element?.backgroundAction !== "retain") {
    errors.push(`${label}: background representation must use backgroundAction=retain`);
  }

  if (element?.bbox !== undefined) {
    if (
      !Array.isArray(element.bbox) ||
      element.bbox.length !== 4 ||
      element.bbox.some((value) => !Number.isFinite(value))
    ) {
      errors.push(`${label}: bbox must be [x,y,width,height]`);
    } else {
      const [x, y, w, h] = element.bbox;
      if (w < 0 || h < 0 || x < 0 || y < 0 || x + w > width || y + h > height) {
        errors.push(`${label}: bbox lies outside slide bounds`);
      }
      const areaRatio = (w * h) / (width * height);
      if (
        element?.semantic === true &&
        element?.representation === "sticker" &&
        areaRatio >= 0.3 &&
        (typeof element?.largeAssetJustification !== "string" ||
          !element.largeAssetJustification.trim())
      ) {
        errors.push(
          `${label}: semantic stickers covering 30% or more of the slide require largeAssetJustification`
        );
      }
    }
  }

  if (element?.points !== undefined) {
    if (
      !Array.isArray(element.points) ||
      element.points.length < 2 ||
      element.points.some((point) => !Array.isArray(point) || point.length !== 2 || !pointInside(point))
    ) {
      errors.push(`${label}: points must contain at least two in-bounds [x,y] coordinates`);
    }
  }

  if (element?.type === "connector" && !Array.isArray(element?.points)) {
    errors.push(`${label}: connector requires points`);
  }
}

if (errors.length) {
  console.error(`Fidelity ledger validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const connectors = elements.filter((element) => element.type === "connector");
for (const connector of connectors) {
  if (connector.points.length === 2) {
    const [[x1, y1], [x2, y2]] = connector.points;
    connector.angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  }
}

console.log(
  `PASS: ${elements.length} elements, ${ids.size} unique ids, ${visualKeys.size} unique visual layers, ${connectors.length} connectors`
);
