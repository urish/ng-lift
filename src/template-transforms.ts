import * as parse5 from 'parse5';
import { AST } from 'parse5';
import { fromSource } from 'ts-emitter';
import * as ts from 'typescript';

export interface ITemplateUpgradeOptions {
    controllerVar: string;
}

export type AttributeMappingFn = (attr: AST.Default.Attribute) => AST.Default.Attribute[];

export interface IAttributeMapping {
    [key: string]: string | AttributeMappingFn;
}

const defaultOptions: ITemplateUpgradeOptions = {
    controllerVar: '$ctrl',
};

function isElement(node: AST.Default.Node): node is AST.Default.Element {
    return (typeof node as any).childNodes !== 'undefined';
}

function negateExpression(expression: string) {
    const ast = fromSource(expression);
    const node = ast.statements[0];
    if (ts.isExpressionStatement(node) && ast.statements.length === 1) {
        const negated = ts.createPrefix(ts.SyntaxKind.ExclamationToken, node.expression);
        return ts.createPrinter().printNode(ts.EmitHint.Expression, negated, ast);
    } else {
        return `!(${expression})`;
    }
}

export const attributeMapping: IAttributeMapping = {
    'ng-checked': '[checked]',
    'ng-disabled': '[disabled]',
    'ng-hide': '[hidden]',
    'ng-if': '*ngIf',
    'ng-model': '[(ngModel)]',
    'ng-readonly': '[readonly]',
    'ng-repeat': '*ngFor',
    'ng-show': (attr: AST.Default.Attribute) => [{
        ...attr, name: '[hidden]', value: negateExpression(attr.value),
    }],
    'ng-href': 'href',
    'ng-selected': '[selected]',
    'ng-src': 'src',
    'ng-srcset': 'srcset',

    // Events
    'ng-blur': '(blur)',
    'ng-change': '(change)',
    'ng-click': '(click)',
    'ng-copy': '(copy)',
    'ng-cut': '(cut)',
    'ng-dblclick': '(dblclick)',
    'ng-focus': '(focus)',
    'ng-keydown': '(keydown)',
    'ng-keypress': '(keypress)',
    'ng-keyup': '(keyup)',
    'ng-mousedown': '(mousedown)',
    'ng-mouseenter': '(mouseenter)',
    'ng-mouseleave': '(mouseleave)',
    'ng-mousemove': '(mousemove)',
    'ng-mouseover': '(mouseover)',
    'ng-mouseup': '(mouseup)',
    'ng-paste': '(paste)',
    'ng-submit': '(submit)',
};

export function upgradeAttributeNames(node: AST.Default.Node): AST.Default.Node {
    if (!isElement(node)) {
        return node;
    }

    const mapAttribute = (attr: AST.Default.Attribute) => {
        const mapping = attributeMapping[attr.name];
        if (!mapping) {
            return [attr];
        }
        if (typeof mapping === 'string') {
            return [{ ...attr, name: mapping }];
        }
        return mapping(attr);
    };

    return {
        ...node,
        childNodes: node.childNodes.map(upgradeAttributeNames),
        attrs: node.attrs.map(mapAttribute).reduce((acc, arr) => acc.concat(arr), []),
    } as AST.Default.Element;
}

export function upgradeTemplate(source: string, options: Partial<ITemplateUpgradeOptions> = {}) {
    options = { ...defaultOptions, ...options };
    const parsed = parse5.parse('<body>' + source + '</body>') as AST.Default.Document;
    const body = (parsed.childNodes[0] as AST.Default.Element).childNodes[1];
    if (!isElement(body) || (body.tagName !== 'body')) {
        throw new Error('Template parsing failed: body tag missing');
    }
    return parse5.serialize(upgradeAttributeNames(body));
}
