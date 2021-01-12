# Jellyfish assert

This library contains assert-related utilities for use in Jellyfish.

The Jellyfish system distinguishes between two types of errors:
- Internal errors, which are unexpected and should be fixed as soon as possible
- User errors, which are the responsibility of the user and are usually the result of bad user usage of the system

This module provides a handy set of functions to write concise assertions for
both types of errors, and remove the amount of error handling `if` conditionals
throughout the code

# Usage

Below is an example how to use this library:

```js
const assert = require('@balena/jellyfish-assert')

assert.INTERNAL(context, version, errors.InvalidVersion, 'Custom error details')
assert.USER(context, input, errors.WorkerNoElement, 'Custom error details')
```

# Documentation

Visit the website for complete documentation: https://product-os.github.io/jellyfish-assert
