import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Sem segmento [locale] na URL — ver lib/i18n/config.ts. O plugin só precisa
// saber onde mora o getRequestConfig.
const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
