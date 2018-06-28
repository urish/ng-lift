# ng-lift

[![Build Status](https://travis-ci.org/urish/ng-lift.png?branch=master)](https://travis-ci.org/urish/ng-lift)
[![Coverage Status](https://coveralls.io/repos/github/urish/ng-lift/badge.svg?branch=master)](https://coveralls.io/github/urish/ng-lift?branch=master)

Automated tooling for upgrading Angular.js apps to Angular

## Install

    yarn global add ng-lift

or

    npm install --global ng-lift

## CLI

The ng-lift CLI allows automatic template upgrade. For instance:

    ng-lift template my-template.html

Will transform the given Angular.js template to Angular syntax, and print the result to stdout.

You can also specify an output file name:

    ng-lift template -o upgrade-template.html my-template.html

## How does it work?

The template upgrade tool basically goes over all HTML elements, and looks for Angular.js specific directives, such as `ng-click`. It then automatically transforms them to their Angular counterpart, `(click)` in this example. In adddition, any references to the controller variable `$ctrl` are stripped (this can be customized with the `--controller` commandline option), and `ng-repeat` attributes are rewritten to the new `let ... of ...` format.

## Example

The following input:

```html
<div ng-repeat="user in $ctrl.users">
  <img ng-click="$ctrl.changeProfile(user)" ng-src="{{user.profileImage}}" alt="Profile Image">
  <a ng-href="{{user.profileUrl}}">{{user.name}}</a>
  <input ng-if="$ctrl.editMode" ng-model="user.bio" ng-disabled="$ctrl.readonly">
</div>
```

Will transform to:

```html
<div *ngFor="let user of users">
  <img (click)="changeProfile(user)" src="{{user.profileImage}}" alt="Profile Image">
  <a href="{{user.profileUrl}}">{{user.name}}</a>
  <input *ngIf="editMode" [(ngModel)]="user.bio" [disabled]="readonly">
</div>
```

## API

The package also exposes an API that you can use from your code:

```javascript
const { upgradeTemplate } = require('ng-lift');

console.log(upgradeTemplate('<div ng-if="$ctrl.foo">It works!</div>'));

// output: <div *ngIf="foo">It works!</div>
```

There as also a template sniffer API, which guesses whether a given template
is an Angular or AngularJS template. For instance:

```javascript
const { guessAngularVersion } = require('ng-lift');

console.log(guessAngularVersion('<div ng-click="$ctrl.onClick()">Click me</div>'));
// output: angularjs

console.log(guessAngularVersion('<div (click)="onClick()">Click me</div>'));
// output: angular

console.log(guessAngularVersion('<div onclick="noAngular()">Click me</div>'));
// output: unknown
```

## License

Copyright (C) 2017, 2018, Uri Shaked. Licensed under the MIT license.
