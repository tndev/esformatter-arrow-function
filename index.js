'use strict';
const rocambole = require('rocambole');
const tk = require('rocambole-token');

exports.transformBefore = ast => {

  rocambole.moonwalk(ast, node => {
    
    //convert function to arrow function
    if (node.type === 'FunctionExpression') {
      //check if function is anonymous and not a method of a class
      if (!node.id && !(node.parent && node.parent.type==='MethodDefinition') ) {

        tk.before(node.body.startToken, {
          type: 'Punctuator',
          value: '=>'
        });

        var token = node.startToken;

        while (token.type !== 'Keyword' && token.value !== 'function') {
          token = token.next;
        }

        if (token === node.startToken) {
          node.startToken = token.next;
        }

        tk.remove(token);

        node.type = 'ArrowFunctionExpression';
      }
    }

    //remove braces form arrow function
    if (node.type === 'ArrowFunctionExpression') {
      
      //if we only have one parameter then remove the braces
      if (node.params.length == 1) {

        var currToken = node.startToken;
        while (currToken !== node.params[0].startToken) {

          if (currToken.type === 'Punctuator' && currToken.value === '(') {
            break;
          }
          currToken = currToken.next;

        }

        if (currToken.type === 'Punctuator' && currToken.value === '(') {
          var startBraces = currToken;

          currToken = node.params[0].endToken;

          while (currToken.type !== 'Punctuator' && currToken.value !== ')') {
            currToken = currToken.next;
          }

          var endBrace = currToken;
          if (node.startToken === startBraces) {
            node.startToken = startBraces.next;
          }

          tk.remove(startBraces);
          tk.remove(endBrace);

        } 
      }
    }
  });
};
