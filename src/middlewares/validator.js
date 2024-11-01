const Joi = require("joi")
const createError = require("../utility/createError")

// Joi Object
// Auth path
const registerSchema = Joi.object({
    email: Joi
        .string()
        .email({ tlds: false })
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.base": "Email must be a string.",
            "string.email": "Email must be valid."
        }),
    password: Joi
        .string()
        .required()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~])[A-Za-z\d!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~]{1,}$/)
        .messages({
            "string.empty": "Password is required.",
            "string.base": "Password must be a string.",
            "string.min": "Password should longer than 6 characters.",
            "string.pattern.base": "Password should have number, upper, lower and special character."
        }),
    confirmPassword: Joi
        .string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': "password does not match.",
            "string.empty": "Confirm password is required.",
        }),
    firstName: Joi
        .string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.empty': 'First name is required.',
            'string.min': 'First name must be at least 1 character.',
            'string.max': 'First name must be less than or equal to 50 characters.'
        }),
    lastName: Joi
        .string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Last name is required.',
            'string.min': 'Last name must be at least 1 character.',
            'string.max': 'Last name must be less than or equal to 50 characters.'
        }),
    phone: Joi
        .string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be exactly 10 digits.'
        }),
    gender: Joi
        .string()
        .valid('MALE', 'FEMALE', 'OTHER')
        .optional()
        .messages({
            'any.only': 'Gender must be either MALE, FEMALE, or OTHER.'
        }),
    birthdate: Joi
        .date()
        .iso()
        .min('1900-01-01')
        .max('now')
        .optional()
        .message({
            'date.min': 'Birth date cannot be earlier than January 1, 1900.',
            'date.max': 'Birth date must be a date in the past.'
        })
})


const loginSchema = Joi.object({
    email: Joi
        .string()
        .email({ tlds: false })
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.base": "Email must be a string.",
            "string.email": "Email or Password incorrect."
        }),
    password: Joi
        .string()
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.base": "Password must be a string.",
            "string.pattern.base": "Email or Password incorrect."
        }),
})

const updateUserSchema = Joi.object({
    firstName: Joi
        .string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.empty': 'First name is required.',
            'string.min': 'First name must be at least 1 character.',
            'string.max': 'First name must be less than or equal to 50 characters.'
        }),
    lastName: Joi
        .string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Last name is required.',
            'string.min': 'Last name must be at least 1 character.',
            'string.max': 'Last name must be less than or equal to 50 characters.'
        }),
    phone: Joi
        .string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be exactly 10 digits.'
        }),
    gender: Joi
        .string()
        .valid('MALE', 'FEMALE', 'OTHER')
        .optional()
        .messages({
            'any.only': 'Gender must be either MALE, FEMALE, or OTHER.'
        }),
    birthdate: Joi
        .date()
        .iso()
        .min('1900-01-01')
        .max('now')
        .optional()
        .message({
            'date.min': 'Birth date cannot be earlier than January 1, 1900.',
            'date.max': 'Birth date must be a date in the past.'
        })
})


const forgetPasswordSchema = Joi.object({
    password: Joi
        .string()
        .required()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~])[A-Za-z\d!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~]{1,}$/)
        .messages({
            "string.empty": "Password is required.",
            "string.base": "Password must be a string.",
            "string.min": "Password should longer than 6 characters.",
            "string.pattern.base": "Password should have number, upper, lower and special character."
        }),
    confirmPassword: Joi
        .string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': "password does not match.",
            "string.empty": "Confirm password is required.",
        }),
})





//validate function
const validateSchema = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body)
    if (error) {
        return createError(400, error.details[0].message)
    }
    req.input = value
    next();
}

const validateQuery = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.query)
    if (error) {
        return createError(400, error.details[0].message)
    }
    req.input = value
    next();
}


// Export
module.exports.registerValidator = validateSchema(registerSchema)
module.exports.loginValidator = validateSchema(loginSchema)
module.exports.updateUserValidator = validateSchema(updateUserSchema)
module.exports.forgetPasswordValidator = validateSchema(forgetPasswordSchema)