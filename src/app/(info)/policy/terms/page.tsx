
// src/app/policy/terms/page.tsx
export default function TermsOfServicePage() {
  return (
    <article>
      <h1>Terms of Service for FinPulse</h1>
      <p>
        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
      </p>

      <h2>1. Agreement to Terms</h2>
      <p>
        By using our application, FinPulse, you agree to be bound by these Terms
        of Service. If you do not agree to these Terms, do not use the
        Application.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        FinPulse is a personal finance application that helps users track their
        finances, set goals, and receive AI-generated financial advice. The
        Service is provided "as is" and is for informational purposes only. It is
        not intended to be a substitute for professional financial advice.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        To use the Application, you must register for an account. You agree to
        provide accurate, current, and complete information during the
        registration process and to update such information to keep it
        accurate, current, and complete. You are responsible for safeguarding
        your password and for all activities that occur under your account.
      </p>
      
      <h2>4. User Conduct</h2>
      <p>
        You agree not to use the Application for any unlawful purpose or in any
        way that could harm, disable, overburden, or impair the Application.
        You also agree not to attempt to gain unauthorized access to any parts
        of the Application or any of its related systems or networks.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        The Application and its original content, features, and functionality
        are and will remain the exclusive property of FinPulse and its
        licensors.
      </p>

      <h2>6. Disclaimer of Warranties</h2>
      <p>
        The Application is provided on an "as is" and "as available" basis.
        FinPulse makes no representations or warranties of any kind, express or
        implied, as to the operation of the Application or the information,
        content, or materials included therein.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        In no event shall FinPulse, nor its directors, employees, partners,
        agents, suppliers, or affiliates, be liable for any indirect,
        incidental, special, consequential or punitive damages, including
        without limitation, loss of profits, data, use, goodwill, or other
        intangible losses, resulting from your access to or use of or inability
        to access or use the Application.
      </p>
      
      <h2>8. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>


      <h2>9. Changes to Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace
        these Terms at any time. We will provide at least 30 days' notice
        prior to any new terms taking effect.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us at: [Your
        Contact Email]
      </p>
    </article>
  );
}
