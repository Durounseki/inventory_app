import { body, validationResult } from "express-validator";

const loginValidators = [
    body("user-email").trim().notEmpty().withMessage('Please enter your email')
    .isEmail().withMessage('Please enter a valid email address'),
    body("user-password").trim()
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/\W/).withMessage('Password must contain at least one special character')
    .not().matches(/\s/).withMessage('Password must not contain any spaces'),
    //HoneyPot
    body('user-password-verify').custom((value) =>{
        if(value) {
            throw new Error('Bot detected!');
        }
        return true;
    })
]

const signupValidators = [
    body("user-name").trim().notEmpty().withMessage('Please enter your name, nickname or stage name')
    .isLength({max: 100}).withMessage('max 100 characters'),
    body("user-email").trim().notEmpty().withMessage('Please enter your email')
    .isEmail().withMessage('Please enter a valid email address'),
    body("user-password").trim()
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/\W/).withMessage('Password must contain at least one special character')
    .not().matches(/\s/).withMessage('Password must not contain any spaces'),
    body('user-password-confirm').trim().custom((value, { req }) => {
        if (value !== req.body['user-password']) {
          throw new Error('Passwords do not match');
        }
        return true; 
    }),
    //HoneyPot
    body('user-password-verify').custom((value) =>{
        if(value) {
            throw new Error('Bot detected!');
        }
        return true;
    })
]

function validateUserForm(req, res, next){
    
    //Check for errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const botDetected = errors.errors.some(error => error.msg === 'Bot detected!');
        if(botDetected){
            console.error('Bot detected during signup attempt!');
            return res.status(400).json({errors: [{msg: 'Invalid submission'}]});
        }else{
            return res.status(400).json({errors: errors.errors});
        }
    }
    console.log('No errors!');
    next();
}

export{
    loginValidators, signupValidators, validateUserForm
}