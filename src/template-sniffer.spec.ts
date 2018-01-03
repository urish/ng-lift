import { guessAngularVersion } from './template-sniffer';

describe('template-sniffer', () => {
    describe('#guessAngularVersion', () => {
        it('should return `angularjs` for a template containing ng-if', () => {
            expect(guessAngularVersion('<div ng-if="high"></div>')).toEqual('angularjs');
        });

        it('should return `angular` for a template containing *ngIf', () => {
            expect(guessAngularVersion('<div *ngIf="high"></div>')).toEqual('angular');
        });

        it('should return `both` for a template containing both *ngIf and ng-model', () => {
            expect(guessAngularVersion('<div *ngIf="high" ng-model="value"></div>')).toEqual('both');
        });

        it('should return `both` for a template without any angular.js/angular specific directives', () => {
            expect(guessAngularVersion('<div title="Explore"></div>')).toEqual('unknown');
        });
    });
});
