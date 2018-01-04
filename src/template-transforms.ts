import * as parse5 from 'parse5';
import { AST } from 'parse5';
import { negateExpression, removeCtrlFromExpression, transformNgRepeatExpression } from './template-expression';

export interface ITemplateUpgradeOptions {
    controllerVars: string[];
}

export type AttributeMappingFn = (attr: AST.Default.Attribute) => AST.Default.Attribute[];

export interface IAttributeMapping {
    [key: string]: string | AttributeMappingFn;
}

const defaultOptions: ITemplateUpgradeOptions = {
    controllerVars: ['$ctrl'],
};

function isElement(node: AST.Default.Node): node is AST.Default.Element {
    return typeof (node as any).childNodes !== 'undefined';
}

function isTextNode(node: AST.Default.Node): node is AST.Default.TextNode {
    return node.nodeName === '#text';
}

export const attributeMapping: IAttributeMapping = {
    'ng-checked': '[checked]',
    'ng-class': '[ngClass]',
    'ng-disabled': '[disabled]',
    'ng-hide': '[hidden]',
    'ng-href': 'href',
    'ng-if': '*ngIf',
    'ng-model': '[(ngModel)]',
    'ng-readonly': '[readonly]',
    'ng-repeat': ((attr: AST.Default.Attribute) => [{
        ...attr,
        name: '*ngFor',
        value: transformNgRepeatExpression(attr.value),
    }]),
    'ng-selected': '[selected]',
    'ng-show': (attr: AST.Default.Attribute) => [{
        ...attr, name: '[hidden]', value: negateExpression(attr.value),
    }],
    'ng-src': 'src',
    'ng-srcset': 'srcset',
    'ng-style': '[ngStyle]',

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

export type NodeMapper = (node: AST.Default.Element) => AST.Default.Element;

export function mapElementNodes(root: AST.Default.Node, mapper: NodeMapper): AST.Default.Node {
    if (!isElement(root)) {
        return root;
    }

    return mapper({
        ...root,
        childNodes: root.childNodes.map((node) => mapElementNodes(node, mapper)),
    } as AST.Default.Element);
}

function removeCtrlFromInterpolationExpression(value: string, ctrlVars: string[]) {
    return value.replace(/\{\{([^}]+)\}\}/g,
        (_, expression) => `{{${removeCtrlFromExpression(expression, ctrlVars)}}}`);
}

function removeCtrlFromAttributeExpression(value: string, ctrlVars: string[]) {
    if (/\{\{.+\}\}/.test(value)) {
        return removeCtrlFromInterpolationExpression(value, ctrlVars);
    } else {
        return removeCtrlFromExpression(value, ctrlVars);
    }
}

function removeCtrlFromTextNode(node: AST.Default.TextNode, ctrlVars: string[]) {
    return {
        ...node,
        value: removeCtrlFromAttributeExpression(node.value, ctrlVars),
    };
}

export function removeCtrlReferences(root: AST.Default.Node, ctrlVars: string[]): AST.Default.Node {
    return mapElementNodes(root, (node) => ({
        ...node,
        childNodes: node.childNodes
            .map((child) => isTextNode(child) ? removeCtrlFromTextNode(child, ctrlVars) : child),
        attrs: node.attrs.map((attr) => ({ ...attr, value: removeCtrlFromAttributeExpression(attr.value, ctrlVars) })),
    }));
}

function transformNgAttrExpression(attr: AST.Default.Attribute) {
    const { name, value } = attr;
    const match = /^\s*\{\{(.+)\}\}\s*$/.exec(value);
    if (match && !match[1].includes('{{')) {
        return {
            ...attr,
            name: `[attr.${name.replace(/^ng-attr-/, '')}]`,
            value: match[1],
        };
    } else {
        return attr;
    }
}

export function upgradeAttributeNames(root: AST.Default.Node): AST.Default.Node {
    const mapAttribute = (attr: AST.Default.Attribute) => {
        const mapping = attributeMapping[attr.name];
        if (!mapping) {
            if (attr.name.startsWith('ng-attr-')) {
                return [transformNgAttrExpression(attr)];
            }
            return [attr];
        }
        if (typeof mapping === 'string') {
            return [{ ...attr, name: mapping }];
        }
        return mapping(attr);
    };

    return mapElementNodes(root, (node) => ({
        ...node,
        attrs: node.attrs.map(mapAttribute).reduce((acc, arr) => acc.concat(arr), []),
    }));
}

export function upgradeTemplate(source: string, options: Partial<ITemplateUpgradeOptions> = {}) {
    const opts = { ...defaultOptions, ...options };
    const parsed = parse5.parse('<body>' + source + '</body>') as AST.Default.Document;
    const body = (parsed.childNodes[0] as AST.Default.Element).childNodes[1];
    if (!isElement(body) || (body.tagName !== 'body')) {
        throw new Error('Template parsing failed: body tag missing');
    }
    return parse5.serialize(upgradeAttributeNames(removeCtrlReferences(body, opts.controllerVars)));
}
