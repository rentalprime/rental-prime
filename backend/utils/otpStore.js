const otpStore = new Map(); // key: phone, value: { otp, expiresAt }

// const setOtp = (phone, otp) => {
//   otpStore.set(phone, { otp, expiresAt });
// };
exports.setOtp = (key, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry
  otpStore.set(key, { otp, expiresAt }); // 5 mins
};

exports.verifyOtp = (key, otp) => {
  const record = otpStore.get(key);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
    return false;
  }
  otpStore.delete(key); // OTP can only be used once
  return true;
};

exports.deleteOtp = (key) => otpStore.delete(key);
