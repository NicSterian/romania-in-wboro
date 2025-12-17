import { useEffect } from "react";
import { buildDocumentTitle } from "@/lib/seo";

type UsePageTitleOptions = {
  lang?: string;
  includeTagline?: boolean;
};

export function usePageTitle(pageTitle?: string, options?: UsePageTitleOptions) {
  useEffect(() => {
    if (options?.lang) {
      document.documentElement.lang = options.lang;
    }
    document.title = buildDocumentTitle(pageTitle, { includeTagline: options?.includeTagline });
  }, [pageTitle, options?.lang, options?.includeTagline]);
}
