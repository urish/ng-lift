import { upgradeTemplate } from './template-transforms';

describe('template-transforms', () => {
    describe('#upgradeTemplate', () => {
        it('should replace `ng-if` with `*ngIf`', () => {
            expect(upgradeTemplate('<div ng-if="test"></div>'))
                .toEqual('<div *ngIf="test"></div>');
        });

        it('should replace `ng-click` with `(click)`', () => {
            expect(upgradeTemplate('<div ng-click="foo()"></div>'))
                .toEqual('<div (click)="foo()"></div>');
        });

        it('should replace `ng-hide` with `[hidden]`', () => {
            expect(upgradeTemplate('<div ng-hide="something"></div>'))
                .toEqual('<div [hidden]="something"></div>');
        });

        it('should replace `ng-attr` with [attr], and remove interpolation markers', () => {
            expect(upgradeTemplate('<svg><circle ng-attr-cx="{{cx}}"></circle></svg>'))
                .toEqual('<svg><circle [attr.cx]="cx"></circle></svg>');
        });

        it('should not transform `ng-attr` bindings with multiple interpolation expressions', () => {
            expect(upgradeTemplate('<div ng-attr-placeholder="{{foo}} {{bar}}"></div>'))
                .toEqual('<div ng-attr-placeholder="{{foo}} {{bar}}"></div>');
        });

        it('should replace `ng-show="expression"` with `[hidden]="!expression"`', () => {
            expect(upgradeTemplate('<div ng-show="expression"></div>'))
                .toEqual('<div [hidden]="!expression"></div>');
        });

        it('should replace `ng-show="foo || bar"` with `[hidden]="!(foo || bar)"`', () => {
            expect(upgradeTemplate('<div ng-show="foo || bar"></div>'))
                .toEqual('<div [hidden]="!(foo || bar)"></div>');
        });

        it('should replace `ng-model` with `[(ngModel)]`', () => {
            expect(upgradeTemplate('<div ng-model="myVar"></div>'))
                .toEqual('<div [(ngModel)]="myVar"></div>');
        });

        it('should replace `ng-href` with `href`', () => {
            expect(upgradeTemplate('<div ng-href="https://mysite.com/{{page}}"></div>'))
                .toEqual('<div href="https://mysite.com/{{page}}"></div>');
        });

        it('should replace `ng-class` with `[ngClass]`', () => {
            expect(upgradeTemplate('<div ng-class="myVar"></div>'))
                .toEqual('<div [ngClass]="myVar"></div>');
        });

        it('should replace `ng-style` with `[ngStyle]`', () => {
            expect(upgradeTemplate('<div ng-style="myVar"></div>'))
                .toEqual('<div [ngStyle]="myVar"></div>');
        });

        it('should not change `title` attributes', () => {
            expect(upgradeTemplate('<div title="Angular is Great!"></div>'))
                .toEqual('<div title="Angular is Great!"></div>');
        });

        it('should remove references to $ctrl from attributes', () => {
            expect(upgradeTemplate('<div some-value="$ctrl.value"></div>'))
                .toEqual('<div some-value="value"></div>');
        });

        it('should remove references to $ctrl in array access expressions', () => {
            expect(upgradeTemplate(`<div some-value="$ctrl.bar[$ctrl['foo']]"></div>`))
                .toEqual('<div some-value="bar[foo]"></div>');
        });

        it('should convert `x in y` to `let x of y` in ng-repeat syntax', () => {
            expect(upgradeTemplate('<div ng-repeat="x in y"></div>'))
                .toEqual('<div *ngFor="let x of y"></div>');
        });

        it('should not change ng-repeat expression are invalid', () => {
            expect(upgradeTemplate('<div ng-repeat="bla bla"></div>'))
                .toEqual('<div *ngFor="bla bla"></div>');
        });

        it('should return a div with text unmodified', () => {
            expect(upgradeTemplate('<div>hello</div>'))
                .toEqual('<div>hello</div>');
        });
    });
});
