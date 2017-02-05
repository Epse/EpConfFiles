(function() {
  var balanced, pragmas, prelude;

  prelude = require('./prelude');

  pragmas = require('./pragmas');

  balanced = require('./util').balanced;

  module.exports = {
    block_comment: {
      patterns: [
        {
          name: 'comment.block.haddock.haskell',
          begin: /\{-\s*[|^]/,
          end: /-\}/,
          applyEndPatternLast: 1,
          beginCaptures: {
            0: {
              name: 'punctuation.definition.comment.haddock.haskell'
            }
          },
          endCaptures: {
            0: {
              name: 'punctuation.definition.comment.haddock.haskell'
            }
          },
          patterns: [
            {
              include: '#block_comment'
            }
          ]
        }, {
          name: 'comment.block.haskell',
          begin: /\{-/,
          end: /-\}/,
          applyEndPatternLast: 1,
          beginCaptures: {
            0: {
              name: 'punctuation.definition.comment.block.start.haskell'
            }
          },
          endCaptures: {
            0: {
              name: 'punctuation.definition.comment.block.end.haskell'
            }
          },
          patterns: [
            {
              include: '#block_comment'
            }
          ]
        }
      ]
    },
    comments: {
      patterns: [
        {
          begin: /({maybeBirdTrack}[ \t]+)?(?=--+\s+[|^])/,
          end: /(?!\G)/,
          beginCaptures: {
            1: {
              name: 'punctuation.whitespace.comment.leading.haskell'
            }
          },
          patterns: [
            {
              name: 'comment.line.double-dash.haddock.haskell',
              begin: /(--+)\s+([|^])/,
              end: /\n/,
              beginCaptures: {
                1: {
                  name: 'punctuation.definition.comment.haskell'
                },
                2: {
                  name: 'punctuation.definition.comment.haddock.haskell'
                }
              }
            }
          ]
        }, {

          /*
          Operators may begin with -- as long as they are not
          entirely composed of - characters. This means comments can't be
          immediately followed by an allowable operator character.
           */
          begin: /({maybeBirdTrack}[ \t]+)?(?=--+(?!{operatorChar}))/,
          end: /(?!\G)/,
          beginCaptures: {
            1: {
              name: 'punctuation.whitespace.comment.leading.haskell'
            }
          },
          patterns: [
            {
              name: 'comment.line.double-dash.haskell',
              begin: /--/,
              end: /\n/,
              beginCaptures: {
                0: {
                  name: 'punctuation.definition.comment.haskell'
                }
              }
            }
          ]
        }, {
          include: '#block_comment'
        }
      ]
    },
    characters: {
      patterns: [
        {
          match: '{escapeChar}',
          name: 'constant.character.escape.haskell'
        }, {
          match: '{octalChar}',
          name: 'constant.character.escape.octal.haskell'
        }, {
          match: '{hexChar}',
          name: 'constant.character.escape.hexadecimal.haskell'
        }, {
          match: '{controlChar}',
          name: 'constant.character.escape.control.haskell'
        }
      ]
    },
    infix_op: {
      name: 'entity.name.function.infix.haskell',
      match: /{operatorFun}/
    },
    module_exports: {
      name: 'meta.declaration.exports.haskell',
      begin: /\(/,
      end: /\)/,
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#function_name'
        }, {
          include: '#type_name'
        }, {
          include: '#comma'
        }, {
          name: 'meta.other.constructor-list.haskell',
          begin: /{rb}\s*\(/,
          end: /\)/,
          patterns: [
            {
              include: '#type_ctor'
            }, {
              include: '#attribute_name'
            }, {
              include: '#comma'
            }, {
              match: /\.\./,
              name: 'keyword.operator.wildcard.haskell'
            }
          ]
        }, {
          include: '#infix_op'
        }
      ]
    },
    module_name: {
      name: 'support.other.module.haskell',
      match: /{lb}{className}{rb}/
    },
    module_name_prefix: {
      name: 'support.other.module.haskell',
      match: /{lb}{className}\./
    },
    pragma: {
      name: 'meta.preprocessor.haskell',
      begin: /\{-#/,
      end: /#-\}/,
      patterns: [
        {
          match: "{lb}(" + (pragmas.join('|')) + "){rb}",
          name: 'keyword.other.preprocessor.haskell'
        }
      ]
    },
    function_type_declaration: {
      name: 'meta.function.type-declaration.haskell',
      begin: /{indentBlockStart}{functionTypeDeclaration}/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          patterns: [
            {
              include: '#function_name'
            }, {
              include: '#infix_op'
            }
          ]
        },
        3: {
          name: 'keyword.other.double-colon.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    ctor_type_declaration: {
      name: 'meta.ctor.type-declaration.haskell',
      begin: /{indentBlockStart}{ctorTypeDeclaration}/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          patterns: [
            {
              include: '#type_ctor'
            }, {
              include: '#infix_op'
            }
          ]
        },
        3: {
          name: 'keyword.other.double-colon.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    record_field_declaration: {
      name: 'meta.record-field.type-declaration.haskell',
      begin: /{lb}{functionTypeDeclaration}/,
      end: /(?={functionTypeDeclaration}|})/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        1: {
          patterns: [
            {
              include: '#attribute_name'
            }, {
              include: '#infix_op'
            }
          ]
        },
        2: {
          name: 'keyword.other.double-colon.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    type_signature: {
      patterns: [
        {
          include: '#pragma'
        }, {
          include: '#comments'
        }, {
          name: 'keyword.other.forall.haskell',
          match: '{lb}forall{rb}'
        }, {
          include: '#unit'
        }, {
          include: '#empty_list'
        }, {
          include: '#string'
        }, {
          name: 'keyword.other.arrow.haskell',
          match: '(?<!{operatorChar})(->|→)(?!{operatorChar})'
        }, {
          name: 'keyword.other.big-arrow.haskell',
          match: '(?<!{operatorChar})(=>|⇒)(?!{operatorChar})'
        }, {
          include: '#operator'
        }, {
          name: 'variable.other.generic-type.haskell',
          match: /{lb}{functionName}{rb}/
        }, {
          include: '#type_name'
        }
      ]
    },
    unit: {
      name: 'constant.language.unit.haskell',
      match: /\(\)/
    },
    empty_list: {
      name: 'constant.language.empty-list.haskell',
      match: /\[\]/
    },
    deriving: {
      patterns: [
        {
          include: '#deriving_list'
        }, {
          include: '#deriving_simple'
        }, {
          include: '#deriving_keyword'
        }
      ]
    },
    deriving_keyword: {
      name: 'meta.deriving.haskell',
      match: /{lb}(deriving){rb}/,
      captures: {
        1: {
          name: 'keyword.other.haskell'
        }
      }
    },
    deriving_list: {
      name: 'meta.deriving.haskell',
      begin: /{lb}(deriving)\s*\(/,
      end: /\)/,
      beginCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          match: /{lb}({className}){rb}/,
          captures: {
            1: {
              name: 'entity.other.inherited-class.haskell'
            }
          }
        }
      ]
    },
    deriving_simple: {
      name: 'meta.deriving.haskell',
      match: /{lb}(deriving)\s*({className}){rb}/,
      captures: {
        1: {
          name: 'keyword.other.haskell'
        },
        2: {
          name: 'entity.other.inherited-class.haskell'
        }
      }
    },
    infix_function: {
      name: 'keyword.operator.function.infix.haskell',
      match: /(`){functionName}(`)/,
      captures: {
        1: {
          name: 'punctuation.definition.entity.haskell'
        },
        2: {
          name: 'punctuation.definition.entity.haskell'
        }
      }
    },
    quasi_quotes: {
      begin: /(\[)({functionNameOne})(\|)/,
      end: /(\|)(\])/,
      beginCaptures: {
        1: {
          name: 'punctuation.definition.quasiquotes.begin.haskell'
        },
        2: {
          name: 'entity.name.tag.haskell'
        }
      },
      endCaptures: {
        2: {
          name: 'punctuation.definition.quasiquotes.end.haskell'
        }
      },
      contentName: 'string.quoted.quasiquotes.haskell'
    },
    module_decl: {
      name: 'meta.declaration.module.haskell',
      begin: /{indentBlockStart}(module){rb}/,
      end: /{lb}(where){rb}|{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      endCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#module_name'
        }, {
          include: '#module_exports'
        }, {
          include: '#invalid'
        }
      ]
    },
    class_decl: {
      name: 'meta.declaration.class.haskell',
      begin: /{indentBlockStart}(class){rb}/,
      end: /{lb}(where){rb}|{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.class.haskell'
        }
      },
      endCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#type_signature'
        }
      ]
    },
    instance_decl: {
      name: 'meta.declaration.instance.haskell',
      begin: /{indentBlockStart}(instance){rb}/,
      end: /{lb}(where){rb}|{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      endCaptures: {
        1: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#pragma'
        }, {
          include: '#type_signature'
        }
      ]
    },
    deriving_instance_decl: {
      name: 'meta.declaration.instance.deriving.haskell',
      begin: /{indentBlockStart}(deriving\s+instance){rb}/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#pragma'
        }, {
          include: '#type_signature'
        }
      ]
    },
    foreign_import: {
      name: 'meta.foreign.haskell',
      begin: /{indentBlockStart}(foreign)\s+(import|export){rb}/,
      end: /{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        },
        3: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          match: /(?:un)?safe/,
          captures: {
            0: {
              name: 'keyword.other.haskell'
            }
          }
        }, {
          include: '#function_type_declaration'
        }, {
          include: '#haskell_expr'
        }
      ]
    },
    regular_import: {
      name: 'meta.import.haskell',
      begin: /{indentBlockStart}(import){rb}/,
      end: /{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.haskell'
        }
      },
      patterns: [
        {
          include: '#module_name'
        }, {
          include: '#module_exports'
        }, {
          match: /{lb}(qualified|as|hiding){rb}/,
          captures: {
            1: {
              name: 'keyword.other.haskell'
            }
          }
        }
      ]
    },
    data_decl: {
      name: 'meta.declaration.type.data.haskell',
      begin: /{indentBlockStart}(data|newtype)\s+((?:(?!=|where).)*)/,
      end: /{indentBlockEnd}/,
      beginCaptures: {
        2: {
          name: 'keyword.other.data.haskell'
        },
        3: {
          name: 'meta.type-signature.haskell',
          patterns: [
            {
              include: '#family_and_instance'
            }, {
              include: '#type_signature'
            }
          ]
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#where'
        }, {
          include: '#deriving'
        }, {
          include: '#assignment_op'
        }, {
          match: /{ctor}/,
          captures: {
            1: {
              patterns: [
                {
                  include: '#type_ctor'
                }
              ]
            },
            2: {
              name: 'meta.type-signature.haskell',
              patterns: [
                {
                  include: '#type_signature'
                }
              ]
            }
          }
        }, {
          match: /\|/,
          captures: {
            0: {
              name: 'punctuation.separator.pipe.haskell'
            }
          }
        }, {
          name: 'meta.declaration.type.data.record.block.haskell',
          begin: /\{/,
          beginCaptures: {
            0: {
              name: 'keyword.operator.record.begin.haskell'
            }
          },
          end: /\}/,
          endCaptures: {
            0: {
              name: 'keyword.operator.record.end.haskell'
            }
          },
          patterns: [
            {
              include: '#comments'
            }, {
              include: '#comma'
            }, {
              include: '#record_field_declaration'
            }
          ]
        }, {
          include: '#ctor_type_declaration'
        }
      ]
    },
    type_alias: {
      name: 'meta.declaration.type.type.haskell',
      begin: /{indentBlockStart}(type){rb}/,
      end: /{indentBlockEnd}/,
      contentName: 'meta.type-signature.haskell',
      beginCaptures: {
        2: {
          name: 'keyword.other.type.haskell'
        }
      },
      patterns: [
        {
          include: '#comments'
        }, {
          include: '#family_and_instance'
        }, {
          include: '#where'
        }, {
          include: '#assignment_op'
        }, {
          include: '#type_signature'
        }
      ]
    },
    keywords: [
      {
        name: 'keyword.other.haskell',
        match: /{lb}(deriving|where|data|type|newtype){rb}/
      }, {
        name: 'keyword.other.haskell',
        match: /{lb}(data|type|newtype){rb}/
      }, {
        name: 'keyword.operator.haskell',
        match: /{lb}infix[lr]?{rb}/
      }, {
        name: 'keyword.control.haskell',
        match: /{lb}(do|if|then|else|case|of|let|in|default){rb}/
      }
    ],
    c_preprocessor: {
      name: 'meta.preprocessor.c',
      begin: /{maybeBirdTrack}(?=#)/,
      end: '(?<!\\\\)(?=\\n)',
      patterns: [
        {
          include: 'source.c'
        }
      ]
    },
    string: {
      name: 'string.quoted.double.haskell',
      begin: /"/,
      end: /"/,
      beginCaptures: {
        0: {
          name: 'punctuation.definition.string.begin.haskell'
        }
      },
      endCaptures: {
        0: {
          name: 'punctuation.definition.string.end.haskell'
        }
      },
      patterns: [
        {
          include: '#characters'
        }, {
          begin: /\\\s/,
          end: /\\/,
          beginCaptures: {
            0: {
              name: 'markup.other.escape.newline.begin.haskell'
            }
          },
          endCaptures: {
            0: {
              name: 'markup.other.escape.newline.end.haskell'
            }
          },
          patterns: [
            {
              include: '#invalid'
            }
          ]
        }
      ]
    },
    newline_escape: {
      name: 'markup.other.escape.newline.haskell',
      match: /\\$/
    },
    quoted_character: {
      name: 'string.quoted.single.haskell',
      match: /(')({character})(')/,
      captures: {
        1: {
          name: 'punctuation.definition.string.begin.haskell'
        },
        2: {
          patterns: [
            {
              include: '#characters'
            }
          ]
        },
        3: {
          name: 'punctuation.definition.string.end.haskell'
        }
      }
    },
    scoped_type: [
      {
        match: "\\((" + (balanced('paren', '\\(', '\\)')) + "{doubleColonOperator}" + (balanced('paren2', '\\(', '\\)')) + ")\\)",
        captures: {
          1: {
            patterns: [
              {
                include: '#haskell_expr'
              }
            ]
          }
        }
      }, {
        match: '({doubleColonOperator})(.*?)(?=(?<!{operatorChar})(<-|=)(?!{operatorChar})|$)',
        captures: {
          1: {
            name: 'keyword.other.double-colon.haskell'
          },
          2: {
            name: 'meta.type-signature.haskell',
            patterns: [
              {
                include: '#type_signature'
              }
            ]
          }
        }
      }
    ],
    scoped_type_override: {
      match: '{indentBlockStart}{functionTypeDeclaration}(.*)(?<!{operatorChar})(<-|=)(?!{operatorChar})',
      captures: {
        2: {
          patterns: [
            {
              include: '#identifier'
            }
          ]
        },
        3: {
          name: 'keyword.other.double-colon.haskell'
        },
        4: {
          name: 'meta.type-signature.haskell',
          patterns: [
            {
              include: '#type_signature'
            }
          ]
        },
        5: {
          patterns: [
            {
              include: '#assignment_op'
            }, {
              include: '#operator'
            }
          ]
        }
      }
    },
    comma: {
      name: 'punctuation.separator.comma.haskell',
      match: /,/
    },
    lit_num: [
      {
        name: 'constant.numeric.hexadecimal.haskell',
        match: '0[xX][0-9a-fA-F]+'
      }, {
        name: 'constant.numeric.octal.haskell',
        match: '0[oO][0-7]+'
      }, {
        name: 'constant.numeric.float.haskell',
        match: '[0-9]+(\\.[0-9]+[eE][+-]?|\\.|[eE][+-]?)[0-9]+'
      }, {
        name: 'constant.numeric.decimal.haskell',
        match: '[0-9]+'
      }
    ],
    operator: {
      name: 'keyword.operator.haskell',
      match: /{operator}/
    },
    identifier: {
      match: '{lb}{functionName}{rb}',
      name: 'identifier.haskell',
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'support.function.prelude.haskell',
              match: "{lb}(" + (prelude.funct.join('|')) + "){rb}"
            }
          ]
        }
      }
    },
    type_name: {
      name: 'entity.name.type.haskell',
      match: /{lb}{className}{rb}/,
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'entity.other.inherited-class.prelude.haskell',
              match: "{lb}(" + (prelude.classes.join('|')) + "){rb}"
            }, {
              name: 'support.class.prelude.haskell',
              match: "{lb}(" + (prelude.types.join('|')) + "){rb}"
            }
          ]
        }
      }
    },
    type_ctor: {
      name: 'entity.name.tag.haskell',
      match: /{lb}{className}{rb}/,
      captures: {
        0: {
          patterns: [
            {
              include: '#module_name_prefix'
            }, {
              name: 'support.tag.prelude.haskell',
              match: "{lb}(" + (prelude.constr.join('|')) + "){rb}"
            }
          ]
        }
      }
    },
    where: {
      match: '{lb}where{rb}',
      name: 'keyword.other.haskell'
    },
    family_and_instance: {
      match: '{lb}(family|instance){rb}',
      name: 'keyword.other.haskell'
    },
    invalid: {
      match: /\S+/,
      name: 'invalid.illegal.character-not-allowed-here.haskell'
    },
    function_name: {
      name: 'entity.name.function.haskell',
      match: /{lb}{functionName}{rb}/
    },
    assignment_op: {
      match: /=/,
      captures: {
        0: {
          name: 'keyword.operator.assignment.haskell'
        }
      }
    },
    attribute_name: {
      name: 'entity.other.attribute-name.haskell',
      match: /{lb}{functionName}{rb}/
    },
    liquidhaskell_annotation: {
      name: 'block.liquidhaskell',
      contentName: 'block.liquidhaskell.annotation',
      begin: '\\{-@(?!#)',
      end: '@-\\}',
      patterns: [
        {
          include: '#haskell_expr'
        }
      ]
    },
    shebang: {
      name: 'comment.line.shebang.haskell',
      match: '^\\#\\!.*\\brunhaskell\\b.*$'
    },
    haskell_expr: [
      {
        include: '#infix_function'
      }, {
        include: '#unit'
      }, {
        include: '#empty_list'
      }, {
        include: '#quasi_quotes'
      }, {
        include: '#keywords'
      }, {
        include: '#pragma'
      }, {
        include: '#string'
      }, {
        include: '#newline_escape'
      }, {
        include: '#quoted_character'
      }, {
        include: '#comments'
      }, {
        include: '#infix_op'
      }, {
        include: '#comma'
      }, {
        include: '#lit_num'
      }, {
        include: '#scoped_type'
      }, {
        include: '#operator'
      }, {
        include: '#identifier'
      }, {
        include: '#type_ctor'
      }
    ],
    haskell_toplevel: [
      {
        include: '#liquidhaskell_annotation'
      }, {
        include: '#class_decl'
      }, {
        include: '#instance_decl'
      }, {
        include: '#deriving_instance_decl'
      }, {
        include: '#foreign_import'
      }, {
        include: '#regular_import'
      }, {
        include: '#data_decl'
      }, {
        include: '#type_alias'
      }, {
        include: '#c_preprocessor'
      }, {
        include: '#scoped_type_override'
      }, {
        include: '#function_type_declaration'
      }, {
        include: '#haskell_expr'
      }
    ],
    haskell_source: [
      {
        include: '#shebang'
      }, {
        include: '#module_decl'
      }, {
        include: '#haskell_toplevel'
      }
    ]
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2luY2x1ZGUvcmVwb3NpdG9yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1IsV0FBYSxPQUFBLENBQVEsUUFBUjs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsYUFBQSxFQUNFO01BQUEsUUFBQSxFQUFVO1FBQ047VUFBQSxJQUFBLEVBQU0sK0JBQU47VUFDQSxLQUFBLEVBQU8sWUFEUDtVQUVBLEdBQUEsRUFBSyxLQUZMO1VBR0EsbUJBQUEsRUFBcUIsQ0FIckI7VUFJQSxhQUFBLEVBQ0U7WUFBQSxDQUFBLEVBQUc7Y0FBQSxJQUFBLEVBQU0sZ0RBQU47YUFBSDtXQUxGO1VBTUEsV0FBQSxFQUNFO1lBQUEsQ0FBQSxFQUFHO2NBQUEsSUFBQSxFQUFNLGdEQUFOO2FBQUg7V0FQRjtVQVFBLFFBQUEsRUFBVTtZQUNOO2NBQUEsT0FBQSxFQUFTLGdCQUFUO2FBRE07V0FSVjtTQURNLEVBYU47VUFBQSxJQUFBLEVBQU0sdUJBQU47VUFDQSxLQUFBLEVBQU8sS0FEUDtVQUVBLEdBQUEsRUFBSyxLQUZMO1VBR0EsbUJBQUEsRUFBcUIsQ0FIckI7VUFJQSxhQUFBLEVBQ0U7WUFBQSxDQUFBLEVBQUc7Y0FBQSxJQUFBLEVBQU0sb0RBQU47YUFBSDtXQUxGO1VBTUEsV0FBQSxFQUNFO1lBQUEsQ0FBQSxFQUFHO2NBQUEsSUFBQSxFQUFNLGtEQUFOO2FBQUg7V0FQRjtVQVFBLFFBQUEsRUFBVTtZQUNOO2NBQUEsT0FBQSxFQUFTLGdCQUFUO2FBRE07V0FSVjtTQWJNO09BQVY7S0FERjtJQTBCQSxRQUFBLEVBQ0U7TUFBQSxRQUFBLEVBQVU7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Z0I7TUFDZDtRQUFFLE9BQUEsRUFBUyxVQUFYO09BRGMsRUFFZDtRQUFFLE9BQUEsRUFBUyxjQUFYO09BRmMsRUFHZDtRQUFFLE9BQUEsRUFBUyxtQkFBWDtPQUhjO0tBMWpCaEI7O0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyJwcmVsdWRlID0gcmVxdWlyZSAnLi9wcmVsdWRlJ1xucHJhZ21hcyA9IHJlcXVpcmUgJy4vcHJhZ21hcydcbnsgYmFsYW5jZWQgfSA9IHJlcXVpcmUgJy4vdXRpbCdcblxubW9kdWxlLmV4cG9ydHM9XG4gIGJsb2NrX2NvbW1lbnQ6XG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgbmFtZTogJ2NvbW1lbnQuYmxvY2suaGFkZG9jay5oYXNrZWxsJ1xuICAgICAgICBiZWdpbjogL1xcey1cXHMqW3xeXS9cbiAgICAgICAgZW5kOiAvLVxcfS9cbiAgICAgICAgYXBwbHlFbmRQYXR0ZXJuTGFzdDogMVxuICAgICAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuaGFkZG9jay5oYXNrZWxsJ1xuICAgICAgICBlbmRDYXB0dXJlczpcbiAgICAgICAgICAwOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmhhZGRvY2suaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjYmxvY2tfY29tbWVudCdcbiAgICAgICAgXVxuICAgICAgLFxuICAgICAgICBuYW1lOiAnY29tbWVudC5ibG9jay5oYXNrZWxsJ1xuICAgICAgICBiZWdpbjogL1xcey0vXG4gICAgICAgIGVuZDogLy1cXH0vXG4gICAgICAgIGFwcGx5RW5kUGF0dGVybkxhc3Q6IDFcbiAgICAgICAgYmVnaW5DYXB0dXJlczpcbiAgICAgICAgICAwOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLnN0YXJ0Lmhhc2tlbGwnXG4gICAgICAgIGVuZENhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuYmxvY2suZW5kLmhhc2tlbGwnXG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBpbmNsdWRlOiAnI2Jsb2NrX2NvbW1lbnQnXG4gICAgICAgIF1cbiAgICBdXG4gIGNvbW1lbnRzOlxuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGJlZ2luOiAvKHttYXliZUJpcmRUcmFja31bIFxcdF0rKT8oPz0tLStcXHMrW3xeXSkvXG4gICAgICAgIGVuZDogLyg/IVxcRykvXG4gICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgMTogbmFtZTogJ3B1bmN0dWF0aW9uLndoaXRlc3BhY2UuY29tbWVudC5sZWFkaW5nLmhhc2tlbGwnXG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBuYW1lOiAnY29tbWVudC5saW5lLmRvdWJsZS1kYXNoLmhhZGRvY2suaGFza2VsbCdcbiAgICAgICAgICAgIGJlZ2luOiAvKC0tKylcXHMrKFt8Xl0pL1xuICAgICAgICAgICAgZW5kOiAvXFxuL1xuICAgICAgICAgICAgYmVnaW5DYXB0dXJlczpcbiAgICAgICAgICAgICAgMTogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5oYXNrZWxsJ1xuICAgICAgICAgICAgICAyOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmhhZGRvY2suaGFza2VsbCdcbiAgICAgICAgXVxuICAgICAgLFxuICAgICAgICAjIyNcbiAgICAgICAgT3BlcmF0b3JzIG1heSBiZWdpbiB3aXRoIC0tIGFzIGxvbmcgYXMgdGhleSBhcmUgbm90XG4gICAgICAgIGVudGlyZWx5IGNvbXBvc2VkIG9mIC0gY2hhcmFjdGVycy4gVGhpcyBtZWFucyBjb21tZW50cyBjYW4ndCBiZVxuICAgICAgICBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSBhbiBhbGxvd2FibGUgb3BlcmF0b3IgY2hhcmFjdGVyLlxuICAgICAgICAjIyNcbiAgICAgICAgYmVnaW46IC8oe21heWJlQmlyZFRyYWNrfVsgXFx0XSspPyg/PS0tKyg/IXtvcGVyYXRvckNoYXJ9KSkvXG4gICAgICAgIGVuZDogLyg/IVxcRykvXG4gICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgMTogbmFtZTogJ3B1bmN0dWF0aW9uLndoaXRlc3BhY2UuY29tbWVudC5sZWFkaW5nLmhhc2tlbGwnXG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBuYW1lOiAnY29tbWVudC5saW5lLmRvdWJsZS1kYXNoLmhhc2tlbGwnXG4gICAgICAgICAgICBiZWdpbjogLy0tL1xuICAgICAgICAgICAgZW5kOiAvXFxuL1xuICAgICAgICAgICAgYmVnaW5DYXB0dXJlczpcbiAgICAgICAgICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5oYXNrZWxsJ1xuICAgICAgICBdXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjYmxvY2tfY29tbWVudCdcbiAgICBdXG4gIGNoYXJhY3RlcnM6XG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge21hdGNoOiAne2VzY2FwZUNoYXJ9JywgbmFtZTogJ2NvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUuaGFza2VsbCd9XG4gICAgICAgIHttYXRjaDogJ3tvY3RhbENoYXJ9JywgbmFtZTogJ2NvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUub2N0YWwuaGFza2VsbCd9XG4gICAgICAgIHttYXRjaDogJ3toZXhDaGFyfScsIG5hbWU6ICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLmhleGFkZWNpbWFsLmhhc2tlbGwnfVxuICAgICAgICB7bWF0Y2g6ICd7Y29udHJvbENoYXJ9JywgbmFtZTogJ2NvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGUuY29udHJvbC5oYXNrZWxsJ31cbiAgICAgIF1cbiAgaW5maXhfb3A6XG4gICAgbmFtZTogJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmluZml4Lmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97b3BlcmF0b3JGdW59L1xuICBtb2R1bGVfZXhwb3J0czpcbiAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi5leHBvcnRzLmhhc2tlbGwnXG4gICAgYmVnaW46IC9cXCgvXG4gICAgZW5kOiAvXFwpL1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjY29tbWVudHMnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjZnVuY3Rpb25fbmFtZSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyN0eXBlX25hbWUnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjY29tbWEnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdtZXRhLm90aGVyLmNvbnN0cnVjdG9yLWxpc3QuaGFza2VsbCdcbiAgICAgICAgYmVnaW46IC97cmJ9XFxzKlxcKC9cbiAgICAgICAgZW5kOiAvXFwpL1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgIHsgaW5jbHVkZTogJyN0eXBlX2N0b3InIH1cbiAgICAgICAgICB7IGluY2x1ZGU6ICcjYXR0cmlidXRlX25hbWUnIH1cbiAgICAgICAgICB7IGluY2x1ZGU6ICcjY29tbWEnIH1cbiAgICAgICAgICB7XG4gICAgICAgICAgICBtYXRjaDogL1xcLlxcLi9cbiAgICAgICAgICAgIG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLndpbGRjYXJkLmhhc2tlbGwnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjaW5maXhfb3AnXG4gICAgXVxuICBtb2R1bGVfbmFtZTpcbiAgICBuYW1lOiAnc3VwcG9ydC5vdGhlci5tb2R1bGUuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn17Y2xhc3NOYW1lfXtyYn0vXG4gIG1vZHVsZV9uYW1lX3ByZWZpeDpcbiAgICBuYW1lOiAnc3VwcG9ydC5vdGhlci5tb2R1bGUuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn17Y2xhc3NOYW1lfVxcLi9cbiAgcHJhZ21hOlxuICAgIG5hbWU6ICdtZXRhLnByZXByb2Nlc3Nvci5oYXNrZWxsJ1xuICAgIGJlZ2luOiAvXFx7LSMvXG4gICAgZW5kOiAvIy1cXH0vXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgbWF0Y2g6IFwie2xifSgje3ByYWdtYXMuam9pbignfCcpfSl7cmJ9XCJcbiAgICAgICAgbmFtZTogJ2tleXdvcmQub3RoZXIucHJlcHJvY2Vzc29yLmhhc2tlbGwnXG4gICAgXVxuICBmdW5jdGlvbl90eXBlX2RlY2xhcmF0aW9uOlxuICAgIG5hbWU6ICdtZXRhLmZ1bmN0aW9uLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fXtmdW5jdGlvblR5cGVEZWNsYXJhdGlvbn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjpcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2Z1bmN0aW9uX25hbWUnfVxuICAgICAgICAgICAge2luY2x1ZGU6ICcjaW5maXhfb3AnfVxuICAgICAgICBdXG4gICAgICAzOiBuYW1lOiAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ1xuICAgIF1cbiAgY3Rvcl90eXBlX2RlY2xhcmF0aW9uOlxuICAgIG5hbWU6ICdtZXRhLmN0b3IudHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9e2N0b3JUeXBlRGVjbGFyYXRpb259L1xuICAgIGVuZDogL3tpbmRlbnRCbG9ja0VuZH0vXG4gICAgY29udGVudE5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDI6XG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBpbmNsdWRlOiAnI3R5cGVfY3RvcidcbiAgICAgICAgICAsXG4gICAgICAgICAgICBpbmNsdWRlOiAnI2luZml4X29wJ1xuICAgICAgICBdXG4gICAgICAzOiBuYW1lOiAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ1xuICAgIF1cbiAgcmVjb3JkX2ZpZWxkX2RlY2xhcmF0aW9uOlxuICAgIG5hbWU6ICdtZXRhLnJlY29yZC1maWVsZC50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXG4gICAgYmVnaW46IC97bGJ9e2Z1bmN0aW9uVHlwZURlY2xhcmF0aW9ufS9cbiAgICBlbmQ6IC8oPz17ZnVuY3Rpb25UeXBlRGVjbGFyYXRpb259fH0pL1xuICAgIGNvbnRlbnROYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAxOlxuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAgaW5jbHVkZTogJyNhdHRyaWJ1dGVfbmFtZSdcbiAgICAgICAgICAsXG4gICAgICAgICAgICBpbmNsdWRlOiAnI2luZml4X29wJ1xuICAgICAgICBdXG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ1xuICAgIF1cbiAgdHlwZV9zaWduYXR1cmU6XG4gICAgcGF0dGVybnM6IFtcbiAgICAgICNUT0RPOiBUeXBlIG9wZXJhdG9ycywgdHlwZS1sZXZlbCBpbnRlZ2VycyBldGNcbiAgICAgICAgaW5jbHVkZTogJyNwcmFnbWEnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjY29tbWVudHMnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmZvcmFsbC5oYXNrZWxsJ1xuICAgICAgICBtYXRjaDogJ3tsYn1mb3JhbGx7cmJ9J1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI3VuaXQnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjZW1wdHlfbGlzdCdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNzdHJpbmcnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmFycm93Lmhhc2tlbGwnXG4gICAgICAgIG1hdGNoOiAnKD88IXtvcGVyYXRvckNoYXJ9KSgtPnzihpIpKD8he29wZXJhdG9yQ2hhcn0pJ1xuICAgICAgLFxuICAgICAgICBuYW1lOiAna2V5d29yZC5vdGhlci5iaWctYXJyb3cuaGFza2VsbCdcbiAgICAgICAgbWF0Y2g6ICcoPzwhe29wZXJhdG9yQ2hhcn0pKD0+fOKHkikoPyF7b3BlcmF0b3JDaGFyfSknXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjb3BlcmF0b3InXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICd2YXJpYWJsZS5vdGhlci5nZW5lcmljLXR5cGUuaGFza2VsbCdcbiAgICAgICAgbWF0Y2g6IC97bGJ9e2Z1bmN0aW9uTmFtZX17cmJ9L1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfbmFtZSdcbiAgICBdXG4gIHVuaXQ6XG4gICAgbmFtZTogJ2NvbnN0YW50Lmxhbmd1YWdlLnVuaXQuaGFza2VsbCdcbiAgICBtYXRjaDogL1xcKFxcKS9cbiAgZW1wdHlfbGlzdDpcbiAgICBuYW1lOiAnY29uc3RhbnQubGFuZ3VhZ2UuZW1wdHktbGlzdC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAvXFxbXFxdL1xuICBkZXJpdmluZzpcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICB7aW5jbHVkZTogJyNkZXJpdmluZ19saXN0J31cbiAgICAgICAge2luY2x1ZGU6ICcjZGVyaXZpbmdfc2ltcGxlJ31cbiAgICAgICAge2luY2x1ZGU6ICcjZGVyaXZpbmdfa2V5d29yZCd9XG4gICAgXVxuICBkZXJpdmluZ19rZXl3b3JkOlxuICAgIG5hbWU6ICdtZXRhLmRlcml2aW5nLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9KGRlcml2aW5nKXtyYn0vXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICBkZXJpdmluZ19saXN0OlxuICAgIG5hbWU6ICdtZXRhLmRlcml2aW5nLmhhc2tlbGwnXG4gICAgYmVnaW46IC97bGJ9KGRlcml2aW5nKVxccypcXCgvXG4gICAgZW5kOiAvXFwpL1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIG1hdGNoOiAve2xifSh7Y2xhc3NOYW1lfSl7cmJ9L1xuICAgICAgICBjYXB0dXJlczpcbiAgICAgICAgICAxOiBuYW1lOiAnZW50aXR5Lm90aGVyLmluaGVyaXRlZC1jbGFzcy5oYXNrZWxsJ1xuICAgIF1cbiAgZGVyaXZpbmdfc2ltcGxlOlxuICAgIG5hbWU6ICdtZXRhLmRlcml2aW5nLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9KGRlcml2aW5nKVxccyooe2NsYXNzTmFtZX0pe3JifS9cbiAgICBjYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgICAyOiBuYW1lOiAnZW50aXR5Lm90aGVyLmluaGVyaXRlZC1jbGFzcy5oYXNrZWxsJ1xuICBpbmZpeF9mdW5jdGlvbjpcbiAgICBuYW1lOiAna2V5d29yZC5vcGVyYXRvci5mdW5jdGlvbi5pbmZpeC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAvKGApe2Z1bmN0aW9uTmFtZX0oYCkvXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5lbnRpdHkuaGFza2VsbCdcbiAgICAgIDI6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmVudGl0eS5oYXNrZWxsJ1xuICBxdWFzaV9xdW90ZXM6XG4gICAgYmVnaW46IC8oXFxbKSh7ZnVuY3Rpb25OYW1lT25lfSkoXFx8KS9cbiAgICBlbmQ6IC8oXFx8KShcXF0pL1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5xdWFzaXF1b3Rlcy5iZWdpbi5oYXNrZWxsJ1xuICAgICAgMjogbmFtZTogJ2VudGl0eS5uYW1lLnRhZy5oYXNrZWxsJ1xuICAgIGVuZENhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVhc2lxdW90ZXMuZW5kLmhhc2tlbGwnXG4gICAgY29udGVudE5hbWU6ICdzdHJpbmcucXVvdGVkLnF1YXNpcXVvdGVzLmhhc2tlbGwnXG4gIG1vZHVsZV9kZWNsOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLm1vZHVsZS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KG1vZHVsZSl7cmJ9L1xuICAgIGVuZDogL3tsYn0od2hlcmUpe3JifXx7aW5kZW50QmxvY2tFbmR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIGVuZENhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICB7aW5jbHVkZTogJyNjb21tZW50cyd9XG4gICAgICAgIHtpbmNsdWRlOiAnI21vZHVsZV9uYW1lJ31cbiAgICAgICAge2luY2x1ZGU6ICcjbW9kdWxlX2V4cG9ydHMnfVxuICAgICAgICB7aW5jbHVkZTogJyNpbnZhbGlkJ31cbiAgICBdXG4gIGNsYXNzX2RlY2w6XG4gICAgbmFtZTogJ21ldGEuZGVjbGFyYXRpb24uY2xhc3MuaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fShjbGFzcyl7cmJ9L1xuICAgIGVuZDogL3tsYn0od2hlcmUpe3JifXx7aW5kZW50QmxvY2tFbmR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5jbGFzcy5oYXNrZWxsJ1xuICAgIGVuZENhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ1xuICAgIF1cbiAgaW5zdGFuY2VfZGVjbDpcbiAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi5pbnN0YW5jZS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KGluc3RhbmNlKXtyYn0vXG4gICAgZW5kOiAve2xifSh3aGVyZSl7cmJ9fHtpbmRlbnRCbG9ja0VuZH0vXG4gICAgY29udGVudE5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgZW5kQ2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHtpbmNsdWRlOiAnI3ByYWdtYSd9XG4gICAgICAgIHtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ31cbiAgICBdXG4gIGRlcml2aW5nX2luc3RhbmNlX2RlY2w6XG4gICAgbmFtZTogJ21ldGEuZGVjbGFyYXRpb24uaW5zdGFuY2UuZGVyaXZpbmcuaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fShkZXJpdmluZ1xccytpbnN0YW5jZSl7cmJ9L1xuICAgIGVuZDogL3tpbmRlbnRCbG9ja0VuZH0vXG4gICAgY29udGVudE5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjcHJhZ21hJ31cbiAgICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgIF1cbiAgZm9yZWlnbl9pbXBvcnQ6XG4gICAgbmFtZTogJ21ldGEuZm9yZWlnbi5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KGZvcmVpZ24pXFxzKyhpbXBvcnR8ZXhwb3J0KXtyYn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICAgIDM6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6W1xuICAgICAgICBtYXRjaDogLyg/OnVuKT9zYWZlL1xuICAgICAgICBjYXB0dXJlczpcbiAgICAgICAgICAwOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI2Z1bmN0aW9uX3R5cGVfZGVjbGFyYXRpb24nXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjaGFza2VsbF9leHByJ1xuICAgIF1cbiAgcmVndWxhcl9pbXBvcnQ6XG4gICAgbmFtZTogJ21ldGEuaW1wb3J0Lmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oaW1wb3J0KXtyYn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI21vZHVsZV9uYW1lJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI21vZHVsZV9leHBvcnRzJ1xuICAgICAgLFxuICAgICAgICBtYXRjaDogL3tsYn0ocXVhbGlmaWVkfGFzfGhpZGluZyl7cmJ9L1xuICAgICAgICBjYXB0dXJlczpcbiAgICAgICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIF1cbiAgZGF0YV9kZWNsOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KGRhdGF8bmV3dHlwZSlcXHMrKCg/Oig/IT18d2hlcmUpLikqKS9cbiAgICBlbmQ6IC97aW5kZW50QmxvY2tFbmR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5kYXRhLmhhc2tlbGwnXG4gICAgICAzOlxuICAgICAgICBuYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgIHtpbmNsdWRlOiAnI2ZhbWlseV9hbmRfaW5zdGFuY2UnfVxuICAgICAgICAgIHtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ31cbiAgICAgICAgXVxuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjY29tbWVudHMnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjd2hlcmUnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjZGVyaXZpbmcnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjYXNzaWdubWVudF9vcCdcbiAgICAgICxcbiAgICAgICAgbWF0Y2g6IC97Y3Rvcn0vXG4gICAgICAgIGNhcHR1cmVzOlxuICAgICAgICAgIDE6IHBhdHRlcm5zOiBbaW5jbHVkZTogJyN0eXBlX2N0b3InXVxuICAgICAgICAgIDI6XG4gICAgICAgICAgICBuYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgICAgICAgICAgcGF0dGVybnM6IFtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ11cbiAgICAgICxcbiAgICAgICAgbWF0Y2g6IC9cXHwvXG4gICAgICAgIGNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5zZXBhcmF0b3IucGlwZS5oYXNrZWxsJ1xuICAgICAgLFxuICAgICAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi50eXBlLmRhdGEucmVjb3JkLmJsb2NrLmhhc2tlbGwnXG4gICAgICAgIGJlZ2luOiAvXFx7L1xuICAgICAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLnJlY29yZC5iZWdpbi5oYXNrZWxsJ1xuICAgICAgICBlbmQ6IC9cXH0vXG4gICAgICAgIGVuZENhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLnJlY29yZC5lbmQuaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2NvbW1lbnRzJ31cbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2NvbW1hJ31cbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI3JlY29yZF9maWVsZF9kZWNsYXJhdGlvbid9XG4gICAgICAgIF1cbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNjdG9yX3R5cGVfZGVjbGFyYXRpb24nICNHQURUXG4gICAgXVxuICB0eXBlX2FsaWFzOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUudHlwZS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KHR5cGUpe3JifS9cbiAgICBlbmQ6IC97aW5kZW50QmxvY2tFbmR9L1xuICAgIGNvbnRlbnROYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci50eXBlLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjY29tbWVudHMnfVxuICAgICAgICB7aW5jbHVkZTogJyNmYW1pbHlfYW5kX2luc3RhbmNlJ31cbiAgICAgICAge2luY2x1ZGU6ICcjd2hlcmUnfVxuICAgICAgICB7aW5jbHVkZTogJyNhc3NpZ25tZW50X29wJ31cbiAgICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgIF1cbiAga2V5d29yZHM6IFtcbiAgICBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifShkZXJpdmluZ3x3aGVyZXxkYXRhfHR5cGV8bmV3dHlwZSl7cmJ9L1xuICAsXG4gICAgbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn0oZGF0YXx0eXBlfG5ld3R5cGUpe3JifS9cbiAgLFxuICAgIG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9aW5maXhbbHJdP3tyYn0vXG4gICxcbiAgICBuYW1lOiAna2V5d29yZC5jb250cm9sLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9KGRvfGlmfHRoZW58ZWxzZXxjYXNlfG9mfGxldHxpbnxkZWZhdWx0KXtyYn0vXG4gIF1cbiAgY19wcmVwcm9jZXNzb3I6XG4gICAgbmFtZTogJ21ldGEucHJlcHJvY2Vzc29yLmMnXG4gICAgYmVnaW46IC97bWF5YmVCaXJkVHJhY2t9KD89IykvXG4gICAgZW5kOiAnKD88IVxcXFxcXFxcKSg/PVxcXFxuKSdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgaW5jbHVkZTogJ3NvdXJjZS5jJ1xuICAgIF1cbiAgc3RyaW5nOlxuICAgIG5hbWU6ICdzdHJpbmcucXVvdGVkLmRvdWJsZS5oYXNrZWxsJ1xuICAgIGJlZ2luOiAvXCIvXG4gICAgZW5kOiAvXCIvXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi5oYXNrZWxsJ1xuICAgIGVuZENhcHR1cmVzOlxuICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjY2hhcmFjdGVycydcbiAgICAgICxcbiAgICAgICAgYmVnaW46IC9cXFxcXFxzL1xuICAgICAgICBlbmQ6IC9cXFxcL1xuICAgICAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdtYXJrdXAub3RoZXIuZXNjYXBlLm5ld2xpbmUuYmVnaW4uaGFza2VsbCdcbiAgICAgICAgZW5kQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ21hcmt1cC5vdGhlci5lc2NhcGUubmV3bGluZS5lbmQuaGFza2VsbCdcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIHtpbmNsdWRlOiAnI2ludmFsaWQnfVxuICAgICAgICBdXG4gICAgXVxuICBuZXdsaW5lX2VzY2FwZTpcbiAgICBuYW1lOiAnbWFya3VwLm90aGVyLmVzY2FwZS5uZXdsaW5lLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC9cXFxcJC9cbiAgcXVvdGVkX2NoYXJhY3RlcjpcbiAgICBuYW1lOiAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaGFza2VsbCdcbiAgICBtYXRjaDogLygnKSh7Y2hhcmFjdGVyfSkoJykvXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaGFza2VsbCdcbiAgICAgIDI6XG4gICAgICAgIHBhdHRlcm5zOltcbiAgICAgICAgICBpbmNsdWRlOiAnI2NoYXJhY3RlcnMnXG4gICAgICAgIF1cbiAgICAgIDM6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5lbmQuaGFza2VsbCdcbiAgc2NvcGVkX3R5cGU6IFtcbiAgICBtYXRjaDogXCJcXFxcKCgje2JhbGFuY2VkICdwYXJlbicsICdcXFxcKCcsICdcXFxcKSd9e2RvdWJsZUNvbG9uT3BlcmF0b3J9I3tiYWxhbmNlZCAncGFyZW4yJywgJ1xcXFwoJywgJ1xcXFwpJ30pXFxcXClcIlxuICAgIGNhcHR1cmVzOlxuICAgICAgMTogcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJyNoYXNrZWxsX2V4cHInXG4gICAgICBdXG4gICxcbiAgICBtYXRjaDogJyh7ZG91YmxlQ29sb25PcGVyYXRvcn0pKC4qPykoPz0oPzwhe29wZXJhdG9yQ2hhcn0pKDwtfD0pKD8he29wZXJhdG9yQ2hhcn0pfCQpJ1xuICAgIGNhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuZG91YmxlLWNvbG9uLmhhc2tlbGwnXG4gICAgICAyOiB7bmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsIHBhdHRlcm5zOiBbaW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSddfVxuICBdXG4gIHNjb3BlZF90eXBlX292ZXJyaWRlOlxuICAgIG1hdGNoOiAne2luZGVudEJsb2NrU3RhcnR9e2Z1bmN0aW9uVHlwZURlY2xhcmF0aW9ufSguKikoPzwhe29wZXJhdG9yQ2hhcn0pKDwtfD0pKD8he29wZXJhdG9yQ2hhcn0pJ1xuICAgIGNhcHR1cmVzOlxuICAgICAgMjogcGF0dGVybnM6IFtpbmNsdWRlOiAnI2lkZW50aWZpZXInXVxuICAgICAgMzogbmFtZTogJ2tleXdvcmQub3RoZXIuZG91YmxlLWNvbG9uLmhhc2tlbGwnXG4gICAgICA0OiB7bmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCcsIHBhdHRlcm5zOiBbaW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSddfVxuICAgICAgNTogcGF0dGVybnM6IFtcbiAgICAgICAgICB7aW5jbHVkZTogJyNhc3NpZ25tZW50X29wJ31cbiAgICAgICAgICB7aW5jbHVkZTogJyNvcGVyYXRvcid9XG4gICAgICBdXG4gIGNvbW1hOlxuICAgIG5hbWU6ICdwdW5jdHVhdGlvbi5zZXBhcmF0b3IuY29tbWEuaGFza2VsbCdcbiAgICBtYXRjaDogLywvXG4gIGxpdF9udW06IFtcbiAgICBuYW1lOiAnY29uc3RhbnQubnVtZXJpYy5oZXhhZGVjaW1hbC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAnMFt4WF1bMC05YS1mQS1GXSsnXG4gICxcbiAgICBuYW1lOiAnY29uc3RhbnQubnVtZXJpYy5vY3RhbC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAnMFtvT11bMC03XSsnXG4gICxcbiAgICBuYW1lOiAnY29uc3RhbnQubnVtZXJpYy5mbG9hdC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAnWzAtOV0rKFxcXFwuWzAtOV0rW2VFXVsrLV0/fFxcXFwufFtlRV1bKy1dPylbMC05XSsnXG4gICxcbiAgICBuYW1lOiAnY29uc3RhbnQubnVtZXJpYy5kZWNpbWFsLmhhc2tlbGwnXG4gICAgbWF0Y2g6ICdbMC05XSsnXG4gIF1cbiAgb3BlcmF0b3I6XG4gICAgbmFtZTogJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCdcbiAgICBtYXRjaDogL3tvcGVyYXRvcn0vXG4gIGlkZW50aWZpZXI6XG4gICAgbWF0Y2g6ICd7bGJ9e2Z1bmN0aW9uTmFtZX17cmJ9J1xuICAgIG5hbWU6ICdpZGVudGlmaWVyLmhhc2tlbGwnXG4gICAgY2FwdHVyZXM6IDA6IHBhdHRlcm5zOiBbXG4gICAgICB7IGluY2x1ZGU6ICcjbW9kdWxlX25hbWVfcHJlZml4JyB9XG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzdXBwb3J0LmZ1bmN0aW9uLnByZWx1ZGUuaGFza2VsbCdcbiAgICAgICAgbWF0Y2g6IFwie2xifSgje3ByZWx1ZGUuZnVuY3Quam9pbignfCcpfSl7cmJ9XCJcbiAgICAgIH1cbiAgICBdXG4gIHR5cGVfbmFtZTpcbiAgICBuYW1lOiAnZW50aXR5Lm5hbWUudHlwZS5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtjbGFzc05hbWV9e3JifS9cbiAgICBjYXB0dXJlczogMDogcGF0dGVybnM6IFtcbiAgICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnZW50aXR5Lm90aGVyLmluaGVyaXRlZC1jbGFzcy5wcmVsdWRlLmhhc2tlbGwnXG4gICAgICAgICAgbWF0Y2g6IFwie2xifSgje3ByZWx1ZGUuY2xhc3Nlcy5qb2luKCd8Jyl9KXtyYn1cIlxuICAgICAgfVxuICAgICAge1xuICAgICAgICAgIG5hbWU6ICdzdXBwb3J0LmNsYXNzLnByZWx1ZGUuaGFza2VsbCdcbiAgICAgICAgICBtYXRjaDogXCJ7bGJ9KCN7cHJlbHVkZS50eXBlcy5qb2luKCd8Jyl9KXtyYn1cIlxuICAgICAgfVxuICAgIF1cbiAgdHlwZV9jdG9yOlxuICAgIG5hbWU6ICdlbnRpdHkubmFtZS50YWcuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn17Y2xhc3NOYW1lfXtyYn0vXG4gICAgY2FwdHVyZXM6IDA6IHBhdHRlcm5zOiBbXG4gICAgICB7IGluY2x1ZGU6ICcjbW9kdWxlX25hbWVfcHJlZml4JyB9XG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzdXBwb3J0LnRhZy5wcmVsdWRlLmhhc2tlbGwnXG4gICAgICAgIG1hdGNoOiBcIntsYn0oI3twcmVsdWRlLmNvbnN0ci5qb2luKCd8Jyl9KXtyYn1cIlxuICAgICAgfVxuICAgIF1cbiAgd2hlcmU6XG4gICAgbWF0Y2g6ICd7bGJ9d2hlcmV7cmJ9J1xuICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gIGZhbWlseV9hbmRfaW5zdGFuY2U6XG4gICAgbWF0Y2g6ICd7bGJ9KGZhbWlseXxpbnN0YW5jZSl7cmJ9J1xuICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gIGludmFsaWQ6XG4gICAgbWF0Y2g6IC9cXFMrL1xuICAgIG5hbWU6ICdpbnZhbGlkLmlsbGVnYWwuY2hhcmFjdGVyLW5vdC1hbGxvd2VkLWhlcmUuaGFza2VsbCdcbiAgZnVuY3Rpb25fbmFtZTpcbiAgICBuYW1lOiAnZW50aXR5Lm5hbWUuZnVuY3Rpb24uaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn17ZnVuY3Rpb25OYW1lfXtyYn0vXG4gIGFzc2lnbm1lbnRfb3A6XG4gICAgbWF0Y2g6IC89L1xuICAgIGNhcHR1cmVzOlxuICAgICAgMDogbmFtZTogJ2tleXdvcmQub3BlcmF0b3IuYXNzaWdubWVudC5oYXNrZWxsJ1xuICBhdHRyaWJ1dGVfbmFtZTpcbiAgICBuYW1lOiAnZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2Z1bmN0aW9uTmFtZX17cmJ9L1xuICBsaXF1aWRoYXNrZWxsX2Fubm90YXRpb246XG4gICAgbmFtZTogJ2Jsb2NrLmxpcXVpZGhhc2tlbGwnXG4gICAgY29udGVudE5hbWU6ICdibG9jay5saXF1aWRoYXNrZWxsLmFubm90YXRpb24nXG4gICAgYmVnaW46ICdcXFxcey1AKD8hIyknXG4gICAgZW5kOiAnQC1cXFxcfSdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI2hhc2tlbGxfZXhwcidcbiAgICBdXG4gIHNoZWJhbmc6XG4gICAgbmFtZTogJ2NvbW1lbnQubGluZS5zaGViYW5nLmhhc2tlbGwnXG4gICAgbWF0Y2g6ICdeXFxcXCNcXFxcIS4qXFxcXGJydW5oYXNrZWxsXFxcXGIuKiQnXG4gIGhhc2tlbGxfZXhwcjogW1xuICAgIHsgaW5jbHVkZTogJyNpbmZpeF9mdW5jdGlvbicgfVxuICAgIHsgaW5jbHVkZTogJyN1bml0JyB9XG4gICAgeyBpbmNsdWRlOiAnI2VtcHR5X2xpc3QnIH1cbiAgICB7IGluY2x1ZGU6ICcjcXVhc2lfcXVvdGVzJyB9XG4gICAgeyBpbmNsdWRlOiAnI2tleXdvcmRzJyB9XG4gICAgeyBpbmNsdWRlOiAnI3ByYWdtYScgfVxuICAgIHsgaW5jbHVkZTogJyNzdHJpbmcnIH1cbiAgICB7IGluY2x1ZGU6ICcjbmV3bGluZV9lc2NhcGUnIH1cbiAgICB7IGluY2x1ZGU6ICcjcXVvdGVkX2NoYXJhY3RlcicgfVxuICAgIHsgaW5jbHVkZTogJyNjb21tZW50cycgfVxuICAgIHsgaW5jbHVkZTogJyNpbmZpeF9vcCcgfVxuICAgIHsgaW5jbHVkZTogJyNjb21tYScgfVxuICAgIHsgaW5jbHVkZTogJyNsaXRfbnVtJyB9XG4gICAgeyBpbmNsdWRlOiAnI3Njb3BlZF90eXBlJyB9XG4gICAgeyBpbmNsdWRlOiAnI29wZXJhdG9yJyB9XG4gICAgeyBpbmNsdWRlOiAnI2lkZW50aWZpZXInIH1cbiAgICB7IGluY2x1ZGU6ICcjdHlwZV9jdG9yJyB9XG4gIF1cbiAgaGFza2VsbF90b3BsZXZlbDogW1xuICAgIHsgaW5jbHVkZTogJyNsaXF1aWRoYXNrZWxsX2Fubm90YXRpb24nIH1cbiAgICB7IGluY2x1ZGU6ICcjY2xhc3NfZGVjbCcgfVxuICAgIHsgaW5jbHVkZTogJyNpbnN0YW5jZV9kZWNsJyB9XG4gICAgeyBpbmNsdWRlOiAnI2Rlcml2aW5nX2luc3RhbmNlX2RlY2wnIH1cbiAgICB7IGluY2x1ZGU6ICcjZm9yZWlnbl9pbXBvcnQnIH1cbiAgICB7IGluY2x1ZGU6ICcjcmVndWxhcl9pbXBvcnQnIH1cbiAgICB7IGluY2x1ZGU6ICcjZGF0YV9kZWNsJyB9XG4gICAgeyBpbmNsdWRlOiAnI3R5cGVfYWxpYXMnIH0gIyBUT0RPOiByZXZpZXcgc3RvcHBlZCBoZXJlXG4gICAgeyBpbmNsdWRlOiAnI2NfcHJlcHJvY2Vzc29yJyB9XG4gICAgeyBpbmNsdWRlOiAnI3Njb3BlZF90eXBlX292ZXJyaWRlJyB9XG4gICAgeyBpbmNsdWRlOiAnI2Z1bmN0aW9uX3R5cGVfZGVjbGFyYXRpb24nIH1cbiAgICB7IGluY2x1ZGU6ICcjaGFza2VsbF9leHByJyB9XG4gIF1cbiAgaGFza2VsbF9zb3VyY2U6IFtcbiAgICB7IGluY2x1ZGU6ICcjc2hlYmFuZycgfVxuICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfZGVjbCcgfVxuICAgIHsgaW5jbHVkZTogJyNoYXNrZWxsX3RvcGxldmVsJyB9XG4gIF1cbiJdfQ==
