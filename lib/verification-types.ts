export const VERIFICATION_TYPES = {
  ADVANCED: [
    {
      value: "aadhaar_otp",
      label: "Aadhaar ID + Aadhaar OTP",
      documentType: "aadhaar",
      requiresOtp: true,
      disclaimer: "You will need your Aadhaar card and access to the mobile number linked with your Aadhaar for OTP verification.",
      requirements: [
        "Valid Aadhaar card",
        "Mobile number linked with Aadhaar",
        "Clear photo of yourself",
        "Good internet connection for OTP delivery"
      ]
    },
    {
      value: "dl_aadhaar_otp",
      label: "Driving License + Aadhaar + OTP",
      documentType: "driving_license",
      requiresOtp: true,
      disclaimer: "You will need both your Driving License and Aadhaar card, along with access to the Aadhaar-linked mobile number.",
      requirements: [
        "Valid Driving License",
        "Valid Aadhaar card",
        "Mobile number linked with Aadhaar",
        "Clear photo of yourself"
      ]
    },
    {
      value: "voter_aadhaar_otp",
      label: "Voter ID + Aadhaar + OTP",
      documentType: "voter_id",
      requiresOtp: true,
      disclaimer: "You will need both your Voter ID and Aadhaar card, along with access to the Aadhaar-linked mobile number.",
      requirements: [
        "Valid Voter ID",
        "Valid Aadhaar card",
        "Mobile number linked with Aadhaar",
        "Clear photo of yourself"
      ]
    }
  ],
  MEDIUM: [
    {
      value: "driving_license",
      label: "Driving License",
      documentType: "driving_license",
      requiresOtp: false,
      disclaimer: "You will need a valid Driving License for this verification.",
      requirements: [
        "Valid Driving License",
        "Clear photo of yourself"
      ]
    }
  ],
  BASIC: [
    {
      value: "voter_id",
      label: "Voter ID",
      documentType: "voter_id",
      requiresOtp: false,
      disclaimer: "You will need a valid Voter ID for this verification.",
      requirements: [
        "Valid Voter ID",
        "Clear photo of yourself"
      ]
    }
  ]
};

export function getDocumentTypeFromVerificationType(verificationType: string): string {
  for (const category of Object.values(VERIFICATION_TYPES)) {
    const found = category.find(type => type.value === verificationType);
    if (found) {
      return found.documentType;
    }
  }
  return "unknown";
}

export function requiresOtp(verificationType: string): boolean {
  for (const category of Object.values(VERIFICATION_TYPES)) {
    const found = category.find(type => type.value === verificationType);
    if (found) {
      return found.requiresOtp;
    }
  }
  return false;
}