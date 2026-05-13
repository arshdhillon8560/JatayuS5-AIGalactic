import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import favicon from "../assets/favicon.png";


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .liq-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .liq-root {
    font-family: 'DM Sans', sans-serif;
    background: #F7F8FA;
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  .liq-navbar {
    background: #fff;
    border-bottom: 1px solid #E4E8EF;
    padding: 0 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .liq-nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .liq-nav-logo-mark {
    width: 28px;
    height: 28px;
    background: #0C2D48;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .liq-nav-brand-text {
    font-size: 14px;
    font-weight: 600;
    color: #0C2D48;
    letter-spacing: -0.01em;
  }

  .liq-nav-brand-text span { color: #2B7FD4; }

  .liq-nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .liq-nav-link {
    font-size: 13px;
    color: #6B7585;
    cursor: pointer;
    font-weight: 400;
    transition: color 0.15s;
    text-decoration: none;
  }

  .liq-nav-link:hover { color: #0C2D48; }

  .liq-nav-badge {
    font-size: 11px;
    font-weight: 500;
    color: #1C5A8A;
    background: #E3F0FB;
    padding: 3px 10px;
    border-radius: 100px;
    border: 1px solid #B5D4F4;
    letter-spacing: 0.01em;
  }

  .liq-main-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 56px);
  }

  .liq-left-panel {
    background: #0C2D48;
    padding: 56px 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .liq-left-panel::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: rgba(43,127,212,0.08);
  }

  .liq-left-panel::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(43,127,212,0.06);
  }

  .liq-left-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: #5A9FD4;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .liq-left-headline {
    font-size: 28px;
    font-weight: 600;
    color: #F0F4F8;
    line-height: 1.25;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }

  .liq-left-headline span { color: #4CA3E3; }

  .liq-left-sub {
    font-size: 14px;
    color: #7EA8C4;
    line-height: 1.65;
    max-width: 320px;
    margin-bottom: 40px;
    font-weight: 300;
  }

  .liq-feature-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .liq-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 13px;
    color: #8FBBD6;
    line-height: 1.5;
  }

  .liq-feature-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2B7FD4;
    margin-top: 6px;
    flex-shrink: 0;
  }

  .liq-stat-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-top: 44px;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .liq-stat-item { display: flex; flex-direction: column; gap: 3px; }

  .liq-stat-num {
    font-size: 20px;
    font-weight: 600;
    color: #E8F2FA;
    letter-spacing: -0.02em;
    font-family: 'DM Mono', monospace;
  }

  .liq-stat-label {
    font-size: 11px;
    color: #5A7D99;
    font-weight: 400;
  }

  .liq-right-panel {
    background: #F7F8FA;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
  }

  .liq-login-card {
    width: 100%;
    max-width: 400px;
    background: #fff;
    border: 1px solid #E4E8EF;
    border-radius: 12px;
    padding: 40px;
  }

  .liq-card-header { margin-bottom: 28px; }

  .liq-card-icon {
    width: 40px;
    height: 40px;
    background: #E3F0FB;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .liq-card-title {
    font-size: 20px;
    font-weight: 600;
    color: #0C2D48;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }

  .liq-card-subtitle {
    font-size: 13px;
    color: #8893A4;
    font-weight: 400;
  }

  .liq-form-group { margin-bottom: 16px; }

  .liq-form-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #4A5568;
    margin-bottom: 6px;
    letter-spacing: 0.01em;
  }

  .liq-input-wrap { position: relative; }

  .liq-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9AA5B4;
    display: flex;
    align-items: center;
  }

  .liq-form-input {
    width: 100%;
    padding: 9px 12px 9px 36px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #0C2D48;
    background: #F9FAFB;
    border: 1px solid #D8DFE8;
    border-radius: 7px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }

  .liq-form-input::placeholder { color: #B0BAC8; }

  .liq-form-input:focus {
    border-color: #2B7FD4;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(43,127,212,0.1);
  }

  .liq-form-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    margin-top: -4px;
  }

  .liq-remember-wrap {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: #6B7585;
    cursor: pointer;
  }

  .liq-remember-wrap input { accent-color: #2B7FD4; }

  .liq-forgot-link {
    font-size: 12px;
    color: #2B7FD4;
    cursor: pointer;
    text-decoration: none;
    font-weight: 500;
    background: none;
    border: none;
  }

  .liq-forgot-link:hover { color: #1A5FA0; }

  .liq-submit-btn {
    width: 100%;
    padding: 10px;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
    background: #0C2D48;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.15s;
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .liq-submit-btn:hover:not(:disabled) { background: #0E3657; }
  .liq-submit-btn:active:not(:disabled) { background: #0a2438; }
  .liq-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .liq-card-footer {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #F0F3F7;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .liq-security-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #7EA862;
    font-weight: 500;
  }

  .liq-restricted-note {
    font-size: 11px;
    color: #9AA5B4;
  }

  .liq-error-box {
    background: #FEF2F2;
    border: 1px solid #FCA5A5;
    border-radius: 6px;
    padding: 9px 12px;
    font-size: 12.5px;
    color: #B91C1C;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    .liq-main-body { grid-template-columns: 1fr; }
    .liq-left-panel { display: none; }
    .liq-navbar { padding: 0 20px; }
    .liq-nav-links { display: none; }
  }
`;

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(formData);
      if (!res.token) {
        setError(res.message || 'Login failed');
        return;
      }
      login(res.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="liq-root">

        {/* NAVBAR */}
        <nav className="liq-navbar">
          <div className="liq-nav-brand">
            <div className="liq-nav-logo-mark">
              <img src={favicon} alt="Logo" width="20" height="20" />
            </div>
            <span className="liq-nav-brand-text">Virtusa <span>Smart Loan </span></span>
          </div>

          <div className="liq-nav-links">
            <a className="liq-nav-link" href="#">Platform</a>
            <a className="liq-nav-link" href="#">Documentation</a>
            <a className="liq-nav-link" href="#">Support</a>
          </div>

          <span className="liq-nav-badge">Officer Portal</span>
        </nav>

        {/* MAIN BODY */}
        <div className="liq-main-body">

          <div className="liq-left-panel">
            <p className="liq-left-eyebrow">AI-Powered Credit Intelligence</p>
            <h1 className="liq-left-headline">
              Smarter loan decisions,<br /><span>at banking scale.</span>
            </h1>
            <p className="liq-left-sub">
              Combines real-time financial data, machine learning models, and regulatory compliance checks to accelerate credit assessment from days to minutes.
            </p>

            <ul className="liq-feature-list">
              {[
                'Automated risk scoring with explainable AI outputs',
                'Fraud signal detection across 40+ behavioral indicators',
                'Full audit trail for compliance and model governance',
                'Real-time bureau integration and income verification',
              ].map((f, i) => (
                <li key={i} className="liq-feature-item">
                  <span className="liq-feature-dot" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="liq-stat-row">
              {[
                { num: '94.2%', label: 'Model accuracy' },
                { num: '8 min', label: 'Avg. decision time' },
                { num: '₹2.4B', label: 'Credit assessed' },
              ].map((s, i) => (
                <div key={i} className="liq-stat-item">
                  <span className="liq-stat-num">{s.num}</span>
                  <span className="liq-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="liq-right-panel">
            <div className="liq-login-card">

              <div className="liq-card-header">
                <div className="liq-card-icon">
                  <svg viewBox="0 0 20 20" fill="none" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a4 4 0 100 8 4 4 0 000-8zm-6 9a1 1 0 011-1h10a1 1 0 011 1v1a5 5 0 01-10 0v-1z" fill="#2B7FD4"/>
                  </svg>
                </div>
                <h2 className="liq-card-title">Sign in to your account</h2>
                <p className="liq-card-subtitle">Access restricted to authorized officers only</p>
              </div>

              {error && (
                <div className="liq-error-box">
                  <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                    <circle cx="7" cy="7" r="6" stroke="#B91C1C" strokeWidth="1.2"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="#B91C1C" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="liq-form-group">
                  <label className="liq-form-label">Work email address</label>
                  <div className="liq-input-wrap">
                    <span className="liq-input-icon">
                      <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
                        <path d="M1 3.5A1.5 1.5 0 012.5 2h10A1.5 1.5 0 0114 3.5v8A1.5 1.5 0 0112.5 13h-10A1.5 1.5 0 011 11.5v-8zM2.5 3a.5.5 0 00-.5.5v.573l5.5 3.143 5.5-3.143V3.5a.5.5 0 00-.5-.5h-10zM13 5.43L7.5 8.57 2 5.43V11.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V5.43z" fill="currentColor"/>
                      </svg>
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="officer@bank.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="liq-form-input"
                      required
                    />
                  </div>
                </div>

                <div className="liq-form-group">
                  <label className="liq-form-label">Password</label>
                  <div className="liq-input-wrap">
                    <span className="liq-input-icon">
                      <svg viewBox="0 0 15 15" fill="none" width="15" height="15">
                        <path d="M5 6V4.5a2.5 2.5 0 015 0V6H11a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h1zm1 0h3V4.5a1.5 1.5 0 00-3 0V6zm1.5 2.5a1 1 0 10.001 2.001A1 1 0 007.5 8.5z" fill="currentColor"/>
                      </svg>
                    </span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="liq-form-input"
                      required
                    />
                  </div>
                </div>

                <div className="liq-form-meta">
                  <label className="liq-remember-wrap">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Keep me signed in
                  </label>
                  <button type="button" className="liq-forgot-link">Forgot password?</button>
                </div>

                <button type="submit" className="liq-submit-btn" disabled={loading}>
                  {loading ? 'Verifying credentials…' : 'Sign in'}
                  {!loading && (
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </form>

              <div className="liq-card-footer">
                <span className="liq-security-badge">
                  <svg viewBox="0 0 13 13" fill="none" width="13" height="13">
                    <path d="M6.5 1L2 2.8v3.7C2 9.3 3.9 11.7 6.5 12.5 9.1 11.7 11 9.3 11 6.5V2.8L6.5 1z" stroke="#7EA862" strokeWidth="1" fill="rgba(126,168,98,0.12)"/>
                    <path d="M4.5 6.5l1.5 1.5 2.5-2.5" stroke="#7EA862" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  TLS 1.3 encrypted
                </span>
                <span className="liq-restricted-note">v2.4.1 · Production</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};