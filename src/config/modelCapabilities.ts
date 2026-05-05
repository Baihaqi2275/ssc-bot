import { VISION_MODEL_IDS, WEB_SEARCH_MODEL_IDS } from "./groqModels";

export function supportsVision(modelId: string) {
  return VISION_MODEL_IDS.has(modelId);
}

export function supportsWebSearch(modelId: string) {
  return WEB_SEARCH_MODEL_IDS.has(modelId);
}
