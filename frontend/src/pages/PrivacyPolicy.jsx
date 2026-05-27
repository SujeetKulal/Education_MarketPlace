import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import Footer from '../components/layout/Footer'

export default function PrivacyPolicy() {
  return (
    <>
      <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: '40px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 32 }}>
            <ArrowLeft size={15} /> Back to Home
          </Link>

          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '48px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-ultra-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={22} color="var(--primary)" />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Privacy Policy</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 36 }}>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            {[
              {
                title: '1. Information We Collect',
                body: 'We collect information you provide directly to us when you create an account, such as your name, email address, and profile details. We also collect information about your use of our platform, including materials you purchase, forum posts you create, and your learning activity.'
              },
              {
                title: '2. How We Use Your Information',
                body: 'We use the information we collect to provide, maintain, and improve our services; process transactions and send related information; send you technical notices and support messages; respond to your comments and questions; and to monitor and analyze usage patterns.'
              },
              {
                title: '3. Information Sharing',
                body: 'We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes. We may share your information with service providers who assist us in operating our platform, conducting our business, or servicing you — subject to confidentiality agreements.'
              },
              {
                title: '4. Payment Information',
                body: 'All payment transactions are processed through Razorpay, a secure third-party payment gateway. We do not store your full card details on our servers. Please review Razorpay\'s privacy policy for information about how they handle your payment data.'
              },
              {
                title: '5. Data Security',
                body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is ever fully secure, and we cannot guarantee absolute security.'
              },
              {
                title: '6. Cookies',
                body: 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'
              },
              {
                title: '7. Your Rights',
                body: 'You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us through the community forum or support channels.'
              },
              {
                title: '8. Changes to This Policy',
                body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. Your continued use of the platform after any changes constitutes your acceptance of the new policy.'
              },
            ].map(({ title, body }) => (
              <div key={title} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}

            <div style={{ marginTop: 40, padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                <strong>Questions?</strong> If you have any questions about this Privacy Policy, please visit our <Link to="/forums">Community Forum</Link> or reach out via the support channels available there.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
