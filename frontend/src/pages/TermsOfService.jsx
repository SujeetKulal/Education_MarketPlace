import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import Footer from '../components/layout/Footer'

export default function TermsOfService() {
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
                <FileText size={22} color="var(--primary)" />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Terms of Service</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 36 }}>Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            {[
              {
                title: '1. Acceptance of Terms',
                body: 'By accessing and using EduMarket, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'
              },
              {
                title: '2. Use of the Platform',
                body: 'EduMarket is an educational marketplace where authors can publish and sell study materials (PDFs, video lessons, MCQ tests) and students can purchase and access them. You agree to use the platform only for lawful purposes and in accordance with these terms.'
              },
              {
                title: '3. User Accounts',
                body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.'
              },
              {
                title: '4. Purchases & Payments',
                body: 'All purchases are final. Due to the digital nature of our educational materials, we do not offer refunds once access has been granted. Please review material details carefully before purchasing. Payments are processed securely through Razorpay.'
              },
              {
                title: '5. Intellectual Property',
                body: 'All content published on EduMarket remains the intellectual property of the respective authors. Purchasing a material grants you a personal, non-transferable license to access and use that material for your own educational purposes. Redistribution, resale, or commercial use is strictly prohibited.'
              },
              {
                title: '6. Author Responsibilities',
                body: 'Authors publishing materials on EduMarket warrant that they own or have the necessary rights to the content they upload, that the content does not infringe any third-party rights, and that the content is accurate and suitable for educational purposes.'
              },
              {
                title: '7. Community Forum',
                body: 'When participating in the community forum, you agree to be respectful of other users, not to post spam, offensive, or harmful content, and not to share copyrighted material without permission. We reserve the right to remove content and ban users who violate these guidelines.'
              },
              {
                title: '8. Limitation of Liability',
                body: 'EduMarket provides the platform "as is" and makes no warranties, express or implied, regarding the accuracy or completeness of educational materials. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.'
              },
              {
                title: '9. Modifications',
                body: 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will make reasonable efforts to notify users of significant changes.'
              },
              {
                title: '10. Governing Law',
                body: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.'
              },
            ].map(({ title, body }) => (
              <div key={title} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}

            <div style={{ marginTop: 40, padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                <strong>Questions?</strong> If you have any questions about these Terms of Service, please visit our <Link to="/forums">Community Forum</Link> or reach out via the support channels available there.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
