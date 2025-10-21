const validator = require('validator')

class Validators {
  // Name validation
  static validateName (name) {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        message: 'Name is required and must be a string'
      }
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return {
        isValid: false,
        message: 'Name must be between 2 and 50 characters'
      }
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return {
        isValid: false,
        message: 'Name can only contain letters and spaces'
      }
    }

    return { isValid: true }
  }

  // Email validation
  static validateEmail (email) {
    if (!email || typeof email !== 'string') {
      return {
        isValid: false,
        message: 'Email is required and must be a string'
      }
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!validator.isEmail(trimmedEmail)) {
      return { isValid: false, message: 'Please provide a valid email address' }
    }

    if (trimmedEmail.length > 100) {
      return { isValid: false, message: 'Email must not exceed 100 characters' }
    }

    return { isValid: true, email: trimmedEmail }
  }

  // Phone validation
  static validatePhone (phone) {
    if (!phone || typeof phone !== 'string') {
      return {
        isValid: false,
        message: 'Phone number is required and must be a string'
      }
    }

    const cleanedPhone = phone.replace(/\D/g, '')
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return {
        isValid: false,
        message: 'Phone number must be between 10 and 15 digits'
      }
    }

    if (!/^\d+$/.test(cleanedPhone)) {
      return { isValid: false, message: 'Phone number can only contain digits' }
    }

    return { isValid: true, phone: cleanedPhone }
  }

  // Password validation
  static validatePassword (password) {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        message: 'Password is required and must be a string'
      }
    }

    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters long'
      }
    }

    if (password.length > 100) {
      return {
        isValid: false,
        message: 'Password must not exceed 100 characters'
      }
    }

    // Check for at least one uppercase letter
    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      }
    }

    // Check for at least one lowercase letter
    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      }
    }

    // Check for at least one number
    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number'
      }
    }

    return { isValid: true }
  }

  // Age validation
  static validateAge (age) {
    if (age === undefined || age === null) {
      return { isValid: false, message: 'Age is required' }
    }

    const ageNum = Number(age)
    if (isNaN(ageNum)) {
      return { isValid: false, message: 'Age must be a valid number' }
    }

    if (ageNum < 1 || ageNum > 120) {
      return { isValid: false, message: 'Age must be between 1 and 120' }
    }

    return { isValid: true, age: ageNum }
  }

  // College validation
  static validateCollege (college) {
    if (!college || typeof college !== 'string') {
      return {
        isValid: false,
        message: 'College name is required and must be a string'
      }
    }

    const trimmedCollege = college.trim()
    if (trimmedCollege.length < 2 || trimmedCollege.length > 100) {
      return {
        isValid: false,
        message: 'College name must be between 2 and 100 characters'
      }
    }

    return { isValid: true, college: trimmedCollege }
  }

  // Gender validation
  static validateGender (gender) {
    if (!gender || typeof gender !== 'string') {
      return { isValid: false, message: 'Gender is required' }
    }

    const validGenders = ['male', 'female', 'other']
    const lowerGender = gender.toLowerCase()

    if (!validGenders.includes(lowerGender)) {
      return {
        isValid: false,
        message: 'Gender must be male, female, or other'
      }
    }

    return { isValid: true, gender: lowerGender }
  }

  // Native validation
  static validateNative (native) {
    if (!native || typeof native !== 'string') {
      return {
        isValid: false,
        message: 'Native language is required and must be a string'
      }
    }

    const trimmedNative = native.trim()
    if (trimmedNative.length < 2 || trimmedNative.length > 50) {
      return {
        isValid: false,
        message: 'Native language must be between 2 and 50 characters'
      }
    }

    return { isValid: true, native: trimmedNative }
  }

  // Array validation for languages, dialects, accents
  static validateStringArray (fieldName, array, minItems = 1, maxItems = 10) {
    if (!Array.isArray(array)) {
      return { isValid: false, message: `${fieldName} must be an array` }
    }

    if (array.length < minItems) {
      return {
        isValid: false,
        message: `${fieldName} must have at least ${minItems} item(s)`
      }
    }

    if (array.length > maxItems) {
      return {
        isValid: false,
        message: `${fieldName} cannot have more than ${maxItems} items`
      }
    }

    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      if (typeof item !== 'string' || item.trim().length === 0) {
        return {
          isValid: false,
          message: `All items in ${fieldName} must be non-empty strings`
        }
      }

      if (item.trim().length > 50) {
        return {
          isValid: false,
          message: `Items in ${fieldName} cannot exceed 50 characters`
        }
      }
    }

    return { isValid: true, array: array.map(item => item.trim()) }
  }

  // Role validation
  static validateRole (role) {
    if (!role) {
      return { isValid: true, role: 'student' } // Default role
    }

    if (typeof role !== 'string') {
      return { isValid: false, message: 'Role must be a string' }
    }

    const validRoles = ['student', 'admin', 'participant', 'reviewer']
    const lowerRole = role.toLowerCase()

    if (!validRoles.includes(lowerRole)) {
      return {
        isValid: false,
        message: 'Role must be one of: student, admin, participant, reviewer'
      }
    }

    return { isValid: true, role: lowerRole }
  }

  // Complete user registration validation
  static validateUserRegistration (data) {
    const errors = []
    const validatedData = {}

    // Validate name
    const nameValidation = this.validateName(data.name)
    if (!nameValidation.isValid) errors.push(nameValidation.message)
    else validatedData.name = data.name.trim()

    // Validate email
    const emailValidation = this.validateEmail(data.email)
    if (!emailValidation.isValid) errors.push(emailValidation.message)
    else validatedData.email = emailValidation.email

    // Validate phone
    const phoneValidation = this.validatePhone(data.phone)
    if (!phoneValidation.isValid) errors.push(phoneValidation.message)
    else validatedData.phone = phoneValidation.phone

    // Validate password
    const passwordValidation = this.validatePassword(data.password)
    if (!passwordValidation.isValid) errors.push(passwordValidation.message)
    else validatedData.password = data.password

    // Validate age
    const ageValidation = this.validateAge(data.age)
    if (!ageValidation.isValid) errors.push(ageValidation.message)
    else validatedData.age = ageValidation.age

    // Validate college
    const collegeValidation = this.validateCollege(data.college)
    if (!collegeValidation.isValid) errors.push(collegeValidation.message)
    else validatedData.college = collegeValidation.college

    // Validate gender
    const genderValidation = this.validateGender(data.gender)
    if (!genderValidation.isValid) errors.push(genderValidation.message)
    else validatedData.gender = genderValidation.gender

    // Validate native
    const nativeValidation = this.validateNative(data.native)
    if (!nativeValidation.isValid) errors.push(nativeValidation.message)
    else validatedData.native = nativeValidation.native

    // Validate language array
    const languageValidation = this.validateStringArray(
      'Language',
      data.language,
      1,
      5
    )
    if (!languageValidation.isValid) errors.push(languageValidation.message)
    else validatedData.language = languageValidation.array

    // Validate dialects array (optional)
    if (data.dialects) {
      const dialectsValidation = this.validateStringArray(
        'Dialects',
        data.dialects,
        0,
        5
      )
      if (!dialectsValidation.isValid) errors.push(dialectsValidation.message)
      else validatedData.dialects = dialectsValidation.array
    } else {
      validatedData.dialects = []
    }

    // Validate accent array (optional)
    if (data.accent) {
      const accentValidation = this.validateStringArray(
        'Accent',
        data.accent,
        0,
        5
      )
      if (!accentValidation.isValid) errors.push(accentValidation.message)
      else validatedData.accent = accentValidation.array
    } else {
      validatedData.accent = []
    }

    // Validate role
    const roleValidation = this.validateRole(data.role)
    if (!roleValidation.isValid) errors.push(roleValidation.message)
    else validatedData.role = roleValidation.role

    return {
      isValid: errors.length === 0,
      errors,
      validatedData
    }
  }

  // Login validation
  static validateLogin (data) {
    const errors = []
    const validatedData = {}

    // Validate email
    const emailValidation = this.validateEmail(data.email)
    if (!emailValidation.isValid) errors.push(emailValidation.message)
    else validatedData.email = emailValidation.email

    // Validate password (basic check for login)
    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required')
    } else {
      validatedData.password = data.password
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedData
    }
  }

  // Forgot password validation
  static validateForgotPassword (data) {
    const errors = []
    const validatedData = {}

    // Validate email
    const emailValidation = this.validateEmail(data.email)
    if (!emailValidation.isValid) errors.push(emailValidation.message)
    else validatedData.email = emailValidation.email

    return {
      isValid: errors.length === 0,
      errors,
      validatedData
    }
  }

  // Reset password validation
  static validateResetPassword (data) {
    const errors = []
    const validatedData = {}

    // Validate token
    if (!data.token || typeof data.token !== 'string') {
      errors.push('Reset token is required')
    } else {
      validatedData.token = data.token
    }

    // Validate new password
    const passwordValidation = this.validatePassword(data.password)
    if (!passwordValidation.isValid) errors.push(passwordValidation.message)
    else validatedData.password = data.password

    return {
      isValid: errors.length === 0,
      errors,
      validatedData
    }
  }
}

module.exports = Validators
