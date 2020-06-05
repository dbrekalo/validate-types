# Additional tests
Core library bundles only ```required```, ```type``` and ```validator``` tests to keep things fast and simple.
Additional test can be pulled from library to your validator.

```js
const validateTypes = require('validate-types');
const minLengthTest = require('validate-types/tests/min-length');

validateTypes.addTest(minLengthTest);
````
All available additional tests can be loaded and used like in example bellow:
```js
const validateTypes = require('validate-types');
const allTests = require('validate-types/tests/all');

const validator = validateTypes.createValidator(allTests);
````

## Min length
Validate field minimal expected length.
```js
const schema = {
    title: {
        type: String,
        minLength: 3
    }
};
```

## Max length
Validate field maximum expected length.
```js
const schema = {
    title: {
        type: String,
        maxLength: 33
    }
};
```

## Pattern
Validate strings using regular expression tests.
```js
const schema = {
    title: {
        type: String,
        pattern: /^foo/
    }
};
```

## Email
Validate if field value is valid email.
```js
const schema = {
    username: {
        type: String,
        email: true
    }
};
```
Update email pattern if needed:
```js
var emailTest = require('validate-types/tests/email');
emailTest.setPattern(customRE);
```

## Equals
Validate if field value equals expected value.
```js
const schema = {
    title: {
        type: String,
        equals: 'foo'
    }
};
```

## Equals field
Validate if field value equals another fields value.
```js
const schema = {
    password: {
        type: String,
        equalsField: 'repeatPassword'
    },
    repeatPassword: String
};
```

## One of
Validate if field value equals one of predefined values.
```js
const schema = {
    status: {
        type: Number,
        oneOf: [1, 2, 3]
    }
};
```

## Integer
Validate if field value is integer.
```js
const schema = {
    title: {
        type: Number,
        integer: true
    }
};
```

## Max
Validate maximum field value.
```js
const schema = {
    title: {
        type: Number,
        max: 100
    }
};
```

## Min
Validate minimum field value.
```js
const schema = {
    title: {
        type: Number,
        min: 0
    }
};
```

## Nullable
Allow fields to have ```null``` as value regardless of declared type.
```js
const schema = {
    title: {
        type: Object,
        nullable: true
    }
};
```

## Read-only
Report fields as read only when received in validation input.
```js
const schema = {
    orderStatus: {
        type: String,
        readOnly: true
    }
};
```

## Object schema
Validate object fields against validation schema.
```js
const schema = {
    config: {
        type: Object,
        objectSchema: {
            port: Number,
            url: String
        }
    }
};
```

## Array schema
Validate object fields against validation schema.
```js
// example dataset {userList: ['john', 'peter']};
const stringArraySchema = {
    userList: {
        type: Array,
        arraySchema: String
    }
};
// example dataset {userList: [{name: 'john', age: 17}]};
const objectArraySchema = {
    userList: {
        type: Array,
        arraySchema: {
            name: String,
            age: Number
        }
    }
};
```
