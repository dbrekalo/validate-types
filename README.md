# Validate types

[![Build Status](https://travis-ci.org/dbrekalo/validate-types.svg?branch=master)](https://travis-ci.org/dbrekalo/validate-types)
[![Coverage Status](https://coveralls.io/repos/github/dbrekalo/validate-types/badge.svg?branch=master)](https://coveralls.io/github/dbrekalo/validate-types?branch=master)
[![NPM Status](https://img.shields.io/npm/v/validate-types.svg)](https://www.npmjs.com/package/validate-types)

Validate object properties against type schema.
Lightweight library for browser and server usage. Has no dependencies and weighs less than 1KB.

[Visit documentation site](http://dbrekalo.github.io/validate-types/).

Set expectations for valid object property types.
Mark properties as required and provide default values.
Custom validation logic can also be used when simple type checks are not enough.
Validator output can be inspected for validation errors and resulting dataset merged from schema defaults and user provided properties.

Types can be checked against native constructors (String, Number, Boolean, Array, Object, Date, Function...)
or custom constructors (internally checked with instanceOf operator).

Supports all browsers that are ES5-compliant (IE8 and below are not supported).

## Examples and api

Single function is exposed (validateTypes) which takes schema as first and object to validate as second parameter.
Example of failed validation is shown bellow:

```js
// require / import library
var validateTypes = require('validate-types');

// define schema to validate object against
var schema = {
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

// call library with schema and object to validate
var result = validateTypes(schema, {
    firstName: 42,
    age: 15
});

console.log(result);
// will output
{
   hasErrors: true,
   errors: [
      {key: 'firstName', message: 'Prop "firstName" is of invalid type'},
      {key: 'lastName', message: 'Prop "lastName" is required'},
      {key: 'age', message: 'Prop "age" failed to pass validator check'}
   ],
   data: {
       firstName: 'John',
       age: 15,
       acceptsCookies: false
   }
}
```

Example where validation passes:
```js
// call with valid input object
var result = validateTypes(schema, {
    lastName: 'Doe',
    age: 18
});

console.log(result);
// will output
{
   hasErrors: false,
   errors: [],
   data: {
       lastName: 'Doe',
       age: 18,
       acceptsCookies: false
   }
}
```

## Installation

Validate types is packaged as UMD library so you can use it both on client and server (CommonJS and AMD environment) or with browser globals.

```js
// install via npm
npm install validate-types --save

// if you use bundler
var validateTypes = require('validate-types');

// or use browser globals
var validateTypes = window.validateTypes;
```