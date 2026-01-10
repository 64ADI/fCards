import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TosPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>Privacy Policy for 64jsx — Last updated: August 15, 2025</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <section className="mt-4">
            <h3 className="font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              1. Introduction
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/80">
              This Privacy Policy explains how we process and protect the personal data of users of 64jsx.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h3 className="font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 3h18v18H3z" />
                <path d="M7 14l5-5 5 5" />
              </svg>
              2. Data We Collect
            </h3>
            <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground/80">
              <li>IP address</li>
              <li>Browser data</li>
              <li>Contact form information</li>
              <li>Cookies</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section>
            <h3 className="font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" />
                <path d="M7 10V6a5 5 0 0 1 10 0v4" />
              </svg>
              3. Purpose of Processing
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/80">We process data to:</p>
            <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground/80">
              <li>Provide and operate our services</li>
              <li>Communicate with users</li>
              <li>Improve service quality</li>
              <li>Perform statistical analyses</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section>
            <h3 className="font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" />
                <path d="M7 12V7a5 5 0 0 1 10 0v5" />
              </svg>
              4. Cookies
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/80">
              The site uses cookies to collect information about users. You can set your cookie preferences in your browser settings.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h3 className="font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2l4 4-4 4-4-4 4-4z" />
                <path d="M6 14v6h12v-6" />
              </svg>
              5. Data Security
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/80">We use appropriate technical and organizational measures to protect personal data against unauthorized access, loss, or destruction.</p>
          </section>

          <Separator className="my-6" />

          <section>
            <h3 className="font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 6v6a2 2 0 0 1-2 2H7l-4 4V8a2 2 0 0 1 2-2h16z" />
              </svg>
              6. Your Rights
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/80">You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 text-sm text-muted-foreground/80">
              <li>Access your data</li>
              <li>Rectify your data</li>
              <li>Delete your data</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section>
            <h3 className="font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 12h-6" />
                <path d="M12 2v6" />
                <path d="M2 12h6" />
                <path d="M12 22v-6" />
              </svg>
              7. Contact
            </h3>
            <p className="mt-2 text-sm text-muted-foreground/80">For privacy-related inquiries, contact: <a className="underline" href="mailto:64jsx@proton.me">64jsx@proton.me</a></p>
          </section>

          <Separator className="my-6" />

          <p className="text-sm text-muted-foreground/80">We reserve the right to make changes to this Privacy Policy. All changes will be posted on this page.</p>
        </CardContent>
      </Card>
    </main>
  );
}
