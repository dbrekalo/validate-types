# Api and examples

## Type validation
Each object field can be validated against single or multiple native types.
```js
const validateTypes = require('validate-types');

const schema = {
    // single type allowed
    name: String,
    // single type allowed
    // combined with additional field rules
    acceptsCookies: {
        type: Boolean,
        required: true
    },
    // multiple types allowed
    zipCode: [String, Number]
    // zipCode: {type: [String, Number]}
};

const result = validateTypes(schema, {
    name: 123
});
```
Custom constructors can also be added to schema (internally checked using instanceof operator).
```js
const MyCustomType = function() {};

const schema = {
    name: {
        type: MyCustomType
    }
};
````

## Validation result
Validation output is object with properties examined bellow.
```js
{
    // did validation pass?
    hasErrors: true,
    // were there fields not declared in schema?
    hasUndeclaredFields: false,
    // error list describing which field
    // failed which test
    errors: [
        {field: 'name', test: 'type', message: 'Field "name" is of invalid type'},
        {field: 'acceptsCookies', test: 'required', message: 'Field "acceptsCookies" is required'}
    ],
    // input data merged with schema defaults
    data: {
        name: false
    },
    // user input fields not declared in schema
    undeclaredFields: {}
}
```

## Undeclared fields
Fields in input object not defined in schema will be reported as undeclared fields in validation output.
```js
const schema = {firstName: String};
const result = validateTypes(schema, {
    firstName: 'John'
    lastName: 'Doe' // undeclared field in schema
});

// validation result will have no errors
// but will report undeclared fields
{
    hasErrors: false,
    hasUndeclaredFields: true,
    errors: [],
    data: {
        firstName: 'John'
    },
    undeclaredFields: {
        lastName: 'Doe'
    }
}
````

## Required fields
Fields can be marked as required when input is mandatory.
```js
const schema = {
    firstName: {
        type: String,
        required: true // mark field as required
    }
}
// will report errors since title is required
// and missing from user input
validateTypes(schema, {
    lastName: 'Doe'
}).hasErrors === true
````

## Field defaults
Default field values can be defined and used when user input is not required.
```js
const schema = {
    title: String,
    published: {
        type: Boolean,
        // set default value
        default: true
    },
    tags: {
        type: Array,
        // default value can be expressed as function
        // to safely generate non primitive values
        default: () => (['foo', 'bar'])
    }
}

const result = validateTypes(schema, {
    title: 'Test'
});
// result.data will have user input
// merged with schema defaults
{
    title: 'Test',
    published: true,
    tags: ['foo', 'bar']
}
````
Defaults assignment can be disabled:
```js
validateTypes(schema, userInput, {
    assignDefaults: false
});
````

Defaults can be extracted from schema:
```js
validateTypes.extractDefaults(schema);
````

## Custom validator test
Field value can be validated inline with custom validator logic.
```js
const schema = {
    age: {
        type: Number,
        validator: age => age > 18
    }
};

// will report errors since age field
// does not pass validator test
validateTypes(schema, {
    age: 10
}).hasErrors === true;
````

## Changing error messages
Default validation output messages can be replaced with custom ones.
```js
const schema = {
    title: {
        type: String,
        required: true
    }
}
validateTypes(schema, {
    title: 111
}, {
    // override messages for title field
    messages: {
        title: {
            type: 'Invalid title type',
            required: 'Title is required'
        }
    }
});
````
Change messages for all future validation calls:
```js
validateTypes.setTestMessage('required', 'Field is required');
validateTypes.setTestMessage('type', function({fieldName}) {
    return `Field ${fieldName} has wrong type`;
});
````

## Adding tests
Custom tests can be added to extend validator functionality.
```js
validateTypes.addTest({
    name: 'minLength',
    validate: ({fieldValue, testConfig: minLength}) => {
        return fieldValue.length >= minLength;
    },
    message: ({fieldName, testConfig: minLength}) => {
        return `Field "${fieldName}"" min length is ${minLength} characters`;
    }
});
const schema = {
    title: {
        type: String,
        minLength: 4
    }
};
// following will produce "minLength" error
validateTypes(schema, {title: 'Foo'});
```
**Validate and message function** are called with following parameters:
- ```fieldValue```: current field value being tested (String ```'Foo'``` in example above)
- ```fieldName```: field name in input / schema (```'title'``` in example)
- ```fieldSchema```: current field schema (```{type: String, minLength: 4}``` in example)
- ```testConfig```: test config value (number ```4``` in example)
- ```input```: complete input object (```{title: 'Foo'}```)
- ```schema```: complete schema object  (```{title: {type: String, minLength: 4}}```)
- ```validator```: current validator instance

Test can be configured to skip further field value tests:
```js
validateTypes.addTest({
    name: 'foo',
    message: 'Field must be "foo"',
    validate: ({fieldValue}) => {
        return fieldValue === 'foo'
    },
    skipFurtherTests: ({validateResult}) => {
        return validateResult === false;
    }
});
```
**skipFurtherTests** function has:
- ```validateResult```: result of validate function
- rest of parameters identical to validate and message functions

**Test position in test stack** can be set when adding tests:
```js
const nullableTest = require('validate-types/tests/nullable');
const minLengthTest = require('validate-types/tests/min-length');

validateTypes.addTest(readOnlyTest, {insertAfter: 'required'});
validateTypes.addTest(minLengthTest, {insertBefore: 'validator'});
```

## Creating validators
New validators can be created to produce isolated validator instances.
Tests added or customized on created instance will not affect main validator or other validator instances.
```js
const myValidator = validateTypes.createValidator();
// will create new validator instance with "required, type and validator tests"
```
Customize validator instance tests like in example bellow
(test order is important, validator will run tests in same order as they were defined):
```js
const requiredTest = require('validate-types/tests/required');
const typeTest = require('validate-types/tests/type');
const validatorTest = require('validate-types/tests/validator');
const myTest = require('./my-test');

const myValidator = validateTypes.createValidator([
    requiredTest,
    typeTest,
    myTest,
    validatorTest
]);
```

## Validating single values
Single values can also be validated using field schema:
```js
validateTypes.validateValue('foo', {
    type: [String, Number]
})
````
