import parseResponseHeaders from 'ember-ajax/utils/parse-response-headers';
import { module, test } from 'qunit';

const CRLF = '\u000d\u000a';

module('unit/adapters/parse-response-headers');

test('returns {} when headersString is undefined', function(assert) {
  let headers = parseResponseHeaders(undefined);

  assert.deepEqual(headers, {}, '{} is returned');
});

test('header parsing', function(assert) {
  let headersString = [
    'Content-Encoding: gzip',
    'content-type: application/json; charset=utf-8',
    'date: Fri, 12 Feb 2016 19:21:00 GMT'
  ].join(CRLF);

  let headers = parseResponseHeaders(headersString);

  assert.equal(headers['Content-Encoding'], 'gzip', 'parses basic header pair');
  assert.equal(headers['content-type'], 'application/json; charset=utf-8', 'parses header with complex value');
  assert.equal(headers.date, 'Fri, 12 Feb 2016 19:21:00 GMT', 'parses header with date value');
});

test('field-name parsing', function(assert) {
  let headersString = [
    ' name-with-leading-whitespace: some value',
    'name-with-whitespace-before-colon : another value'
  ].join(CRLF);

  let headers = parseResponseHeaders(headersString);

  assert.equal(headers['name-with-leading-whitespace'], 'some value', 'strips leading whitespace from field-name');
  assert.equal(headers['name-with-whitespace-before-colon'], 'another value', 'strips whitespace before colon from field-name');
});

test('field-value parsing', function(assert) {
  let headersString = [
    'value-with-leading-space: value with leading whitespace',
    'value-without-leading-space:value without leading whitespace',
    'value-with-colon: value with: a colon',
    'value-with-trailing-whitespace: banana '
  ].join(CRLF);

  let headers = parseResponseHeaders(headersString);

  assert.equal(headers['value-with-leading-space'], 'value with leading whitespace', 'strips leading whitespace in field-value');
  assert.equal(headers['value-without-leading-space'], 'value without leading whitespace', 'works without leaading whitespace in field-value');
  assert.equal(headers['value-with-colon'], 'value with: a colon', 'has correct value when value contains a colon');
  assert.equal(headers['value-with-trailing-whitespace'], 'banana', 'strips trailing whitespace from field-value');
});

test('ignores headers that do not contain a colon', function(assert) {
  let headersString = [
    'Content-Encoding: gzip',
    'I am ignored because I do not contain a colon'
  ].join(CRLF);

  let headers = parseResponseHeaders(headersString);

  assert.deepEqual(headers['Content-Encoding'], 'gzip', 'parses basic header pair');
  assert.equal(Object.keys(headers).length, 1, 'only has the one valid header');
});
