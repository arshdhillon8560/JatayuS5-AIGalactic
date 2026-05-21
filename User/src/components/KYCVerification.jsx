import { useState } from "react";
import { CheckCircle, Lock, Send, Shield, AlertCircle } from "lucide-react";

export default function KYCVerification({
  applicationId,
  profileData = {},
  onPANVerify,
  onSendOTP,
  onVerifyOTP,
}) {
  // PAN
  const [pan, setPan] = useState({
    pan: profileData.pan_number || "",
    name: profileData.name || "",
    dob: profileData.date_of_birth || "",
  });

  const [panDone, setPanDone] = useState(false);
  const [panLoading, setPanLoading] = useState(false);
  const [panMsg, setPanMsg] = useState("");
  const [panErr, setPanErr] = useState("");

  // Aadhaar
  const [aadhaar, setAadhaar] = useState(profileData.aadhaar_number || "");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [aadhaarLoading, setAadhaarLoading] = useState(false);

  const [aadhaarMsg, setAadhaarMsg] = useState("");

  const [aadhaarErr, setAadhaarErr] = useState("");

  /* PAN */

  const submitPAN = async () => {
    setPanErr("");
    setPanMsg("");
    setPanLoading(true);

    try {
      const res = await onPANVerify({
        ...pan,
        application_id: applicationId,
      });

      const msg = res?.data?.message || res?.message || "PAN verified";

      if (
        msg.toLowerCase().includes("fail") ||
        msg.toLowerCase().includes("reject")
      ) {
        setPanErr(msg);
      } else {
        setPanMsg(msg);
        setPanDone(true);
      }
    } catch (err) {
      setPanErr(err.message);
    } finally {
      setPanLoading(false);
    }
  };

  /* SEND OTP */

  const sendOTP = async () => {
    setAadhaarErr("");
    setAadhaarMsg("");
    setAadhaarLoading(true);

    try {
      await onSendOTP({
        aadhaar,
      });

      setOtpSent(true);

      setAadhaarMsg("OTP sent to your Aadhaar-linked mobile number");
    } catch (err) {
      setAadhaarErr(err.message);
    } finally {
      setAadhaarLoading(false);
    }
  };

  /* VERIFY OTP */

  const verifyOTP = async () => {
    setAadhaarErr("");
    setAadhaarMsg("");
    setAadhaarLoading(true);

    try {
      await onVerifyOTP({
        application_id: applicationId,
        otp,
      });
    } catch (err) {
      setAadhaarErr(err.message);
      setAadhaarLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 border border-sky-100">
        <Shield size={18} className="text-sky-500 mt-0.5 flex-shrink-0" />

        <div>
          <p className="text-sm font-semibold text-sky-800">
            Identity Verification
          </p>

          <p className="text-xs text-sky-600 mt-0.5">
            Complete PAN and Aadhaar verification. After Aadhaar OTP
            verification, our AI agents will automatically process your
            application. Verification may take 1–2 minutes. Please wait.
          </p>
        </div>
      </div>

      {/* PAN */}

      <div
        className={`rounded-xl border p-6 transition-all ${
          panDone ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              panDone ? "bg-green-500 text-white" : "bg-sky-500 text-white"
            }`}
          >
            {panDone ? <CheckCircle size={16} /> : "1"}
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              PAN Card Verification
            </h3>

            <p className="text-xs text-slate-500">
              Verify your Permanent Account Number
            </p>
          </div>
        </div>

        {!panDone && (
          <div className="space-y-4">
            {panErr && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle size={14} />

                {panErr}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">PAN Number</label>

                <input
                  className="input-field uppercase"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={pan.pan}
                  onChange={(e) =>
                    setPan((p) => ({
                      ...p,
                      pan: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="label">Full Name (as per PAN)</label>

                <input
                  className="input-field"
                  placeholder="John Doe"
                  value={pan.name}
                  onChange={(e) =>
                    setPan((p) => ({
                      ...p,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="label">Date of Birth</label>

                <input
                  type="date"
                  className="input-field"
                  value={pan.dob}
                  onChange={(e) =>
                    setPan((p) => ({
                      ...p,
                      dob: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={submitPAN}
              disabled={panLoading || !pan.pan || !pan.name || !pan.dob}
            >
              {panLoading ? (
                "Verifying..."
              ) : (
                <>
                  <Lock size={14} />
                  Verify PAN
                </>
              )}
            </button>
          </div>
        )}

        {panDone && (
          <div className="flex items-center gap-2 text-green-700 text-sm bg-green-100 rounded-lg px-4 py-3">
            <CheckCircle size={15} />
            PAN verified successfully
          </div>
        )}
      </div>

      {/* AADHAAR */}

      <div
        className={`rounded-xl border p-6 transition-all ${
          !panDone
            ? "opacity-40 pointer-events-none"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-sky-500 text-white">
            2
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              Aadhaar OTP Verification
            </h3>

            <p className="text-xs text-slate-500">
              Receive OTP on your Aadhaar-linked mobile
            </p>
          </div>
        </div>

        {aadhaarMsg && (
          <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
            <CheckCircle size={14} />

            {aadhaarMsg}
          </div>
        )}

        {aadhaarErr && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <AlertCircle size={14} />

            {aadhaarErr}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Aadhaar Number</label>

              <input
                className="input-field"
                placeholder="123456789012"
                maxLength={12}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                disabled={otpSent}
              />
            </div>

            {!otpSent && (
              <div className="flex items-end">
                <button
                  className="btn-primary w-full"
                  onClick={sendOTP}
                  disabled={aadhaarLoading || aadhaar.length !== 12}
                >
                  {aadhaarLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={14} />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {otpSent && (
            <>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Enter OTP</label>

                  <input
                    className="input-field tracking-[0.3em] text-center text-lg font-semibold"
                    placeholder="• • • • • •"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  className="btn-primary"
                  onClick={verifyOTP}
                  disabled={aadhaarLoading || otp.length < 4}
                >
                  {aadhaarLoading ? (
                    "Verifying..."
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      Verify OTP & Submit
                    </>
                  )}
                </button>

                <button
                  className="btn-ghost text-sm"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setAadhaarMsg("");
                  }}
                >
                  Change Aadhaar
                </button>

                <button
                  className="btn-ghost text-sm"
                  onClick={sendOTP}
                  disabled={aadhaarLoading}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
