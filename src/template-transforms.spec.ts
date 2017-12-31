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

        it('should not change `title` attributes', () => {
            expect(upgradeTemplate('<div title="Angular is Great!"></div>'))
                .toEqual('<div title="Angular is Great!"></div>');
        });
    });
});
