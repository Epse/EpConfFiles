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
    operatorChar: '(?:[\\p{S}\\p{P}](?<![(),;\\[\\]`{}_"\']))',

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2luY2x1ZGUvbWFjcm9zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUIsRUFBQyxlQUFELEVBQU8seUJBQVAsRUFBa0I7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxtQkFBQSxFQUFxQix1QkFBckI7SUFDQSxrQkFBQSxFQUFvQix3QkFEcEI7SUFFQSxjQUFBLEVBQWdCLDhCQUZoQjtJQUdBLGVBQUEsRUFBaUIsNEJBSGpCO0lBSUEsWUFBQSxFQUFjLGlDQUpkO0lBS0EsWUFBQSxFQUFjLHFDQUxkO0lBTUEsU0FBQSxFQUFXLHFDQU5YO0lBT0EsWUFBQSxFQUFjLDRDQVBkOztBQVFBOzs7OztJQUtBLFFBQUEsRUFBVSxpQkFiVjtJQWNBLFdBQUEsRUFBYSw2QkFkYjtJQXNCQSxTQUFBLEVBQVcsYUF0Qlg7SUF1QkEsVUFBQSxFQUFZLGtKQXZCWjtJQTRCQSxTQUFBLEVBQVcsZUE1Qlg7SUE2QkEsT0FBQSxFQUFTLHFCQTdCVDtJQThCQSxXQUFBLEVBQWEsd0JBOUJiO0lBK0JBLFNBQUEsRUFBVyxpRkEvQlg7SUFnQ0EsdUJBQUEsRUFDRSxNQUFBLENBQU8sSUFBQSxDQUFLLDhCQUFMLEVBQXFDLFNBQXJDLENBQVAsRUFDRSw0QkFERixDQWpDRjtJQW1DQSxtQkFBQSxFQUFxQiwrQ0FuQ3JCO0lBb0NBLG1CQUFBLEVBQ0UsTUFBQSxDQUFPLElBQUEsQ0FBSywyQkFBTCxFQUFrQyxTQUFsQyxDQUFQLEVBQ0UsNEJBREYsQ0FyQ0Y7SUF1Q0EsUUFBQSxFQUFVLDBGQXZDVjtJQStDQSxJQUFBLEVBQU0sTUFBQSxDQUFPLHNCQUFQLEVBQStCLFNBQUEsQ0FBVSxZQUFWLEVBQXdCLEtBQXhCLENBQS9CLENBL0NOO0lBZ0RBLFdBQUEsRUFBYSxxREFoRGI7SUFpREEsUUFBQSxFQUFVLDZDQWpEVjtJQWtEQSxVQUFBLEVBQVksT0FsRFo7SUFtREEsZ0JBQUEsRUFBa0IsaUNBbkRsQjtJQW9EQSxjQUFBLEVBQWdCLG9DQXBEaEI7SUFxREEsY0FBQSxFQUFnQixHQXJEaEI7SUFzREEsRUFBQSxFQUFJLHdEQXRESjtJQXVEQSxFQUFBLEVBQUksK0NBdkRKO0lBd0RBLENBQUEsRUFBRyxlQXhESDs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIntsaXN0LCBsaXN0TWF5YmUsIGNvbmNhdH0gPSByZXF1aXJlICcuL3V0aWwnXG5cbm1vZHVsZS5leHBvcnRzPVxuICBpZGVudFN0YXJ0Q2hhckNsYXNzOiAvW1xccHtMbH1fXFxwe0x1fVxccHtMdH1dL1xuICBpZGVudENvbnRDaGFyQ2xhc3M6IC9bXFxwe0xsfV9cXHB7THV9XFxwe0x0fSddL1xuICBpZGVudENoYXJDbGFzczogL1tcXHB7TGx9X1xccHtMdX1cXHB7THR9XFxwe05kfSddL1xuICBmdW5jdGlvbk5hbWVPbmU6IC9bXFxwe0xsfV9de2lkZW50Q2hhckNsYXNzfSovXG4gIGNsYXNzTmFtZU9uZTogL1tcXHB7THV9XFxwe0x0fV17aWRlbnRDaGFyQ2xhc3N9Ki9cbiAgZnVuY3Rpb25OYW1lOiAvKD86e2NsYXNzTmFtZX1cXC4pP3tmdW5jdGlvbk5hbWVPbmV9L1xuICBjbGFzc05hbWU6IC97Y2xhc3NOYW1lT25lfSg/OlxcLntjbGFzc05hbWVPbmV9KSovXG4gIG9wZXJhdG9yQ2hhcjogJyg/OltcXFxccHtTfVxcXFxwe1B9XSg/PCFbKCksO1xcXFxbXFxcXF1ge31fXCJcXCddKSknXG4gICMjI1xuICBJbiBjYXNlIHRoaXMgcmVnZXggc2VlbXMgb3Zlcmx5IGdlbmVyYWwsIG5vdGUgdGhhdCBIYXNrZWxsXG4gIHBlcm1pdHMgdGhlIGRlZmluaXRpb24gb2YgbmV3IG9wZXJhdG9ycyB3aGljaCBjYW4gYmUgbmVhcmx5IGFueSBzdHJpbmdcbiAgb2YgcHVuY3R1YXRpb24gY2hhcmFjdGVycywgc3VjaCBhcyAkJV4mKi5cbiAgIyMjXG4gIG9wZXJhdG9yOiAve29wZXJhdG9yQ2hhcn0rL1xuICBvcGVyYXRvckZ1bjogLy8vXG4gICAgKD86XG4gICAgICBcXChcbiAgICAgICAgKD8hLS0rXFwpKSAjIEFuIG9wZXJhdG9yIGNhbm5vdCBiZSBjb21wb3NlZCBlbnRpcmVseSBvZiBgLWAgY2hhcmFjdGVyc1xuICAgICAgICB7b3BlcmF0b3J9XG4gICAgICBcXClcbiAgICApXG4gICAgLy8vXG4gIGJhc2ljQ2hhcjogL1tcXCAtXFxbXFxdLX5dL1xuICBlc2NhcGVDaGFyOiAvLy9cbiAgICBcXFxcKD86TlVMfFNPSHxTVFh8RVRYfEVPVHxFTlF8QUNLfEJFTHxCU3xIVHxMRnxWVHxGRnxDUnxTT3xTSXxETEVcbiAgICAgIHxEQzF8REMyfERDM3xEQzR8TkFLfFNZTnxFVEJ8Q0FOfEVNfFNVQnxFU0N8RlN8R1N8UlNcbiAgICAgIHxVU3xTUHxERUx8W2FiZm5ydHZcXFxcXFxcIidcXCZdKSAgICAjIEVzY2FwZXNcbiAgICAvLy9cbiAgb2N0YWxDaGFyOiAvKD86XFxcXG9bMC03XSspL1xuICBoZXhDaGFyOiAvKD86XFxcXHhbMC05QS1GYS1mXSspL1xuICBjb250cm9sQ2hhcjogLyg/OlxcXFxcXF5bQS1aQFxcW1xcXVxcXFxeX10pL1xuICBjaGFyYWN0ZXI6ICcoPzp7YmFzaWNDaGFyfXx7ZXNjYXBlQ2hhcn18e29jdGFsQ2hhcn18e2hleENoYXJ9fHtjb250cm9sQ2hhcn18e29wZXJhdG9yQ2hhcn0pJ1xuICBmdW5jdGlvblR5cGVEZWNsYXJhdGlvbjpcbiAgICBjb25jYXQgbGlzdCgve2Z1bmN0aW9uTmFtZX18e29wZXJhdG9yRnVufS8sIC9cXHMqLFxccyovKSxcbiAgICAgIC9cXHMqKHtkb3VibGVDb2xvbk9wZXJhdG9yfSkvXG4gIGRvdWJsZUNvbG9uT3BlcmF0b3I6ICcoPzwhe29wZXJhdG9yQ2hhcn0pKD86Ojp84oi3KSg/IXtvcGVyYXRvckNoYXJ9KSdcbiAgY3RvclR5cGVEZWNsYXJhdGlvbjpcbiAgICBjb25jYXQgbGlzdCgve2NsYXNzTmFtZX18e29wZXJhdG9yRnVufS8sIC9cXHMqLFxccyovKSxcbiAgICAgIC9cXHMqKHtkb3VibGVDb2xvbk9wZXJhdG9yfSkvXG4gIGN0b3JBcmdzOiAvLy9cbiAgICAoPyFkZXJpdmluZylcbiAgICAoPzpcbiAgICB7Y2xhc3NOYW1lfSAgICAgI3Byb3BlciB0eXBlXG4gICAgfHtmdW5jdGlvbk5hbWV9ICN0eXBlIHZhcmlhYmxlXG4gICAgfCg/Oig/IWRlcml2aW5nKSg/OltcXHcoKSfihpLih5JcXFtcXF0sXXwtPnw9PikrXFxzKikrICNhbnl0aGluZyBnb2VzIVxuICAgIClcbiAgICAvLy9cbiAgY3RvcjogY29uY2F0IC97bGJ9KHtjbGFzc05hbWV9KVxccyovLCBsaXN0TWF5YmUoL3tjdG9yQXJnc30vLCAvXFxzKy8pXG4gIHR5cGVEZWNsT25lOiAvKD86KD8he2xifXdoZXJle3JifSkoPzp7Y2xhc3NOYW1lfXx7ZnVuY3Rpb25OYW1lfSkpL1xuICB0eXBlRGVjbDogJyg/Pig/Ont0eXBlRGVjbE9uZX0pKD86XFxcXHMre3R5cGVEZWNsT25lfSkqKSdcbiAgaW5kZW50Q2hhcjogL1sgXFx0XS9cbiAgaW5kZW50QmxvY2tTdGFydDogJ3ttYXliZUJpcmRUcmFja30oe2luZGVudENoYXJ9KiknXG4gIGluZGVudEJsb2NrRW5kOiAvXig/IVxcMXtpbmRlbnRDaGFyfXx7aW5kZW50Q2hhcn0qJCkvXG4gIG1heWJlQmlyZFRyYWNrOiAvXi9cbiAgbGI6ICcoPzooPz17aWRlbnRTdGFydENoYXJDbGFzc30pKD88IXtpZGVudENvbnRDaGFyQ2xhc3N9KSknXG4gIHJiOiAnKD86KD88PXtpZGVudENoYXJDbGFzc30pKD8he2lkZW50Q2hhckNsYXNzfSkpJ1xuICBiOiAnKD86e2xifXx7cmJ9KSdcbiJdfQ==
