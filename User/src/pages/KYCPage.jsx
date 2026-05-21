import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import KYCVerification from "../components/KYCVerification";
import api from "../utils/api";

export default function KYCPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [aadhaarReferenceId, setAadhaarReferenceId] = useState("");

  /* PAN */

  const handlePANVerify = async (data) => {
    let formattedDOB = data.dob;

    if (formattedDOB?.includes("-")) {
      const [year, month, day] = formattedDOB.split("-");

      formattedDOB = `${day}/${month}/${year}`;
    }

    return await api.post("/kyc/verify-pan", {
      ...data,
      dob: formattedDOB,
    });
  };

  /* SEND OTP */

  const handleSendOTP = async (data) => {
    const response = await api.post("/kyc/aadhaar/send-otp", data);

    const referenceId = response.data?.data?.reference_id;

    setAadhaarReferenceId(referenceId);

    return response;
  };

  /* VERIFY OTP */

  const handleVerifyOTP = async (data) => {
    if (!aadhaarReferenceId) {
      throw new Error("Please send OTP first");
    }

    await api.post("/kyc/aadhaar/verify-otp", {
      ...data,
      reference_id: aadhaarReferenceId,
    });

    navigate(`/status/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
      <Header
        showBack={true}
        backLabel="Application Status"
        backPath={`/status/${id}`}
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Complete KYC Verification
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            Your application requires KYC verification before AI processing can
            continue.
          </p>
        </div>

        <div className="card p-8">
          <KYCVerification
            applicationId={id}
            onPANVerify={handlePANVerify}
            onSendOTP={handleSendOTP}
            onVerifyOTP={handleVerifyOTP}
          />
        </div>
      </div>
    </div>
  );
}
