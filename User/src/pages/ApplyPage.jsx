import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  IndianRupee,
  User,
  Briefcase,
  PiggyBank,
  FileUp,
  Shield,
  Info,
  Check,
  FileText,
} from "lucide-react";
import Header from "../components/Header";
import StepTracker from "../components/StepTracker";
import KYCVerification from "../components/KYCVerification";
import api from "../utils/api";

const STEPS = [
  "Loan Details",
  "Personal Info",
  "Employment",
  "Financials",
  "Documents",
  "KYC Verification",
];

const MANUAL_URL =
  "https://loan-documents-arsh-123.s3.ap-south-1.amazonaws.com/AI_Loan_System_Applicant_User_Manual.pdf";

/* ─── small helpers ─── */
const F = ({ label, hint, children }) => (
  <div>
    <label className="label">
      {label}
      {hint && (
        <span className="ml-1 text-slate-400 normal-case font-normal text-[11px]">
          ({hint})
        </span>
      )}
    </label>
    {children}
  </div>
);

function UploadField({ label, hint, required, file, onChange }) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-sky-500 ml-0.5">*</span>}
        {hint && (
          <span className="ml-1 text-slate-400 normal-case font-normal text-[11px]">
            ({hint})
          </span>
        )}
      </label>
      <label
        className={`upload-zone flex items-center gap-3 ${file ? "has-file" : ""}`}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={onChange}
        />
        <FileUp
          size={18}
          className={file ? "text-green-500" : "text-slate-400"}
        />
        <span
          className={`text-sm ${file ? "text-green-700 font-medium" : "text-slate-400"}`}
        >
          {file ? file.name : "Click to upload"}
        </span>
        {file && <Check size={15} className="text-green-500 ml-auto" />}
      </label>
    </div>
  );
}

