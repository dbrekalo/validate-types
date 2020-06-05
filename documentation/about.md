# About
- set expectations for valid object field types, check against native (String, Number, Boolean, Array, Object, Date, Function...) or custom constructors.
- mark required fields and provide default values.
- run custom validation on each field.
- extend validator with custom tests or create your own validator.

## Install
```
npm install validate-types;
```

## Usage example

```js
// require or import library
const validateTypes = require('validate-types');
// import validateTypes from 'validate-types';

// define validation schema
const schema = {
    firstName: String,
    lastName: {
        type: String,
        required: true
    },
    zipCode: [String, Number],
    age: {
        type: Number,
        validator: age => age > 17
    },
    acceptsCookies: {
        type: Boolean,
        default: false
    }
};

// call with schema and object to validate
var result = validateTypes(schema, {
    firstName: 42,
    age: 15
});

console.log(result);
// will output
{
   hasErrors: true,
   hasUndeclaredFields: false,
   errors: [
      {field: 'firstName', test: 'type', message: 'Field "firstName" is of invalid type'},
      {field: 'lastName', test: 'required', message: 'Field "lastName" is required'},
      {field: 'age', test: 'validator', message: 'Field "age" failed validation'}
   ],
   data: {
       firstName: 42,
       age: 15,
       acceptsCookies: false
   },
   undeclaredFields: {}
}
```
