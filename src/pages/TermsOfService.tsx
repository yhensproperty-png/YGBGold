import { SEO } from '../components/SEO';

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Terms of Service for Yhen's Property - Review the terms and conditions for using our real estate listing platform."
      />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last Updated: February 21, 2026</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                Welcome to Yhen's Property. By accessing or using our website and services, you agree to be bound by these
                Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms,
                you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Services</h2>
              <p className="mb-3">Yhen's Property provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>An online platform for viewing real estate property listings</li>
                <li>Tools for property search and filtering</li>
                <li>Contact forms to connect prospective buyers with property sellers</li>
                <li>Property listing submission services for sellers</li>
                <li>Information and resources related to real estate</li>
              </ul>
              <p className="mt-3">
                We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="mb-3">
                When creating an account on our platform, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="mt-3">
                You must be at least 18 years old to create an account and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Property Listings</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">4.1 Listing Accuracy</h3>
                  <p>
                    All property information, including descriptions, prices, images, and availability, is provided by property
                    owners or their authorized representatives. While we strive to ensure accuracy, Yhen's Property does not
                    guarantee the completeness or reliability of any listing information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">4.2 Listing Submissions</h3>
                  <p>By submitting a property listing, you warrant that:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>You have the legal right to list the property</li>
                    <li>All information provided is accurate and current</li>
                    <li>You own or have permission to use all submitted images</li>
                    <li>The listing does not violate any laws or third-party rights</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">4.3 Listing Moderation</h3>
                  <p>
                    We reserve the right to review, edit, or remove any property listing that violates these terms,
                    contains inappropriate content, or is deemed unsuitable for our platform.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any illegal purpose or to violate any laws</li>
                <li>Submit false, misleading, or fraudulent property listings</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Transmit viruses, malware, or any malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Scrape, copy, or download content without permission</li>
                <li>Use automated systems or bots to access the service</li>
                <li>Spam or send unsolicited communications to other users</li>
                <li>Interfere with or disrupt the service or servers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
              <p className="mb-3">
                The content on this website, including text, graphics, logos, images, and software, is the property of
                Yhen's Property or its content suppliers and is protected by intellectual property laws.
              </p>
              <p className="mb-3">
                You may not reproduce, distribute, modify, or create derivative works from our content without express
                written permission. Property listings and images remain the property of their respective owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. User-Generated Content</h2>
              <p className="mb-3">
                By submitting content to our platform (including property listings, reviews, or comments), you grant
                Yhen's Property a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display
                such content in connection with our services.
              </p>
              <p>
                You retain ownership of your content and are responsible for ensuring it does not infringe on any
                third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Links and Services</h2>
              <p>
                Our website may contain links to third-party websites or services. We are not responsible for the content,
                privacy policies, or practices of any third-party sites. Your use of third-party services is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations of Liability</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">9.1 No Warranty</h3>
                  <p>
                    Our services are provided "as is" and "as available" without any warranties of any kind, either express
                    or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">9.2 Real Estate Transactions</h3>
                  <p>
                    Yhen's Property is a listing platform only. We are not a party to any real estate transaction between
                    buyers and sellers. We do not provide real estate brokerage, legal, or financial advice. All transactions
                    are between the buyer and seller, and we recommend consulting qualified professionals.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">9.3 Limitation of Liability</h3>
                  <p>
                    To the fullest extent permitted by law, Yhen's Property shall not be liable for any indirect, incidental,
                    special, consequential, or punitive damages arising from your use of our services, including but not limited
                    to property transactions, lost profits, or data loss.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Yhen's Property, its affiliates, officers, directors, employees,
                and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from
                your use of the service, violation of these terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account and access to our services at any time, without
                prior notice, for any reason, including violation of these terms. Upon termination, your right to use the
                service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <p className="mb-3">
                Any disputes arising from these terms or your use of our services shall be resolved through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Good faith negotiation between the parties</li>
                <li>Binding arbitration if negotiation fails</li>
                <li>Governing law of [Your Jurisdiction]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately
                upon posting to the website. Your continued use of our services after changes constitutes acceptance of
                the modified terms. We encourage you to review these terms periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Severability</h2>
              <p>
                If any provision of these terms is found to be unenforceable or invalid, that provision will be limited or
                eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Entire Agreement</h2>
              <p>
                These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and
                Yhen's Property regarding the use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="mb-3">
                For questions or concerns about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Yhen's Property</p>
                <p className="mt-2">Email: legal@yhensproperty.com</p>
                <p>Phone: [Your Phone Number]</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                By using Yhen's Property, you acknowledge that you have read, understood, and agree to be bound by these
                Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
