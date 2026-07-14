export default function Footer({ t, lang = "en" }) {
  const learnHref = `${lang === "en" ? "" : `/${lang}`}/learn/`;
  return (
    <footer className="shrink-0 w-full max-w-7xl mx-auto px-4 md:px-6 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center">
        <span>{t.footer_disclaimer}</span>
        <span className="hidden sm:inline">{t.footer_signs}</span>
        <span>·</span>
        <span>
          {t.footer_made_by}{" "}
          <a href="https://www.linkedin.com/in/thomas-roos/" className="underline hover:text-thermal">
            Thomas Roos
          </a>{" "}
          {t.footer_love_from}
        </span>
        <span>·</span>
        <a className="underline hover:text-thermal" href="https://github.com/Roosted7/ParaPolar">
          GitHub
        </a>
        <span>·</span>
        <a className="underline hover:text-thermal" href={learnHref}>
          {t.nav_learn}
        </a>
        <span>·</span>
        <a className="underline hover:text-thermal" href="/brief/">
          Brief
        </a>
        <span className="hidden md:inline">· {t.footer_thanks_to}: Barbara &amp; Régis; Seb &amp; Arnoud</span>
      </div>
    </footer>
  );
}
