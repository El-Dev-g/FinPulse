// src/app/policy/terms/page.tsx

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-semibold font-headline">{title}</h2>
            <div className="space-y-4 text-muted-foreground">{children}</div>
        </section>
    );
}


export default function TermsOfServicePage() {
  return (
    <div className="space-y-12">
        <div className="text-center">
             <h1 className="text-4xl font-bold font-headline">Terms of Service</h1>
             <p className="mt-2 text-lg text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      
      <div className="space-y-8">
        <Section title="1. Agreement to Terms">
            <p>
                By using our application, FinPulse, you agree to be bound by these Terms
                of Service. If you do not agree to these Terms, do not use the
                Application.
            </p>
        </Section>
        
        <Section title="2. Description of Service">
             <p>
                FinPulse is a personal finance application that helps users track their
                finances, set goals, and receive AI-generated financial advice. The
                Service is provided "as is" and is for informational purposes only. It is
                not intended to be a substitute for professional financial advice.
            </p>
        </Section>

        <Section title="3. User Accounts">
             <p>
                To use the Application, you must register for an account. You agree to
                provide accurate, current, and complete information during the
                registration process and to update such information to keep it
                accurate, current, and complete. You are responsible for safeguarding
                your password and for all activities that occur under your account.
            </p>
        </Section>
        
        <Section title="4. User Conduct">
            <p>
                You agree not to use the Application for any unlawful purpose or in any
                way that could harm, disable, overburden, or impair the Application.
                You also agree not to attempt to gain unauthorized access to any parts
                of the Application or any of its related systems or networks.
            </p>
        </Section>

        <Section title="5. Intellectual Property">
            <p>
                The Application and its original content, features, and functionality
                are and will remain the exclusive property of FinPulse and its
                licensors.
            </p>
        </Section>

        <Section title="6. Disclaimer of Warranties">
             <p>
                The Application is provided on an "as is" and "as available" basis.
                FinPulse makes no representations or warranties of any kind, express or
                implied, as to the operation of the Application or the information,
                content, or materials included therein.
            </p>
        </Section>

        <Section title="7. Limitation of Liability">
            <p>
                In no event shall FinPulse, nor its directors, employees, partners,
                agents, suppliers, or affiliates, be liable for any indirect,
                incidental, special, consequential or punitive damages, including
                without limitation, loss of profits, data, use, goodwill, or other
                intangible losses, resulting from your access to or use of or inability
                to access or use the Application.
            </p>
        </Section>
        
        <Section title="8. Governing Law">
            <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>
        </Section>

        <Section title="9. Changes to Terms">
            <p>
                We reserve the right, at our sole discretion, to modify or replace
                these Terms at any time. We will provide at least 30 days' notice
                prior to any new terms taking effect.
            </p>
        </Section>

        <Section title="10. Contact Us">
            <p>
                If you have any questions about these Terms, please contact us at: support@finpulse.example.com
            </p>
        </Section>
      </div>
    </div>
  );
}
