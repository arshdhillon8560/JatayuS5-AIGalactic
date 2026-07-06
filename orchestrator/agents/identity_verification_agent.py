def verify_identity(profile, parsed_docs):
    """
    Verify applicant identity using all parsed documents.

    Rules:
    - Compare only if a value is extracted.
    - Ignore None values.
    - Reject immediately if any mismatch is found.
    """

    profile_name = (profile.get("name") or "").strip().lower()
    profile_pan = (profile.get("pan") or "").strip().upper()
    profile_aadhaar = (profile.get("aadhaar") or "").strip()

    print("\n========== IDENTITY VERIFICATION ==========")

    for document_name, document in parsed_docs.items():

        print(f"\nChecking {document_name}")

        # -----------------------------
        # NAME VERIFICATION
        # -----------------------------
        doc_name = document.get("name")

        if doc_name:

            print(f"Document Name : {doc_name}")
            print(f"Database Name : {profile_name}")

            if profile_name not in doc_name.strip().lower():

                return (
                    False,
                    f"Name mismatch in {document_name}"
                )

            print("✅ Name Verified")

        else:
            print("⚠ Name not found -> Skipped")

        # -----------------------------
        # PAN VERIFICATION
        # -----------------------------
        doc_pan = document.get("pan")

        if doc_pan:

            print(f"Document PAN : {doc_pan}")
            print(f"Database PAN : {profile_pan}")

            if profile_pan != doc_pan.strip().upper():

                return (
                    False,
                    f"PAN mismatch in {document_name}"
                )

            print("✅ PAN Verified")

        else:
            print("⚠ PAN not found -> Skipped")

        # -----------------------------
        # AADHAAR VERIFICATION
        # -----------------------------
        doc_aadhaar = document.get("aadhaar")

        if doc_aadhaar:

            print(f"Document Aadhaar : {doc_aadhaar}")
            print(f"Database Aadhaar : {profile_aadhaar}")

            if profile_aadhaar != doc_aadhaar.strip():

                return (
                    False,
                    f"Aadhaar mismatch in {document_name}"
                )

            print("✅ Aadhaar Verified")

        else:
            print("⚠ Aadhaar not found -> Skipped")

    print("\n✅ Identity Verification Passed")

    return (
        True,
        "Identity verified"
    )