import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

import virtusaLogo from '../assets/virtusa_logo.png'

export default function SignupPage() {

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: ''
  })

  const [show, setShow] = useState(false)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  const { login } = useAuth()

  const navigate = useNavigate()

  const handle = async (e) => {

    e.preventDefault()

    setError('')

    if (form.phone_number.length !== 10) {
      return setError('Phone number must be 10 digits')
    }

    setLoading(true)

    try {

      const { data } = await api.post(
        '/auth/signup',
        {
          full_name: form.full_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password
        }
      )

      login(data.token, data.user)

      navigate('/dashboard')

    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* LEFT PANEL */}

      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0c4a6e 0%, #075985 40%, #0369a1 100%)'
        }}
      >

        {/* GRID */}

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* LOGO */}

        <img
          src={virtusaLogo}
          alt="Jatayu"
          className="h-10 object-contain object-left relative z-10 brightness-0 invert"
        />

        {/* CONTENT */}

        <div className="relative z-10">

          <h1
            className="text-5xl font-bold text-white mb-3 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >

            Spread Your Wings<br />

            <span className="text-sky-200">
              & Reach Your Dream
            </span>
          </h1>

          <p className="text-white/60 text-lg mb-10">
            AI-powered loan approval — fast, fair, transparent.
          </p>

          <div className="space-y-5">

            {[
              {
                Icon: Zap,
                label: 'Instant Decision',
                desc: 'AI agents process your application in minutes'
              },
              {
                Icon: Shield,
                label: 'Secure & Private',
                desc: 'Bank-grade encryption on all your documents'
              },
              {
                Icon: TrendingUp,
                label: 'Smart Assessment',
                desc: 'Fair credit scoring based on 50+ parameters'
              },
            ].map(({ Icon, label, desc }) => (

              <div
                key={label}
                className="flex items-start gap-4"
              >

                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">

                  <Icon
                    size={18}
                    className="text-sky-200"
                  />
                </div>

                <div>

                  <p className="text-white font-semibold text-sm">
                    {label}
                  </p>

                  <p className="text-white/50 text-sm">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs relative z-10">
          © 2026 Virtusa Jatayu. All rights reserved.
        </p>
      </div>

      {/* RIGHT PANEL */}

      <div className="flex-1 flex items-center justify-center p-8">

        <div className="w-full max-w-md fade-up">

          {/* MOBILE LOGO */}

          <div className="lg:hidden mb-10 flex justify-center">

            <img
              src={virtusaLogo}
              alt="Jatayu"
              className="h-10 object-contain"
            />
          </div>

          {/* HEADER */}

          <h2
            className="text-3xl font-bold text-slate-800 mb-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Create account
          </h2>

          <p className="text-slate-500 mb-8 text-sm">
            Create your Jatayu account
          </p>

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-3 rounded-lg text-red-600 text-sm bg-red-50 border border-red-200 flex items-center gap-2">
              <span className="text-red-400">⚠</span>
              {error}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handle} className="space-y-5">

            {/* FULL NAME */}

            <div>

              <label className="label">
                Full Name
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.full_name}
                onChange={e =>
                  setForm({
                    ...form,
                    full_name: e.target.value
                  })
                }
                required
              />
            </div>

            {/* PHONE */}

            <div>

              <label className="label">
                Phone Number
              </label>

              <input
                type="tel"
                className="input-field"
                placeholder="9876543210"
                maxLength={10}
                value={form.phone_number}
                onChange={e =>
                  setForm({
                    ...form,
                    phone_number: e.target.value.replace(/\D/g, '')
                  })
                }
                required
              />
            </div>

            {/* EMAIL */}

            <div>

              <label className="label">
                Email Address
              </label>

              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
                required
              />
            </div>

            {/* PASSWORD */}

            <div>

              <label className="label">
                Password
              </label>

              <div className="relative">

                <input
                  type={show ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e =>
                    setForm({
                      ...form,
                      password: e.target.value
                    })
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >

              {loading ? (

                <>

                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                  Creating account...
                </>

              ) : (

                'Create Account'
              )}
            </button>
          </form>

          {/* FOOTER */}

          <p className="mt-7 text-center text-slate-500 text-sm">

            Already have an account?{' '}

            <Link
              to="/login"
              className="text-sky-600 hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}