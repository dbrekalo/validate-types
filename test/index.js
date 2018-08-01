var assert = require("chai").assert;
var validateTypes = require("../");

describe('Validate types', function() {

    it('type checks required types', function() {

        var schema = {title: {required: true}};

        assert.isTrue(
            validateTypes(schema).hasErrors
        );

        assert.deepEqual(
            validateTypes(schema).errors,
            [{key: 'title', message: 'Prop "title" is required'}]
        );

        assert.isTrue(
            validateTypes(schema, {title: undefined}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {title: null}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {title: 'foo'}).hasErrors
        );

    });

    it('type checks string props', function() {

        assert.isFalse(
            validateTypes({title: String}, {title: 'Foo'}).hasErrors
        );

        assert.isTrue(
            validateTypes({title: String}, {title: 42}).hasErrors
        );

        assert.deepEqual(
            validateTypes({title: String}, {title: 42}).errors,
            [{key: 'title', message: 'Prop "title" is of invalid type'}]
        );

        assert.isFalse(
            validateTypes({title: String}).hasErrors
        );

    });

    it('type checks boolean props', function() {

        var schema = {published: Boolean};

        assert.isTrue(
            validateTypes(schema, {published: 'true'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {published: true}).hasErrors
        );

    });

    it('type checks number props', function() {

        var schema = {age: Number};

        assert.isTrue(
            validateTypes(schema, {age: '18'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {age: 18}).hasErrors
        );

    });

    it('type checks function props', function() {

        var schema = {callback: Function};

        assert.isTrue(
            validateTypes(schema, {callback: 'test'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {callback: function() {}}).hasErrors
        );

    });

    it('type checks object props', function() {

        var schema = {data: Object};

        assert.isTrue(
            validateTypes(schema, {data: 'test'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {data: {}}).hasErrors
        );

    });

    it('type checks array props', function() {

        var schema = {data: Array};

        assert.isTrue(
            validateTypes(schema, {data: 'test'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {data: [1,2]}).hasErrors
        );

    });

    it('type checks complex props', function() {

        var schema = {date: Date};

        assert.isTrue(
            validateTypes(schema, {date: '12.02.1985'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {date: new Date()}).hasErrors
        );

    });

    it('type checks multiple alowed types', function() {

        var schema = {age: [String, Number]};

        assert.isTrue(
            validateTypes(schema, {age: false}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {age: 18}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {age: '18'}).hasErrors
        );

    });

    it('returns data with joined default and user values', function() {

        var schema = {
            title: {default: 'Test'},
            published: {default: true},
            tags: {default: function() { return []; }}
        };

        assert.deepEqual(
            validateTypes(schema).data,
            {title: 'Test', published: true, tags: []}
        );

        assert.deepEqual(
            validateTypes(schema, {title: 'My test'}).data,
            {title: 'My test', published: true, tags: []}
        );

        assert.deepEqual(
            validateTypes(schema, {published: undefined, tags: ['foo']}).data,
            {title: 'Test', published: true, tags: ['foo']}
        );

    });

    it('disallows direct object or array default props', function() {

        assert.deepEqual(
            validateTypes({
                tags: {default: []},
                params: {default: {}}
            }).errors,
            [
                {key: 'tags', message: 'Object or array prop not allowed for "tags". Use factory function.'},
                {key: 'params', message: 'Object or array prop not allowed for "params". Use factory function.'}
            ]
        );

        assert.deepEqual(
            validateTypes({
                tags: {default: function() { return [1, 2]; }},
                params: {default: function() { return {foo: 'bar'}; }}
            }).data,
            {tags: [1, 2], params: {foo: 'bar'}}
        );

    });

    it('type checks props with custom validator', function() {

        var schema = {
            title: {
                type: String,
                validator: function(value) { return value.length > 2; }
            }
        };

        assert.isTrue(
            validateTypes(schema, {title: 'F'}).hasErrors
        );

        assert.deepEqual(
            validateTypes(schema, {title: 'F'}).errors,
            [{key: 'title', message: 'Prop "title" failed to pass validator check'}]
        );

        assert.isFalse(
            validateTypes(schema, {title: 'Foo'}).hasErrors
        );

        assert.isTrue(
            validateTypes(schema, {title: 1234}).hasErrors
        );

    });

});