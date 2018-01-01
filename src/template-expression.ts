
import { fromSource, toSource } from 'ts-emitter';
import * as ts from 'typescript';

export function negateExpression(expression: string) {
    const ast = fromSource(expression);
    const node = ast.statements[0];
    if (ts.isExpressionStatement(node) && ast.statements.length === 1) {
        const negated = ts.createPrefix(ts.SyntaxKind.ExclamationToken, node.expression);
        return ts.createPrinter().printNode(ts.EmitHint.Expression, negated, ast);
    } else {
        return `!(${expression})`;
    }
}

export function removeCtrlFromExpression(expression: string, controllerVars: string[]) {
    const ast = fromSource(expression);
    const transformer = (context: ts.TransformationContext) => (root: ts.SourceFile) => {
        function visitor(node: ts.Node): ts.Node {
            if (ts.isPropertyAccessExpression(node)
                && ts.isIdentifier(node.expression)
                && controllerVars.indexOf(node.expression.text) >= 0) {
                node = node.name;
            }
            if (ts.isElementAccessExpression(node)
                && ts.isIdentifier(node.expression)
                && controllerVars.indexOf(node.expression.text) >= 0
                && node.argumentExpression
                && ts.isStringLiteral(node.argumentExpression)) {
                node = ts.createIdentifier(node.argumentExpression.text);
            }
            return ts.visitEachChild(node, visitor, context);
        }
        return ts.visitNode(root, visitor);
    };
    return toSource(ts.transform<ts.SourceFile>(ast, [transformer]).transformed[0]);
}

export function transformNgRepeatExpression(expression: string) {
    // Source:
    // github.com/angular/angular.js/blob/e5c6174839e96113c93913dd8b3c4cca760dfc41/src/ng/directive/ngRepeat.js#L378
    const regexp = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
    const match = expression.match(regexp);
    if (match && !match[3] && !match[4]) {
        return `let ${match[1]} of ${match[2]}`;
    } else {
        return expression;
    }
}
