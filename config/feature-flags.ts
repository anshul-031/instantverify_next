interface FeatureFlags {
  ENABLE_GOOGLE_LOGIN: boolean;
  ENABLE_FACEBOOK_LOGIN: boolean;
  ENABLE_GITHUB_LOGIN: boolean;
  ENABLE_GST_INVOICE: boolean;
}

const development: FeatureFlags = {
  ENABLE_GOOGLE_LOGIN: true,
  ENABLE_FACEBOOK_LOGIN: true,
  ENABLE_GITHUB_LOGIN: true,
  ENABLE_GST_INVOICE: true,
};

const production: FeatureFlags = {
  ENABLE_GOOGLE_LOGIN: process.env.ENABLE_GOOGLE_LOGIN === 'true',
  ENABLE_FACEBOOK_LOGIN: process.env.ENABLE_FACEBOOK_LOGIN === 'true',
  ENABLE_GITHUB_LOGIN: process.env.ENABLE_GITHUB_LOGIN === 'true',
  ENABLE_GST_INVOICE: process.env.ENABLE_GST_INVOICE === 'true',
};

const featureFlags = process.env.NODE_ENV === 'production' ? production : development;

export default featureFlags;