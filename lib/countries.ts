export const SUPPORTED_COUNTRIES = [
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    supportedDocuments: [
      {
        type: "aadhaar",
        name: "Aadhaar Card",
        verificationTypes: ["aadhaar_otp", "dl_aadhaar_otp", "voter_aadhaar_otp"]
      },
      {
        type: "driving_license",
        name: "Driving License",
        verificationTypes: ["driving_license", "dl_aadhaar_otp"]
      },
      {
        type: "voter_id",
        name: "Voter ID",
        verificationTypes: ["voter_id", "voter_aadhaar_otp"]
      }
    ]
  }
  // More countries will be added later
];

export function getCountryByCode(code: string) {
  return SUPPORTED_COUNTRIES.find(country => country.code === code);
}

export function getSupportedDocuments(countryCode: string) {
  const country = getCountryByCode(countryCode);
  return country?.supportedDocuments || [];
}