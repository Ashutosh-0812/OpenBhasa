const Validators = require('../utils/validators');

const validateRegistration = (req, res, next) => {
  const validation = Validators.validateUserRegistration(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  // Replace request body with validated and cleaned data
  req.body = validation.validatedData;
  next();
};

const validateLogin = (req, res, next) => {
  const validation = Validators.validateLogin(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  req.body = validation.validatedData;
  next();
};

const validateForgotPassword = (req, res, next) => {
  const validation = Validators.validateForgotPassword(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  req.body = validation.validatedData;
  next();
};

const validateResetPassword = (req, res, next) => {
  const validation = Validators.validateResetPassword({
    ...req.body,
    token: req.params.token
  });
  
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  req.body = validation.validatedData;
  next();
};

const validateParticipant = (req, res, next) => {
  const validation = Validators.validateUserRegistration(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  req.body = validation.validatedData;
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateParticipant
};