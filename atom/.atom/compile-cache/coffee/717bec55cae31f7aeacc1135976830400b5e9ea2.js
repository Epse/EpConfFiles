(function() {
  var concat, list, listMaybe, _ref;

  _ref = require('./util'), list = _ref.list, listMaybe = _ref.listMaybe, concat = _ref.concat;

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
    controlChar: /(?:\^[A-Z@\[\]\\\^_])/,
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2luY2x1ZGUvbWFjcm9zLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2QkFBQTs7QUFBQSxFQUFBLE9BQTRCLE9BQUEsQ0FBUSxRQUFSLENBQTVCLEVBQUMsWUFBQSxJQUFELEVBQU8saUJBQUEsU0FBUCxFQUFrQixjQUFBLE1BQWxCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxtQkFBQSxFQUFxQix1QkFBckI7QUFBQSxJQUNBLGtCQUFBLEVBQW9CLHdCQURwQjtBQUFBLElBRUEsY0FBQSxFQUFnQiw4QkFGaEI7QUFBQSxJQUdBLGVBQUEsRUFBaUIsNEJBSGpCO0FBQUEsSUFJQSxZQUFBLEVBQWMsaUNBSmQ7QUFBQSxJQUtBLFlBQUEsRUFBYyxxQ0FMZDtBQUFBLElBTUEsU0FBQSxFQUFXLHFDQU5YO0FBQUEsSUFPQSxZQUFBLEVBQWMsaUNBUGQ7QUFRQTtBQUFBOzs7O09BUkE7QUFBQSxJQWFBLFFBQUEsRUFBVSxpQkFiVjtBQUFBLElBY0EsV0FBQSxFQUFhLDZCQWRiO0FBQUEsSUFzQkEsU0FBQSxFQUFXLGFBdEJYO0FBQUEsSUF1QkEsVUFBQSxFQUFZLGtKQXZCWjtBQUFBLElBNEJBLFNBQUEsRUFBVyxlQTVCWDtBQUFBLElBNkJBLE9BQUEsRUFBUyxxQkE3QlQ7QUFBQSxJQThCQSxXQUFBLEVBQWEsdUJBOUJiO0FBQUEsSUErQkEsU0FBQSxFQUFXLGlGQS9CWDtBQUFBLElBZ0NBLHVCQUFBLEVBQ0UsTUFBQSxDQUFPLElBQUEsQ0FBSyw4QkFBTCxFQUFxQyxTQUFyQyxDQUFQLEVBQ0UsNEJBREYsQ0FqQ0Y7QUFBQSxJQW1DQSxtQkFBQSxFQUFxQiwrQ0FuQ3JCO0FBQUEsSUFvQ0EsbUJBQUEsRUFDRSxNQUFBLENBQU8sSUFBQSxDQUFLLDJCQUFMLEVBQWtDLFNBQWxDLENBQVAsRUFDRSw0QkFERixDQXJDRjtBQUFBLElBdUNBLFFBQUEsRUFBVSwwRkF2Q1Y7QUFBQSxJQStDQSxJQUFBLEVBQU0sTUFBQSxDQUFPLHNCQUFQLEVBQStCLFNBQUEsQ0FBVSxZQUFWLEVBQXdCLEtBQXhCLENBQS9CLENBL0NOO0FBQUEsSUFnREEsV0FBQSxFQUFhLHFEQWhEYjtBQUFBLElBaURBLFFBQUEsRUFBVSw2Q0FqRFY7QUFBQSxJQWtEQSxVQUFBLEVBQVksT0FsRFo7QUFBQSxJQW1EQSxnQkFBQSxFQUFrQixpQ0FuRGxCO0FBQUEsSUFvREEsY0FBQSxFQUFnQixvQ0FwRGhCO0FBQUEsSUFxREEsY0FBQSxFQUFnQixHQXJEaEI7QUFBQSxJQXNEQSxFQUFBLEVBQUksd0RBdERKO0FBQUEsSUF1REEsRUFBQSxFQUFJLCtDQXZESjtBQUFBLElBd0RBLENBQUEsRUFBRyxlQXhESDtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/epse/EpConfFiles/atom/.atom/packages/language-haskell/src/include/macros.coffee
