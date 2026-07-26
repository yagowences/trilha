import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.confirm");
  const tApp = await getTranslations("app");
  return { title: `${t("title")} — ${tApp("name")}` };
}

export default async function ConfirmePage() {
  const t = await getTranslations("auth.confirm");
  const tApp = await getTranslations("app");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-display-l text-ink">{tApp("name")}</h1>
      <p className="text-body text-ink">{t("body")}</p>
      <p className="text-body-sm text-ink">
        <Link href="/login" className="text-trail underline underline-offset-4">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
