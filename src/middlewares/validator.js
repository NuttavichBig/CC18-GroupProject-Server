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
});

// Hotel path
const getHotelQuerySchema = Joi.object({
    search: Joi
        .string()
        .optional()
        .allow('')
        .messages({
            'string.base': 'Search term must be a string'
        }),
    maxPrice: Joi
        .number()
        .optional()
        .greater(Joi.ref('minPrice'))
        .messages({
            'number.base': 'Max price must be a number',
            'number.greater': '"maxPrice" must be greater than "minPrice"',
        }),
    minPrice: Joi
        .number()
        .optional()
        .messages({
            'number.base': 'Min price must be a number'
        }),
    star: Joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.base': 'Star rating must be a number',
            'number.integer': 'Star rating must be an integer',
            'number.min': 'Star rating must be at least 1',
            'number.max': 'Star rating must be at most 5'
        }),
    orderBy: Joi
        .string()
        .valid('asc', 'desc')
        .default('asc')
        .optional()
        .messages({
            'any.only': 'Order by must be either "asc" or "desc"',
            'string.base': 'Order by must be a string'
        }),
    sortBy: Joi
        .string()
        .valid('rating', 'price', 'id')
        .default('id')
        .optional()
        .messages({
            'any.only': 'Sort by must be one of "rating", "price", or "id"',
            'string.base': 'Sort by must be a string'
        }),
    facilities: Joi
        .array()
        .items(Joi.string())
        .optional()
        .messages({
            'array.base': 'Facilities must be an array',
            'array.includes': 'Facilities must contain only strings'
        }),
    limit: Joi
        .number()
        .integer()
        .min(1)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be greater than or equal to 1',
        }),
    page: Joi
        .number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be greater than or equal to 1',
        }),
})
// .and('maxPrice', 'minPrice'); // Sure that ,maxPrice amd minPrice are provided together

const createHotelSchema = Joi.object({
    name: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'any.required': 'Name is required'
        }),
    detail: Joi
        .string()
        .optional()
        .allow('')
        .messages({
            'string.base': 'Detail must be a string'
        }),
    address: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Address must be a string',
            'any.required': 'Address is required'
        }),

    lat: Joi
        .number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Latitude must be a number',
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
            'any.required': 'Latitude is required'
        }),

    lng: Joi
        .number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Longitude must be a number',
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
            'any.required': 'Longitude is required'
        }),

    star: Joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.base': 'Star rating must be a number',
            'number.integer': 'Star rating must be an integer',
            'number.min': 'Star rating must be at least 1',
            'number.max': 'Star rating must be at most 5',
            'any.required': 'Star rating is required'
        }),

    checkInTime: Joi
        .string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-in time must be a string',
            'string.pattern.base': 'Check-in time must be in "HH:MM" format',
            'any.required': 'Check-in time is required'
        }),

    checkOutTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-out time must be a string',
            'string.pattern.base': 'Check-out time must be in "HH:MM" format',
            'any.required': 'Check-out time is required'
        }),

    facilityHotel: Joi
        .object()
        .pattern(Joi.boolean())
        .required()
        .messages({
            'object.base': 'Facilities must be an object with boolean values',
            'any.required': 'Facilities are required'
        })
});

const updateHotelSchema = Joi.object({
    name: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'any.required': 'Name is required'
        }),
    detail: Joi
        .string()
        .optional()
        .allow('')
        .messages({
            'string.base': 'Detail must be a string'
        }),
    address: Joi
        .string()
        .required()
        .messages({
            'string.base': 'Address must be a string',
            'any.required': 'Address is required'
        }),

    lat: Joi
        .number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Latitude must be a number',
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
            'any.required': 'Latitude is required'
        }),

    lng: Joi
        .number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Longitude must be a number',
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
            'any.required': 'Longitude is required'
        }),

    star: Joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
            'number.base': 'Star rating must be a number',
            'number.integer': 'Star rating must be an integer',
            'number.min': 'Star rating must be at least 1',
            'number.max': 'Star rating must be at most 5',
            'any.required': 'Star rating is required'
        }),

    checkInTime: Joi
        .string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-in time must be a string',
            'string.pattern.base': 'Check-in time must be in "HH:MM" format',
            'any.required': 'Check-in time is required'
        }),

    checkOutTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .messages({
            'string.base': 'Check-out time must be a string',
            'string.pattern.base': 'Check-out time must be in "HH:MM" format',
            'any.required': 'Check-out time is required'
        }),

    facilityHotel: Joi
        .object()
        .pattern(Joi.boolean())
        .required()
        .messages({
            'object.base': 'Facilities must be an object with boolean values',
            'any.required': 'Facilities are required'
        })
});



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

// auth
module.exports.registerValidator = validateSchema(registerSchema)
module.exports.loginValidator = validateSchema(loginSchema)
module.exports.updateUserValidator = validateSchema(updateUserSchema)
module.exports.forgetPasswordValidator = validateSchema(forgetPasswordSchema)

// hotel
module.exports.getHotelQueryValidator = validateQuery(getHotelQuerySchema)
module.exports.createHotelValidator = validateSchema(createHotelSchema)
module.exports.updateHotelValidator = validateSchema(updateHotelSchema)