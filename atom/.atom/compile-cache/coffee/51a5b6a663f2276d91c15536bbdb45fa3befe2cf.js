(function() {
  var concat, list, listMaybe, ref;

  ref = require('./util'), list = ref.list, listMaybe = ref.listMaybe, concat = ref.concat;

  module.exports = {
    identStartCharClass: /[\p{Ll}_\p{Lu}\p{Lt}]/,
    identContCharClass: /[\p{Ll}_\p{Lu}\p{Lt}']/,
    identCharClass: /[\p{Ll}_\p{Lu}\p{Lt}\p{Nd}']/,
    functionNameOne: /[\p{Ll}_]{identCharClass}*/,
    classNameOne: /[\p{Lu}\p{Lt}]{identCharClass}*/,
    functionName: /(?:{className}\.)?{functionNameOne}/,
    className: /{classNameOne}(?:\.{classNameOne})*/,
    operatorChar: /[\p{S}\p{P}&&[^(),;\[\]`{}_"']]/,

    /*
    In case this regex seems overly general, note that Haskell
    permits the definition of new operators which can be nearly any string
    of punctuation characters, such as $%^&*.
     */
    operator: /{operatorChar}+/,
    operatorFun: /(?:\((?!--+\)){operator}\))/,
    basicChar: /[\ -\[\]-~]/,
    escapeChar: /\\(?:NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|[abfnrtv\\\"'\&])/,
    octalChar: /(?:\\o[0-7]+)/,
    hexChar: /(?:\\x[0-9A-Fa-f]+)/,
    controlChar: /(?:\\\^[A-Z@\[\]\\^_])/,
    character: '(?:{basicChar}|{escapeChar}|{octalChar}|{hexChar}|{controlChar}|{operatorChar})',
    functionTypeDeclaration: concat(list(/{functionName}|{operatorFun}/, /\s*,\s*/), /\s*({doubleColonOperator})/),
    doubleColonOperator: '(?<!{operatorChar})(?:::|∷)(?!{operatorChar})',
    ctorTypeDeclaration: concat(list(/{className}|{operatorFun}/, /\s*,\s*/), /\s*({doubleColonOperator})/),
    ctorArgs: /(?!deriving)(?:{className}|{functionName}|(?:(?!deriving)(?:[\w()'→⇒\[\],]|->|=>)+\s*)+)/,
    ctor: concat(/{lb}({className})\s*/, listMaybe(/{ctorArgs}/, /\s+/)),
    typeDeclOne: /(?:(?!{lb}where{rb})(?:{className}|{functionName}))/,
    typeDecl: '(?>(?:{typeDeclOne})(?:\\s+{typeDeclOne})*)',
    indentChar: /[ \t]/,
    indentBlockStart: '{maybeBirdTrack}({indentChar}*)',
    indentBlockEnd: /^(?!\1{indentChar}|{indentChar}*$)/,
    maybeBirdTrack: /^/,
    lb: '(?:(?={identStartCharClass})(?<!{identContCharClass}))',
    rb: '(?:(?<={identCharClass})(?!{identCharClass}))',
    b: '(?:{lb}|{rb})'
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2luY2x1ZGUvbWFjcm9zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUIsRUFBQyxlQUFELEVBQU8seUJBQVAsRUFBa0I7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxtQkFBQSxFQUFxQix1QkFBckI7SUFDQSxrQkFBQSxFQUFvQix3QkFEcEI7SUFFQSxjQUFBLEVBQWdCLDhCQUZoQjtJQUdBLGVBQUEsRUFBaUIsNEJBSGpCO0lBSUEsWUFBQSxFQUFjLGlDQUpkO0lBS0EsWUFBQSxFQUFjLHFDQUxkO0lBTUEsU0FBQSxFQUFXLHFDQU5YO0lBT0EsWUFBQSxFQUFjLGlDQVBkOztBQVFBOzs7OztJQUtBLFFBQUEsRUFBVSxpQkFiVjtJQWNBLFdBQUEsRUFBYSw2QkFkYjtJQXNCQSxTQUFBLEVBQVcsYUF0Qlg7SUF1QkEsVUFBQSxFQUFZLGtKQXZCWjtJQTRCQSxTQUFBLEVBQVcsZUE1Qlg7SUE2QkEsT0FBQSxFQUFTLHFCQTdCVDtJQThCQSxXQUFBLEVBQWEsd0JBOUJiO0lBK0JBLFNBQUEsRUFBVyxpRkEvQlg7SUFnQ0EsdUJBQUEsRUFDRSxNQUFBLENBQU8sSUFBQSxDQUFLLDhCQUFMLEVBQXFDLFNBQXJDLENBQVAsRUFDRSw0QkFERixDQWpDRjtJQW1DQSxtQkFBQSxFQUFxQiwrQ0FuQ3JCO0lBb0NBLG1CQUFBLEVBQ0UsTUFBQSxDQUFPLElBQUEsQ0FBSywyQkFBTCxFQUFrQyxTQUFsQyxDQUFQLEVBQ0UsNEJBREYsQ0FyQ0Y7SUF1Q0EsUUFBQSxFQUFVLDBGQXZDVjtJQStDQSxJQUFBLEVBQU0sTUFBQSxDQUFPLHNCQUFQLEVBQStCLFNBQUEsQ0FBVSxZQUFWLEVBQXdCLEtBQXhCLENBQS9CLENBL0NOO0lBZ0RBLFdBQUEsRUFBYSxxREFoRGI7SUFpREEsUUFBQSxFQUFVLDZDQWpEVjtJQWtEQSxVQUFBLEVBQVksT0FsRFo7SUFtREEsZ0JBQUEsRUFBa0IsaUNBbkRsQjtJQW9EQSxjQUFBLEVBQWdCLG9DQXBEaEI7SUFxREEsY0FBQSxFQUFnQixHQXJEaEI7SUFzREEsRUFBQSxFQUFJLHdEQXRESjtJQXVEQSxFQUFBLEVBQUksK0NBdkRKO0lBd0RBLENBQUEsRUFBRyxlQXhESDs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIntsaXN0LCBsaXN0TWF5YmUsIGNvbmNhdH0gPSByZXF1aXJlICcuL3V0aWwnXG5cbm1vZHVsZS5leHBvcnRzPVxuICBpZGVudFN0YXJ0Q2hhckNsYXNzOiAvW1xccHtMbH1fXFxwe0x1fVxccHtMdH1dL1xuICBpZGVudENvbnRDaGFyQ2xhc3M6IC9bXFxwe0xsfV9cXHB7THV9XFxwe0x0fSddL1xuICBpZGVudENoYXJDbGFzczogL1tcXHB7TGx9X1xccHtMdX1cXHB7THR9XFxwe05kfSddL1xuICBmdW5jdGlvbk5hbWVPbmU6IC9bXFxwe0xsfV9de2lkZW50Q2hhckNsYXNzfSovXG4gIGNsYXNzTmFtZU9uZTogL1tcXHB7THV9XFxwe0x0fV17aWRlbnRDaGFyQ2xhc3N9Ki9cbiAgZnVuY3Rpb25OYW1lOiAvKD86e2NsYXNzTmFtZX1cXC4pP3tmdW5jdGlvbk5hbWVPbmV9L1xuICBjbGFzc05hbWU6IC97Y2xhc3NOYW1lT25lfSg/OlxcLntjbGFzc05hbWVPbmV9KSovXG4gIG9wZXJhdG9yQ2hhcjogL1tcXHB7U31cXHB7UH0mJlteKCksO1xcW1xcXWB7fV9cIiddXS9cbiAgIyMjXG4gIEluIGNhc2UgdGhpcyByZWdleCBzZWVtcyBvdmVybHkgZ2VuZXJhbCwgbm90ZSB0aGF0IEhhc2tlbGxcbiAgcGVybWl0cyB0aGUgZGVmaW5pdGlvbiBvZiBuZXcgb3BlcmF0b3JzIHdoaWNoIGNhbiBiZSBuZWFybHkgYW55IHN0cmluZ1xuICBvZiBwdW5jdHVhdGlvbiBjaGFyYWN0ZXJzLCBzdWNoIGFzICQlXiYqLlxuICAjIyNcbiAgb3BlcmF0b3I6IC97b3BlcmF0b3JDaGFyfSsvXG4gIG9wZXJhdG9yRnVuOiAvLy9cbiAgICAoPzpcbiAgICAgIFxcKFxuICAgICAgICAoPyEtLStcXCkpICMgQW4gb3BlcmF0b3IgY2Fubm90IGJlIGNvbXBvc2VkIGVudGlyZWx5IG9mIGAtYCBjaGFyYWN0ZXJzXG4gICAgICAgIHtvcGVyYXRvcn1cbiAgICAgIFxcKVxuICAgIClcbiAgICAvLy9cbiAgYmFzaWNDaGFyOiAvW1xcIC1cXFtcXF0tfl0vXG4gIGVzY2FwZUNoYXI6IC8vL1xuICAgIFxcXFwoPzpOVUx8U09IfFNUWHxFVFh8RU9UfEVOUXxBQ0t8QkVMfEJTfEhUfExGfFZUfEZGfENSfFNPfFNJfERMRVxuICAgICAgfERDMXxEQzJ8REMzfERDNHxOQUt8U1lOfEVUQnxDQU58RU18U1VCfEVTQ3xGU3xHU3xSU1xuICAgICAgfFVTfFNQfERFTHxbYWJmbnJ0dlxcXFxcXFwiJ1xcJl0pICAgICMgRXNjYXBlc1xuICAgIC8vL1xuICBvY3RhbENoYXI6IC8oPzpcXFxcb1swLTddKykvXG4gIGhleENoYXI6IC8oPzpcXFxceFswLTlBLUZhLWZdKykvXG4gIGNvbnRyb2xDaGFyOiAvKD86XFxcXFxcXltBLVpAXFxbXFxdXFxcXF5fXSkvXG4gIGNoYXJhY3RlcjogJyg/OntiYXNpY0NoYXJ9fHtlc2NhcGVDaGFyfXx7b2N0YWxDaGFyfXx7aGV4Q2hhcn18e2NvbnRyb2xDaGFyfXx7b3BlcmF0b3JDaGFyfSknXG4gIGZ1bmN0aW9uVHlwZURlY2xhcmF0aW9uOlxuICAgIGNvbmNhdCBsaXN0KC97ZnVuY3Rpb25OYW1lfXx7b3BlcmF0b3JGdW59LywgL1xccyosXFxzKi8pLFxuICAgICAgL1xccyooe2RvdWJsZUNvbG9uT3BlcmF0b3J9KS9cbiAgZG91YmxlQ29sb25PcGVyYXRvcjogJyg/PCF7b3BlcmF0b3JDaGFyfSkoPzo6OnziiLcpKD8he29wZXJhdG9yQ2hhcn0pJ1xuICBjdG9yVHlwZURlY2xhcmF0aW9uOlxuICAgIGNvbmNhdCBsaXN0KC97Y2xhc3NOYW1lfXx7b3BlcmF0b3JGdW59LywgL1xccyosXFxzKi8pLFxuICAgICAgL1xccyooe2RvdWJsZUNvbG9uT3BlcmF0b3J9KS9cbiAgY3RvckFyZ3M6IC8vL1xuICAgICg/IWRlcml2aW5nKVxuICAgICg/OlxuICAgIHtjbGFzc05hbWV9ICAgICAjcHJvcGVyIHR5cGVcbiAgICB8e2Z1bmN0aW9uTmFtZX0gI3R5cGUgdmFyaWFibGVcbiAgICB8KD86KD8hZGVyaXZpbmcpKD86W1xcdygpJ+KGkuKHklxcW1xcXSxdfC0+fD0+KStcXHMqKSsgI2FueXRoaW5nIGdvZXMhXG4gICAgKVxuICAgIC8vL1xuICBjdG9yOiBjb25jYXQgL3tsYn0oe2NsYXNzTmFtZX0pXFxzKi8sIGxpc3RNYXliZSgve2N0b3JBcmdzfS8sIC9cXHMrLylcbiAgdHlwZURlY2xPbmU6IC8oPzooPyF7bGJ9d2hlcmV7cmJ9KSg/OntjbGFzc05hbWV9fHtmdW5jdGlvbk5hbWV9KSkvXG4gIHR5cGVEZWNsOiAnKD8+KD86e3R5cGVEZWNsT25lfSkoPzpcXFxccyt7dHlwZURlY2xPbmV9KSopJ1xuICBpbmRlbnRDaGFyOiAvWyBcXHRdL1xuICBpbmRlbnRCbG9ja1N0YXJ0OiAne21heWJlQmlyZFRyYWNrfSh7aW5kZW50Q2hhcn0qKSdcbiAgaW5kZW50QmxvY2tFbmQ6IC9eKD8hXFwxe2luZGVudENoYXJ9fHtpbmRlbnRDaGFyfSokKS9cbiAgbWF5YmVCaXJkVHJhY2s6IC9eL1xuICBsYjogJyg/Oig/PXtpZGVudFN0YXJ0Q2hhckNsYXNzfSkoPzwhe2lkZW50Q29udENoYXJDbGFzc30pKSdcbiAgcmI6ICcoPzooPzw9e2lkZW50Q2hhckNsYXNzfSkoPyF7aWRlbnRDaGFyQ2xhc3N9KSknXG4gIGI6ICcoPzp7bGJ9fHtyYn0pJ1xuIl19
