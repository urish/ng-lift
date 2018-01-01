
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
