function normalize(str = "") {

  return str
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}



function formatProfileDOB(date) {

  if (!date) return "";

  return String(date)
    .split("T")[0];
}




function formatAadhaarDOB(dob) {

  if (!dob) return "";

  const parts = dob.split("-");

  if (parts.length !== 3)
    return "";

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}




function validateKYC(
  profile,
  aadhaarData
) {

  const failures = [];



  const appName =
    normalize(profile.name);

  const aadhaarName =
    normalize(aadhaarData.name);

  console.log("APP NAME:", appName);
  console.log("AADHAAR NAME:", aadhaarName);

  if (appName !== aadhaarName) {

    failures.push(
      "Name mismatch"
    );
  }


  const profileDOB =
    formatProfileDOB(
      profile.date_of_birth
    );

  const aadhaarDOB =
    formatAadhaarDOB(
      aadhaarData.date_of_birth
    );

  console.log(
    "PROFILE DOB:",
    profileDOB
  );

  console.log(
    "AADHAAR DOB:",
    aadhaarDOB
  );

  if (
    profileDOB !== aadhaarDOB
  ) {

    failures.push(
      "Date of birth mismatch"
    );
  }


  console.log(
    "FAILURES:",
    failures
  );


  return {

    valid:
      failures.length === 0,

    failures,
  };
}


module.exports = {
  validateKYC,
};