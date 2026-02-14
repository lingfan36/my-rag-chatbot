import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['1 site', '5 documents', '100 messages/mo', 'Community support'],
    cta: 'Get Started'
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    features: [
      '3 sites',
      '20 documents/site',
      '2,000 messages/mo',
      'Email support'
    ],
    cta: 'Start Free Trial',
    highlight: true
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/mo',
    features: [
      '10 sites',
      '100 documents/site',
      '10,000 messages/mo',
      'Priority support'
    ],
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/mo',
    features: [
      'Unlimited sites',
      'Unlimited documents',
      '100,000 messages/mo',
      'Dedicated support'
    ],
    cta: 'Contact Sales'
  }
]

const steps = [
  {
    step: '01',
    title: 'Upload Documents',
    desc: 'Add your docs, FAQs, or any text content. We chunk and embed them automatically with vector search.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
    )
  },
  {
    step: '02',
    title: 'Embed the Widget',
    desc: 'Copy a single script tag and paste it into your website. Customize colors, position, and branding.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    )
  },
  {
    step: '03',
    title: 'AI Answers Questions',
    desc: 'Your visitors ask questions, and AI responds with accurate answers from your knowledge base in real-time.',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    )
  }
]

export default function HomePage() {
  return (
    <div
      className="min-h-screen noise-bg"
      style={{ backgroundColor: 'hsl(40, 20%, 97%)' }}
    >
      {/* Noise overlay is handled by the noise-bg class ::before */}
      <div className="relative z-[1]">
        {/* Nav */}
        <nav className="sticky top-0 z-50 glass">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-[10px] gradient-bg flex items-center justify-center text-white font-bold text-xs btn-primary-shadow">
                D
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                DocBot
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href="#how-it-works"
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                How it works
              </Link>
              <Link
                href="#pricing"
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                Pricing
              </Link>
              <Link
                href="/sign-in"
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-[10px] gradient-bg px-4 py-2 text-[13px] font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-indigo-100/30 via-slate-100/20 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-5xl px-6 pt-24 pb-28 text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground mb-8 card-elevated"
              style={{ borderRadius: '9999px' }}
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              AI-Powered Knowledge Base
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-foreground">
              Turn your docs into
              <br />
              <span className="gradient-text">an AI chatbot</span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground leading-relaxed mb-10">
              Upload your documentation, embed a chat widget on your website,
              and let AI answer your customers&apos; questions 24/7.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-[10px] gradient-bg px-7 py-3 font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all text-sm"
              >
                Start Free
              </Link>
              <Link
                href="#demo"
                className="rounded-[10px] border border-border bg-white px-7 py-3 font-medium text-foreground hover:bg-muted/50 transition-all text-sm card-elevated"
                style={{
                  boxShadow:
                    'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                See Demo
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              {[
                'No credit card required',
                'Setup in 2 minutes',
                '100 free messages/mo'
              ].map(text => (
                <div key={text} className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-green-600/70"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Simple Setup
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                How It Works
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(item => (
                <div
                  key={item.step}
                  className="relative card-elevated rounded-xl p-7 card-hover group"
                >
                  <div className="absolute top-5 right-5 text-3xl font-black text-muted/30 group-hover:text-primary/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="h-10 w-10 rounded-[10px] gradient-bg-subtle flex items-center justify-center text-primary/70 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Widget Demo */}
        <section id="demo" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Preview
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Live Demo
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                See how the chat widget looks and works on your site
              </p>
            </div>
            <div className="mx-auto max-w-md">
              <div
                className="card-elevated rounded-xl overflow-hidden"
                style={{
                  boxShadow:
                    'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 8px 30px rgba(0,0,0,0.08)'
                }}
              >
                <div className="gradient-bg px-5 py-4">
                  <h3 className="text-white font-semibold text-sm">
                    DocBot Assistant
                  </h3>
                  <p className="text-white/60 text-xs mt-0.5">
                    Ask anything about our documentation
                  </p>
                </div>
                <div
                  className="p-4 space-y-3 min-h-[240px]"
                  style={{ backgroundColor: 'hsl(40, 15%, 97%)' }}
                >
                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-lg gradient-bg-subtle flex-shrink-0 flex items-center justify-center text-primary/60 text-[10px] font-bold">
                      AI
                    </div>
                    <div
                      className="rounded-xl rounded-tl-sm bg-white p-3 text-[13px] max-w-[80%] leading-relaxed"
                      style={{
                        boxShadow:
                          'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.04)',
                        border: '1px solid hsl(220,10%,90%)'
                      }}
                    >
                      Hello! I&apos;m your AI assistant. Ask me anything about
                      the documentation.
                    </div>
                  </div>
                  <div className="flex gap-2.5 justify-end">
                    <div className="rounded-xl rounded-tr-sm gradient-bg text-white p-3 text-[13px] max-w-[80%] leading-relaxed btn-primary-shadow">
                      How do I install the widget?
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-lg gradient-bg-subtle flex-shrink-0 flex items-center justify-center text-primary/60 text-[10px] font-bold">
                      AI
                    </div>
                    <div
                      className="rounded-xl rounded-tl-sm bg-white p-3 text-[13px] max-w-[80%] leading-relaxed"
                      style={{
                        boxShadow:
                          'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.04)',
                        border: '1px solid hsl(220,10%,90%)'
                      }}
                    >
                      Add this script tag to your HTML:{' '}
                      <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">
                        &lt;script src=&quot;...&quot;&gt;
                      </code>
                      . The widget will appear as a floating chat button.
                    </div>
                  </div>
                </div>
                <div className="border-t bg-white px-3 py-2.5 flex gap-2">
                  <div className="flex-1 rounded-[10px] border bg-muted/30 px-3.5 py-2 text-[13px] text-muted-foreground">
                    Type your question...
                  </div>
                  <div className="h-9 w-9 rounded-[10px] gradient-bg flex items-center justify-center text-white btn-primary-shadow">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Pricing
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Start free, scale as you grow
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plans.map(plan => (
                <div
                  key={plan.name}
                  className={`relative card-elevated rounded-xl p-5 transition-all duration-300 ${plan.highlight ? 'ring-1 ring-primary/30 scale-[1.01]' : 'card-hover'}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full gradient-bg px-3 py-0.5 text-[10px] font-semibold text-white btn-primary-shadow uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mt-2.5 mb-4">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map(f => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-[13px] text-muted-foreground"
                      >
                        <svg
                          className="h-3.5 w-3.5 text-primary/50 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`block w-full text-center rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all ${plan.highlight ? 'gradient-bg text-white btn-primary-shadow hover:-translate-y-px' : 'border border-border bg-white hover:bg-muted/40 text-foreground'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div
              className="relative rounded-2xl overflow-hidden px-8 py-14 text-center"
              style={{
                background:
                  'linear-gradient(135deg, hsl(220, 15%, 15%), hsl(230, 20%, 22%))'
              }}
            >
              <div className="relative z-[1]">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ready to get started?
                </h2>
                <p className="text-white/50 text-sm mb-7 max-w-lg mx-auto">
                  Join hundreds of teams using DocBot to power their customer
                  support with AI.
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex rounded-[10px] bg-white px-7 py-3 text-sm font-medium text-foreground hover:-translate-y-px transition-all"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                >
                  Start Free Today
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg gradient-bg flex items-center justify-center text-white text-[10px] font-bold">
                D
              </div>
              <span className="text-sm font-medium text-foreground">
                DocBot
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with Next.js, Supabase pgvector & OpenAI
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
