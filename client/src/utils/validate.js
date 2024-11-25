// Function to validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Function to validate phone number
export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phoneNumber);
};

// Function to validate Vietnamese identifier card
export const validateIdentifierCard = (identifier) => {
  const idRegex = /^[0-9]{12}$/;
  return idRegex.test(identifier);
};
