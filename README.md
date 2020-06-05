# Validate types

[![Build Status](https://travis-ci.org/dbrekalo/validate-types.svg?branch=master)](https://travis-ci.org/dbrekalo/validate-types)
[![NPM Status](https://img.shields.io/npm/v/validate-types.svg)](https://www.npmjs.com/package/validate-types)

Validate object fields using simple schema.
Works in browser or server side. Packs no dependencies and weighs less than 2KB.

[Documentation and examples](http://dbrekalo.github.io/validate-types/).

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
    address: String,
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

[Documentation and examples](http://dbrekalo.github.io/validate-types/).
