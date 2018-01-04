import * as parse5 from 'parse5';
import { AST } from 'parse5';

import { mapElementNodes } from './template-transforms';

export const angularDirectives = [
    '*ngIf', '*ngFor', '[(ngModel)]', '[ngStyle]', '[ngClass]',
    '[checked]', '[class]', '[disabled]', '[href]', '[readonly]',
    '[selected]', '[src]', '[srcset]', '[style]',
    // Events:
    '(blur)', '(change)', '(click)', '(copy)', '(cut)', '(dblclick)', '(focus)', '(keydown)',
    '(keypress)', '(keyup)', '(mousedown)', '(mouseenter)', '(mouseleave)', '(mousemove)',
    '(mouseover)', '(mouseup)', '(paste)', '(submit)',
];

export const angularJsDirectives = [
    'ng-checked', 'ng-class',
    'ng-disabled', 'ng-hide', 'ng-href', 'ng-if', 'ng-model', 'ng-readonly', 'ng-repeat',
    'ng-selected', 'ng-show', 'ng-src', 'ng-srcset', 'ng-style',
    // Events:
    'ng-blur', 'ng-change', 'ng-click', 'ng-copy', 'ng-cut', 'ng-dblclick', 'ng-focus', 'ng-keydown',
    'ng-keypress', 'ng-keyup', 'ng-mousedown', 'ng-mouseenter', 'ng-mouseleave', 'ng-mousemove',
    'ng-mouseover', 'ng-mouseup', 'ng-paste', 'ng-submit',
];

export type ITemplateVersionResult = 'angularjs' | 'angular' | 'both' | 'unknown';

export function guessAngularVersion(templateSrc: string): ITemplateVersionResult {
    const allAttributes: string[] = [];
    const parsed = parse5.parse(templateSrc) as AST.Default.Document;

    mapElementNodes(parsed, (element) => {
        if (element.attrs) {
            element.attrs.map((attr) => attr.name)
                .filter((attr) => allAttributes.indexOf(attr) < 0)
                .forEach((attr) => allAttributes.push(attr));
        }
        return element;
    });

    const angular = angularDirectives.some((directive) => allAttributes.indexOf(directive.toLowerCase()) >= 0);
    const angularJs = angularJsDirectives.some((directive) => allAttributes.indexOf(directive.toLowerCase()) >= 0);
    if (angular && angularJs) {
        return 'both';
    }
    if (angular) {
        return 'angular';
    }
    if (angularJs) {
        return 'angularjs';
    }
    return 'unknown';
}
