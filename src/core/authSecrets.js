// Demo gate secrets (hashed only)
// SECURITY NOTE:
// - This is a static-site demo gate, not real backend authentication.
// - Never store plaintext passwords in this repository.
// - Rotate access codes regularly and share privately.

export const AUTH_SECRETS = {
  ownerPassHash: 'ed5c3976cafda9fc86d142eb85a7a4c2a470c51687ef3be39391366a0400b60f',
  guestPassHash: 'b13a191dd9beb20c0b96d16fa9d3c82a50e32b2e5710ac73206632746c849b64'
};

export default AUTH_SECRETS;