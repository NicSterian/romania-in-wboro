export const SITE_NAME = "Scoala Romaneasca Wellingborough";
export const SITE_TAGLINE = "Romanian Weekend School";

type BuildDocumentTitleOptions = {
  includeTagline?: boolean;
};

export function buildDocumentTitle(pageTitle?: string, options?: BuildDocumentTitleOptions) {
  const cleaned = pageTitle?.trim();
  if (!cleaned) {
    return options?.includeTagline ? `${SITE_NAME} | ${SITE_TAGLINE}` : SITE_NAME;
  }
  if (cleaned.toLowerCase() === SITE_NAME.toLowerCase()) return SITE_NAME;
  return `${cleaned} | ${SITE_NAME}`;
}
