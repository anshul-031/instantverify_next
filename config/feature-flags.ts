interface FeatureFlags {
  auth: {
    googleLogin: boolean;
    facebookLogin: boolean;
    githubLogin: boolean;
  };
  verification: {
    aadhaarVerification: boolean;
    voterIdVerification: boolean;
    drivingLicenseVerification: boolean;
    panCardVerification: boolean;
  };
  payment: {
    razorpay: boolean;
    gstInvoice: boolean;
  };
  features: {
    accessManagement: boolean;
    couponManagement: boolean;
    requestVerification: boolean;
    verificationHistory: boolean;
  };
  logging: {
    frontend: {
      debug: boolean;
      info: boolean;
      error: boolean;
    };
    backend: {
      debug: boolean;
      info: boolean;
      error: boolean;
    };
  };
}

const development: FeatureFlags = {
  auth: {
    googleLogin: true,
    facebookLogin: true,
    githubLogin: true,
  },
  verification: {
    aadhaarVerification: true,
    voterIdVerification: true,
    drivingLicenseVerification: true,
    panCardVerification: true,
  },
  payment: {
    razorpay: true,
    gstInvoice: true,
  },
  features: {
    accessManagement: true,
    couponManagement: true,
    requestVerification: true,
    verificationHistory: true,
  },
  logging: {
    frontend: {
      debug: true,
      info: true,
      error: true,
    },
    backend: {
      debug: true,
      info: true,
      error: true,
    },
  },
};

const production: FeatureFlags = {
  auth: {
    googleLogin: process.env.ENABLE_GOOGLE_LOGIN === 'true',
    facebookLogin: process.env.ENABLE_FACEBOOK_LOGIN === 'true',
    githubLogin: process.env.ENABLE_GITHUB_LOGIN === 'true',
  },
  verification: {
    aadhaarVerification: true,
    voterIdVerification: true,
    drivingLicenseVerification: true,
    panCardVerification: true,
  },
  payment: {
    razorpay: true,
    gstInvoice: process.env.ENABLE_GST_INVOICE === 'true',
  },
  features: {
    accessManagement: true,
    couponManagement: true,
    requestVerification: true,
    verificationHistory: true,
  },
  logging: {
    frontend: {
      debug: false,
      info: true,
      error: true,
    },
    backend: {
      debug: false,
      info: true,
      error: true,
    },
  },
};

const featureFlags = process.env.NODE_ENV === 'production' ? production : development;

export default featureFlags;