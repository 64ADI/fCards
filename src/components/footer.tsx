import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">64jsx</span>
          <a
            href="https://github.com/64ADI"
            target="_blank"
            rel="noreferrer"
            aria-label="64ADI GitHub"
            className="text-muted-foreground/80 hover:text-muted-foreground transition-colors ml-2"
          >
            {/* GitHub icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .5C5.73.5.75 5.48.75 11.74c0 4.93 3.19 9.11 7.62 10.59.56.1.77-.24.77-.54 0-.27-.01-1.17-.02-2.12-3.1.67-3.76-1.49-3.76-1.49-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .17 1.56-.75 1.56-.75.99-1.69 2.6-1.2 3.23-.92.1-.72.39-1.2.7-1.47-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.4.11-2.92 0 0 .95-.3 3.12 1.15.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.17-1.46 3.12-1.15 3.12-1.15.61 1.52.23 2.64.11 2.92.72.78 1.16 1.78 1.16 3 0 4.29-2.62 5.24-5.11 5.52.4.34.76 1 .76 2.02 0 1.46-.01 2.64-.01 3c0 .3.2.65.78.54 4.43-1.49 7.61-5.67 7.61-10.6C23.25 5.48 18.27.5 12 .5z" />
            </svg>
          </a>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/tos" className="hover:underline">Terms</Link>
          <div className="text-muted-foreground/80">© {year}</div>
        </div>
      </div>
    </footer>
  );
}
