# ng-lift

[![Build Status](https://travis-ci.org/urish/ng-lift.png?branch=master)](https://travis-ci.org/urish/ng-lift)
[![Coverage Status](https://coveralls.io/repos/github/urish/ng-lift/badge.svg?branch=master)](https://coveralls.io/github/urish/ng-lift?branch=master)

Automated tools for upgrading Angular.js to Angular apps

## CLI

The ng-lift CLI allows automatic template upgrade. For instance:

    ng-lift template my-template.html

Will transform the given Angular.js template to Angular syntax, and print the result to stdout.

You can also specify an output file name:

    ng-lift template -o upgrade-template.html my-template.html

## How does it work?

The template upgrade tool basically goes over all HTML elements, and looks for Angular.js specific directives, such as `ng-click`. It then automatically transforms them to their Angular counterpart, `(click)` in this example. In adddition, any references to the controller variable `$ctrl` are stripped (this can be customized with the `--controller` commandline option), and `ng-repeat` attributes are rewritten to the new `let ... of ...` format.

## License

Copyright (C) 2017, 2018, Uri Shaked. Licensed under the MIT license.
