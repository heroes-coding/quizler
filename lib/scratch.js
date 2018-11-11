'use strict';

const { readFile } = require('./lib');
readFile('foo').then(data => console.log({ data }));