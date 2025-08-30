
// src/app/policy/privacy/page.tsx
export default function PrivacyPolicyPage() {
  return (
    <article>
      <h1>Privacy Policy for FinPulse</h1>
      <p>
        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
      </p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to FinPulse. We are committed to protecting your privacy. This
        Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our application. Please read this privacy
        policy carefully. If you do not agree with the terms of this privacy
        policy, please do not access the application.
      </p>

      <h2>2. Collection of Your Information</h2>
      <p>
        We may collect information about you in a variety of ways. The
        information we may collect via the Application includes:
      </p>
      <ul>
        <li>
          <strong>Personal Data:</strong> Personally identifiable information,
          such as your name, email address, and demographic information, that
          you voluntarily give to us when you register with the Application.
        </li>
        <li>
          <strong>Financial Data:</strong> Financial information, such as data
          related to your income, expenses, transactions, and financial goals,
          that you voluntarily provide when using our application's features.
          This data is stored securely and is only accessible to you.
        </li>
        <li>
          <strong>Data from Social Networks:</strong> User information from social
          networking sites, such as Google, including your name, your social
          network username, location, gender, birth date, email address, and
          profile picture, if you connect your account to such social networks.
        </li>
      </ul>

      <h2>3. Use of Your Information</h2>
      <p>
        Having accurate information about you permits us to provide you with a
        smooth, efficient, and customized experience. Specifically, we may use
        information collected about you via the Application to:
      </p>
      <ul>
        <li>Create and manage your account.</li>
        <li>
          Provide you with personalized financial advice and insights.
        </li>
        <li>
          Monitor and analyze usage and trends to improve your experience with
          the Application.
        </li>
        <li>Notify you of updates to the Application.</li>
        <li>
          Compile anonymous statistical data and analysis for use internally or
          with third parties.
        </li>
      </ul>

      <h2>4. Security of Your Information</h2>
      <p>
        We use administrative, technical, and physical security measures to
        help protect your personal information. While we have taken reasonable
        steps to secure the personal information you provide to us, please be
        aware that despite our efforts, no security measures are perfect or
        impenetrable, and no method of data transmission can be guaranteed
        against any interception or other type of misuse.
      </p>
      
       <h2>5. Policy for Children</h2>
        <p>We do not knowingly solicit information from or market to children under the age of 13. If we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible. If you believe we might have any information from or about a child under 13, please contact us.</p>


      <h2>6. Contact Us</h2>
      <p>
        If you have questions or comments about this Privacy Policy, please
        contact us at: [Your Contact Email]
      </p>
    </article>
  );
}