export default function ApplyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aadhaarReferenceId, setAadhaarReferenceId] = useState("");

  // step data
  const [loan, setLoan] = useState({
    loan_amount: "",
    loan_tenure: "",
    loan_purpose: "",
  });

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    pan_number: "",
    aadhaar_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [employment, setEmployment] = useState({
    employment_type: "salaried",
    employer_name: "",
    industry: "",
    job_title: "",
    years_in_current_job: "",
    total_work_experience: "",
    monthly_income: "",
    salary_mode: "bank_transfer",
  });

  const [financial, setFinancial] = useState({
    existing_loans: "0",
    existing_emi: "0",
    credit_card_limit: "0",
    credit_card_balance: "0",
    bank_name: "",
    bank_account_type: "savings",
    bank_account_number: "",
    average_monthly_balance: "",
  });

  const [files, setFiles] = useState({
    bank_statement: null,
    salary_slip: null,
    itr_document: null,
    collateral_document: null,
  });
  const [collateralType, setCollateralType] = useState("");

  // saved profile data forwarded to KYC
  const [savedProfile, setSavedProfile] = useState(null);

  const setE = (setter) => (e) =>
    setter((p) => ({ ...p, [e.target.name]: e.target.value }));
  const setF = (key) => (e) =>
    setFiles((p) => ({ ...p, [key]: e.target.files[0] || null }));

  /* ─── API calls per step ─── */
  const next = async () => {
    setError("");
    setLoading(true);
    try {
      if (step === 0) {
        const { data } = await api.post("/application/create", loan);
        setAppId(data.application_id);
        setStep(1);
      } else if (step === 1) {
        await api.post("/application/profile", {
          ...profile,
          application_id: appId,
        });
        setSavedProfile({ ...profile });
        setStep(2);
      } else if (step === 2) {
        await api.post("/application/employment", {
          ...employment,
          application_id: appId,
        });
        setStep(3);
      } else if (step === 3) {
        await api.post("/application/financial", {
          ...financial,
          application_id: appId,
        });
        setStep(4);
      } else if (step === 4) {
        // documents
        const fd = new FormData();
        fd.append("application_id", appId);
        fd.append("collateral_type", collateralType);
        fd.append("bank_statement", files.bank_statement);
        fd.append("salary_slip", files.salary_slip);
        fd.append("itr_document", files.itr_document);
        if (files.collateral_document)
          fd.append("collateral_document", files.collateral_document);
        await api.post("/application/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setStep(5);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* KYC handlers — passed to KYCVerification */
  /* KYC handlers — passed to KYCVerification */

  /* KYC handlers — passed to KYCVerification */

  const handlePANVerify = async (data) => {
    let formattedDOB = data.dob;

    // Convert YYYY-MM-DD -> DD/MM/YYYY
    if (formattedDOB?.includes("-")) {
      const [year, month, day] = formattedDOB.split("-");

      formattedDOB = `${day}/${month}/${year}`;
    }

    return await api.post("/kyc/verify-pan", {
      ...data,
      dob: formattedDOB,
    });
  };

  const handleSendOTP = async (data) => {
    const response = await api.post("/kyc/aadhaar/send-otp", data);

    const referenceId = response.data?.data?.reference_id;

    // SAVE REFERENCE ID AUTOMATICALLY
    setAadhaarReferenceId(referenceId);

    return response;
  };

  const handleVerifyOTP = async (data) => {
    if (!aadhaarReferenceId) {
      throw new Error("Please send OTP first");
    }

    await api.post("/kyc/aadhaar/verify-otp", {
      ...data,
      reference_id: aadhaarReferenceId,
    });

    navigate(`/status/${appId}`);
  };

  /* Validation guards */
  const canContinue = () => {
    // STEP 0 — Loan Details
    if (step === 0) {
      return loan.loan_amount && loan.loan_tenure && loan.loan_purpose;
    }

    // STEP 1 — Personal Info
    if (step === 1) {
      return (
        profile.name &&
        profile.age &&
        profile.date_of_birth &&
        profile.gender &&
        profile.marital_status &&
        profile.pan_number &&
        profile.aadhaar_number &&
        profile.address &&
        profile.city &&
        profile.state &&
        profile.pincode
      );
    }

    // STEP 2 — Employment
    if (step === 2) {
      return (
        employment.employment_type &&
        employment.industry &&
        employment.employer_name &&
        employment.job_title &&
        employment.years_in_current_job !== "" &&
        employment.total_work_experience !== "" &&
        employment.monthly_income &&
        employment.salary_mode
      );
    }

    // STEP 3 — Financial
    if (step === 3) {
      return (
        financial.existing_loans !== "" &&
        financial.existing_emi !== "" &&
        financial.credit_card_limit !== "" &&
        financial.credit_card_balance !== "" &&
        financial.bank_name &&
        financial.bank_account_type &&
        financial.bank_account_number &&
        financial.average_monthly_balance
      );
    }

    // STEP 4 — Documents
    if (step === 4) {
      return (
        files.bank_statement &&
        files.salary_slip &&
        files.itr_document &&
        files.collateral_document &&
        collateralType
      );
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
      <Header showBack={true} backLabel="Dashboard" backPath="/dashboard" />

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8">
        {/* Title */}
        <div className="mb-8 fade-up">
          <h1 className="text-3xl font-bold text-slate-800">
            Apply for a Loan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete all steps to submit your application
          </p>
        </div>

        <div className="mb-6 relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-blue-50 p-5 shadow-sm">
          {/* Background Glow */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-100 blur-3xl opacity-60" />

          <div className="relative flex items-center justify-between gap-4">
            {/* Left Content */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md">
                <FileText size={26} />
              </div>

              {/* Text */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    Applicant User Manual
                  </h3>

                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    Important
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-xl">
                  Please read the complete application guide carefully before
                  starting your loan application. It contains required document
                  details, eligibility information, and step-by-step
                  instructions.
                </p>

                {/* Features */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Step-by-step Guide",
                    "Document Instructions",
                    "KYC Process",
                    "Approval Tips",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={() => window.open(MANUAL_URL, "_blank")}
              className="group inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-600 hover:scale-[1.02]"
            >
              <FileText size={18} />
              View Manual
              <ChevronRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>

        {/* Step tracker */}
        <div className="card p-6 mb-6 fade-up-2">
          <StepTracker steps={STEPS} current={step} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 rounded-lg text-red-600 text-sm bg-red-50 border border-red-200 flex items-center gap-2 fade-up">
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* Form card */}
        <div className="card p-8 fade-up-3">
          {/* ── STEP 0: Loan Details ── */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Loan Details
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Tell us how much you need and why
              </p>
              <div className="space-y-5">
                <F label="Loan Amount (₹)" hint="min ₹50,000">
                  <div className="relative">
                    <input
                      type="number"
                      name="loan_amount"
                      className="input-field pl-8"
                      placeholder="500000"
                      value={loan.loan_amount}
                      onChange={setE(setLoan)}
                    />
                  </div>
                </F>
                <F label="Loan Tenure" hint="12–84 months">
                  <input
                    type="number"
                    name="loan_tenure"
                    className="input-field"
                    placeholder="24"
                    value={loan.loan_tenure}
                    onChange={setE(setLoan)}
                    min={12}
                    max={84}
                  />
                </F>
                <F label="Loan Purpose">
                  <select
                    name="loan_purpose"
                    className="input-field"
                    value={loan.loan_purpose}
                    onChange={setE(setLoan)}
                  >
                    <option value="">Select purpose</option>
                    {[
                      "Home Purchase",
                      "Home Renovation",
                      "Vehicle Purchase",
                      "Education",
                      "Medical Emergency",
                      "Business Expansion",
                      "Debt Consolidation",
                      "Personal Expenses",
                    ].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </F>
                <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100 text-sm text-sky-700">
                  <Info size={15} className="mt-0.5 flex-shrink-0" />
                  Interest rates range from 10.5% – 18% p.a. based on your
                  credit profile. No prepayment charges after 12 months.
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Personal Information
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Your details as per official documents
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <F label="Full Name">
                    <input
                      type="text"
                      name="name"
                      className="input-field"
                      placeholder="As per PAN"
                      value={profile.name}
                      onChange={setE(setProfile)}
                    />
                  </F>
                  <F label="Age">
                    <input
                      type="number"
                      name="age"
                      className="input-field"
                      placeholder="25"
                      value={profile.age}
                      onChange={setE(setProfile)}
                      min={18}
                      max={70}
                    />
                  </F>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Date of Birth">
                    <input
                      type="date"
                      name="date_of_birth"
                      className="input-field"
                      value={profile.date_of_birth}
                      onChange={setE(setProfile)}
                    />
                  </F>
                  <F label="Gender">
                    <select
                      name="gender"
                      className="input-field"
                      value={profile.gender}
                      onChange={setE(setProfile)}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </F>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Marital Status">
                    <select
                      name="marital_status"
                      className="input-field"
                      value={profile.marital_status}
                      onChange={setE(setProfile)}
                    >
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </F>
                  <F label="PAN Number">
                    <input
                      type="text"
                      name="pan_number"
                      className="input-field uppercase"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={profile.pan_number}
                      onChange={setE(setProfile)}
                    />
                  </F>
                </div>
                <F label="Aadhaar Number">
                  <input
                    type="text"
                    name="aadhaar_number"
                    className="input-field"
                    placeholder="123456789012"
                    maxLength={12}
                    value={profile.aadhaar_number}
                    onChange={setE(setProfile)}
                  />
                </F>
                <F label="Residential Address">
                  <input
                    type="text"
                    name="address"
                    className="input-field"
                    placeholder="House/Flat, Street, Area"
                    value={profile.address}
                    onChange={setE(setProfile)}
                  />
                </F>
                <div className="grid grid-cols-3 gap-4">
                  <F label="City">
                    <input
                      type="text"
                      name="city"
                      className="input-field"
                      placeholder="Mumbai"
                      value={profile.city}
                      onChange={setE(setProfile)}
                    />
                  </F>
                  <F label="State">
                    <input
                      type="text"
                      name="state"
                      className="input-field"
                      placeholder="Maharashtra"
                      value={profile.state}
                      onChange={setE(setProfile)}
                    />
                  </F>
                  <F label="Pincode">
                    <input
                      type="text"
                      name="pincode"
                      className="input-field"
                      placeholder="400001"
                      maxLength={6}
                      value={profile.pincode}
                      onChange={setE(setProfile)}
                    />
                  </F>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Employment ── */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Employment Details
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Tell us about your current employment
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <F label="Employment Type">
                    <select
                      name="employment_type"
                      className="input-field"
                      value={employment.employment_type}
                      onChange={setE(setEmployment)}
                    >
                      <option value="salaried">Salaried</option>
                      <option value="self_employed">Self Employed</option>
                      <option value="business">Business Owner</option>
                      <option value="freelancer">Freelancer</option>
                    </select>
                  </F>
                  <F label="Industry">
                    <select
                      name="industry"
                      className="input-field"
                      value={employment.industry}
                      onChange={setE(setEmployment)}
                    >
                      <option value="">Select</option>
                      {[
                        "IT/Software",
                        "Banking/Finance",
                        "Healthcare",
                        "Manufacturing",
                        "Retail",
                        "Education",
                        "Government",
                        "Real Estate",
                        "Other",
                      ].map((i) => (
                        <option key={i}>{i}</option>
                      ))}
                    </select>
                  </F>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Employer / Company Name">
                    <input
                      type="text"
                      name="employer_name"
                      className="input-field"
                      placeholder="Infosys Ltd."
                      value={employment.employer_name}
                      onChange={setE(setEmployment)}
                    />
                  </F>
                  <F label="Job Title">
                    <input
                      type="text"
                      name="job_title"
                      className="input-field"
                      placeholder="Software Engineer"
                      value={employment.job_title}
                      onChange={setE(setEmployment)}
                    />
                  </F>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <F label="Years at Current Job">
                    <input
                      type="number"
                      name="years_in_current_job"
                      className="input-field"
                      placeholder="2"
                      value={employment.years_in_current_job}
                      onChange={setE(setEmployment)}
                      min={0}
                    />
                  </F>
                  <F label="Total Experience (yrs)">
                    <input
                      type="number"
                      name="total_work_experience"
                      className="input-field"
                      placeholder="5"
                      value={employment.total_work_experience}
                      onChange={setE(setEmployment)}
                      min={0}
                    />
                  </F>
                  <F label="Monthly Income (₹)">
                    <input
                      type="number"
                      name="monthly_income"
                      className="input-field"
                      placeholder="75000"
                      value={employment.monthly_income}
                      onChange={setE(setEmployment)}
                    />
                  </F>
                </div>
                <F label="Salary Mode">
                  <select
                    name="salary_mode"
                    className="input-field"
                    value={employment.salary_mode}
                    onChange={setE(setEmployment)}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </F>
              </div>
            </div>
          )}

          {/* ── STEP 3: Financial ── */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Financial Details
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Your current financial obligations and banking info
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <F label="No. of Existing Loans">
                    <input
                      type="number"
                      name="existing_loans"
                      className="input-field"
                      placeholder="0"
                      value={financial.existing_loans}
                      onChange={setE(setFinancial)}
                      min={0}
                    />
                  </F>
                  <F label="Total Existing EMI (₹/mo)">
                    <input
                      type="number"
                      name="existing_emi"
                      className="input-field"
                      placeholder="0"
                      value={financial.existing_emi}
                      onChange={setE(setFinancial)}
                      min={0}
                    />
                  </F>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Credit Card Limit (₹)">
                    <input
                      type="number"
                      name="credit_card_limit"
                      className="input-field"
                      placeholder="0"
                      value={financial.credit_card_limit}
                      onChange={setE(setFinancial)}
                      min={0}
                    />
                  </F>
                  <F label="Credit Card Balance (₹)" hint="outstanding">
                    <input
                      type="number"
                      name="credit_card_balance"
                      className="input-field"
                      placeholder="0"
                      value={financial.credit_card_balance}
                      onChange={setE(setFinancial)}
                      min={0}
                    />
                  </F>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Bank Name">
                    <input
                      type="text"
                      name="bank_name"
                      className="input-field"
                      placeholder="HDFC Bank"
                      value={financial.bank_name}
                      onChange={setE(setFinancial)}
                    />
                  </F>
                  <F label="Account Type">
                    <select
                      name="bank_account_type"
                      className="input-field"
                      value={financial.bank_account_type}
                      onChange={setE(setFinancial)}
                    >
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                      <option value="salary">Salary</option>
                    </select>
                  </F>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Bank Account Number">
                    <input
                      type="text"
                      name="bank_account_number"
                      className="input-field"
                      placeholder="XXXXXXXX1234"
                      value={financial.bank_account_number}
                      onChange={setE(setFinancial)}
                    />
                  </F>
                  <F label="Avg Monthly Balance (₹)">
                    <input
                      type="number"
                      name="average_monthly_balance"
                      className="input-field"
                      placeholder="50000"
                      value={financial.average_monthly_balance}
                      onChange={setE(setFinancial)}
                    />
                  </F>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Documents ── */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Upload Documents
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Image files, max 4.2 MB for all files
              </p>
              <div className="space-y-4">
                <UploadField
                  label="Bank Statement"
                  hint="Last 6 months"
                  required
                  file={files.bank_statement}
                  onChange={setF("bank_statement")}
                />
                <UploadField
                  label="Salary Slip"
                  hint="Latest month"
                  required
                  file={files.salary_slip}
                  onChange={setF("salary_slip")}
                />
                <UploadField
                  label="ITR Document"
                  hint="Last financial year"
                  required
                  file={files.itr_document}
                  onChange={setF("itr_document")}
                />
                <UploadField
                  label="Collateral Document"
                  hint="Collateral Documents — property/vehicle/gold papers"
                  required={false}
                  file={files.collateral_document}
                  onChange={setF("collateral_document")}
                />
                {files.collateral_document && (
                  <F label="Collateral Type">
                    <select
                      className="input-field"
                      value={collateralType}
                      onChange={(e) => setCollateralType(e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option value="property">Property</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="gold">Gold</option>
                      <option value="fd">Fixed Deposit</option>
                      <option value="other">Other</option>
                    </select>
                  </F>
                )}
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-700">
                  <Info size={15} className="mt-0.5 flex-shrink-0" />
                  Bank statement, salary slip and ITR, Collateral document are
                  mandatory and improve your approval chances.
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: KYC (final step — no "Continue" button here; KYCVerification handles it) ── */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                KYC Verification
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Final step — verify your identity. After Aadhaar OTP, our AI
                agents will automatically process your application.
              </p>
              <KYCVerification
                applicationId={appId}
                profileData={{
                  name: savedProfile?.name || "",
                  pan_number: savedProfile?.pan_number || "",
                  aadhaar_number: savedProfile?.aadhaar_number || "",
                  date_of_birth: savedProfile?.date_of_birth || "",
                }}
                onPANVerify={handlePANVerify}
                onSendOTP={handleSendOTP}
                onVerifyOTP={handleVerifyOTP}
              />
            </div>
          )}

          {/* ── Navigation (only shown for steps 0–4) ── */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                className="btn-ghost"
                onClick={() =>
                  step === 0 ? navigate("/dashboard") : setStep((s) => s - 1)
                }
              >
                <ChevronLeft size={16} />
                {step === 0 ? "Cancel" : "Back"}
              </button>
              <button
                className="btn-primary"
                onClick={next}
                disabled={loading || !canContinue()}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {step === 4 ? "Save & Continue to KYC" : "Continue"}
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Back button for KYC step */}
          {step === 5 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button className="btn-ghost" onClick={() => setStep(4)}>
                <ChevronLeft size={16} /> Back to Documents
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
