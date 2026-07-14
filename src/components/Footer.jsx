export default function Footer({ t }) {
  return (
    <footer className="max-w-6xl mx-auto px-4 md:px-6 pb-10 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col items-center gap-1 text-center">
        <p>
          {t.footer_disclaimer} {t.footer_signs}
        </p>
        <p>
          {t.footer_made_by}{" "}
          <a
            href="https://www.linkedin.com/in/thomas-roos/"
            className="underline hover:text-slate-700 dark:hover:text-slate-200"
          >
            Thomas Roos
          </a>{" "}
          {t.footer_love_from}.{" "}
          <a
            className="underline hover:text-slate-700 dark:hover:text-slate-200"
            href="https://github.com/Roosted7/ParaPolar"
          >
            GitHub
          </a>
        </p>
        <p>{t.footer_thanks_to}: Barbara &amp; Régis; Seb &amp; Arnoud</p>
      </div>
    </footer>
  );
}
