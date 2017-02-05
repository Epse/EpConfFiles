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
      applyEndPatternLast: 1,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWhhc2tlbGwvc3JjL2luY2x1ZGUvcmVwb3NpdG9yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1IsV0FBYSxPQUFBLENBQVEsUUFBUjs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsYUFBQSxFQUNFO01BQUEsUUFBQSxFQUFVO1FBQ047VUFBQSxJQUFBLEVBQU0sK0JBQU47VUFDQSxLQUFBLEVBQU8sWUFEUDtVQUVBLEdBQUEsRUFBSyxLQUZMO1VBR0EsbUJBQUEsRUFBcUIsQ0FIckI7VUFJQSxhQUFBLEVBQ0U7WUFBQSxDQUFBLEVBQUc7Y0FBQSxJQUFBLEVBQU0sZ0RBQU47YUFBSDtXQUxGO1VBTUEsV0FBQSxFQUNFO1lBQUEsQ0FBQSxFQUFHO2NBQUEsSUFBQSxFQUFNLGdEQUFOO2FBQUg7V0FQRjtVQVFBLFFBQUEsRUFBVTtZQUNOO2NBQUEsT0FBQSxFQUFTLGdCQUFUO2FBRE07V0FSVjtTQURNLEVBYU47VUFBQSxJQUFBLEVBQU0sdUJBQU47VUFDQSxLQUFBLEVBQU8sS0FEUDtVQUVBLEdBQUEsRUFBSyxLQUZMO1VBR0EsbUJBQUEsRUFBcUIsQ0FIckI7VUFJQSxhQUFBLEVBQ0U7WUFBQSxDQUFBLEVBQUc7Y0FBQSxJQUFBLEVBQU0sb0RBQU47YUFBSDtXQUxGO1VBTUEsV0FBQSxFQUNFO1lBQUEsQ0FBQSxFQUFHO2NBQUEsSUFBQSxFQUFNLGtEQUFOO2FBQUg7V0FQRjtVQVFBLFFBQUEsRUFBVTtZQUNOO2NBQUEsT0FBQSxFQUFTLGdCQUFUO2FBRE07V0FSVjtTQWJNO09BQVY7S0FERjtJQTBCQSxRQUFBLEVBQ0U7TUFBQSxRQUFBLEVBQVU7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OztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsicHJlbHVkZSA9IHJlcXVpcmUgJy4vcHJlbHVkZSdcbnByYWdtYXMgPSByZXF1aXJlICcuL3ByYWdtYXMnXG57IGJhbGFuY2VkIH0gPSByZXF1aXJlICcuL3V0aWwnXG5cbm1vZHVsZS5leHBvcnRzPVxuICBibG9ja19jb21tZW50OlxuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIG5hbWU6ICdjb21tZW50LmJsb2NrLmhhZGRvY2suaGFza2VsbCdcbiAgICAgICAgYmVnaW46IC9cXHstXFxzKlt8Xl0vXG4gICAgICAgIGVuZDogLy1cXH0vXG4gICAgICAgIGFwcGx5RW5kUGF0dGVybkxhc3Q6IDFcbiAgICAgICAgYmVnaW5DYXB0dXJlczpcbiAgICAgICAgICAwOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmhhZGRvY2suaGFza2VsbCdcbiAgICAgICAgZW5kQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5oYWRkb2NrLmhhc2tlbGwnXG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBpbmNsdWRlOiAnI2Jsb2NrX2NvbW1lbnQnXG4gICAgICAgIF1cbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2NvbW1lbnQuYmxvY2suaGFza2VsbCdcbiAgICAgICAgYmVnaW46IC9cXHstL1xuICAgICAgICBlbmQ6IC8tXFx9L1xuICAgICAgICBhcHBseUVuZFBhdHRlcm5MYXN0OiAxXG4gICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5ibG9jay5zdGFydC5oYXNrZWxsJ1xuICAgICAgICBlbmRDYXB0dXJlczpcbiAgICAgICAgICAwOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jb21tZW50LmJsb2NrLmVuZC5oYXNrZWxsJ1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAgaW5jbHVkZTogJyNibG9ja19jb21tZW50J1xuICAgICAgICBdXG4gICAgXVxuICBjb21tZW50czpcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBiZWdpbjogLyh7bWF5YmVCaXJkVHJhY2t9WyBcXHRdKyk/KD89LS0rXFxzK1t8Xl0pL1xuICAgICAgICBlbmQ6IC8oPyFcXEcpL1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAgbmFtZTogJ2NvbW1lbnQubGluZS5kb3VibGUtZGFzaC5oYWRkb2NrLmhhc2tlbGwnXG4gICAgICAgICAgICBiZWdpbjogLygtLSspXFxzKyhbfF5dKS9cbiAgICAgICAgICAgIGVuZDogL1xcbi9cbiAgICAgICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgICAgIDE6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuaGFza2VsbCdcbiAgICAgICAgICAgICAgMjogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uY29tbWVudC5oYWRkb2NrLmhhc2tlbGwnXG4gICAgICAgIF1cbiAgICAgICxcbiAgICAgICAgIyMjXG4gICAgICAgIE9wZXJhdG9ycyBtYXkgYmVnaW4gd2l0aCAtLSBhcyBsb25nIGFzIHRoZXkgYXJlIG5vdFxuICAgICAgICBlbnRpcmVseSBjb21wb3NlZCBvZiAtIGNoYXJhY3RlcnMuIFRoaXMgbWVhbnMgY29tbWVudHMgY2FuJ3QgYmVcbiAgICAgICAgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgYW4gYWxsb3dhYmxlIG9wZXJhdG9yIGNoYXJhY3Rlci5cbiAgICAgICAgIyMjXG4gICAgICAgIGJlZ2luOiAvKHttYXliZUJpcmRUcmFja31bIFxcdF0rKT8oPz0tLSsoPyF7b3BlcmF0b3JDaGFyfSkpL1xuICAgICAgICBlbmQ6IC8oPyFcXEcpL1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAgbmFtZTogJ2NvbW1lbnQubGluZS5kb3VibGUtZGFzaC5oYXNrZWxsJ1xuICAgICAgICAgICAgYmVnaW46IC8tLS9cbiAgICAgICAgICAgIGVuZDogL1xcbi9cbiAgICAgICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgICAgIDA6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmNvbW1lbnQuaGFza2VsbCdcbiAgICAgICAgXVxuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI2Jsb2NrX2NvbW1lbnQnXG4gICAgXVxuICBjaGFyYWN0ZXJzOlxuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHttYXRjaDogJ3tlc2NhcGVDaGFyfScsIG5hbWU6ICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLmhhc2tlbGwnfVxuICAgICAgICB7bWF0Y2g6ICd7b2N0YWxDaGFyfScsIG5hbWU6ICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLm9jdGFsLmhhc2tlbGwnfVxuICAgICAgICB7bWF0Y2g6ICd7aGV4Q2hhcn0nLCBuYW1lOiAnY29uc3RhbnQuY2hhcmFjdGVyLmVzY2FwZS5oZXhhZGVjaW1hbC5oYXNrZWxsJ31cbiAgICAgICAge21hdGNoOiAne2NvbnRyb2xDaGFyfScsIG5hbWU6ICdjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLmNvbnRyb2wuaGFza2VsbCd9XG4gICAgICBdXG4gIGluZml4X29wOlxuICAgIG5hbWU6ICdlbnRpdHkubmFtZS5mdW5jdGlvbi5pbmZpeC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve29wZXJhdG9yRnVufS9cbiAgbW9kdWxlX2V4cG9ydHM6XG4gICAgbmFtZTogJ21ldGEuZGVjbGFyYXRpb24uZXhwb3J0cy5oYXNrZWxsJ1xuICAgIGJlZ2luOiAvXFwoL1xuICAgIGVuZDogL1xcKS9cbiAgICBhcHBseUVuZFBhdHRlcm5MYXN0OiAxXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJyNjb21tZW50cydcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNmdW5jdGlvbl9uYW1lJ1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI3R5cGVfbmFtZSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNjb21tYSdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ21ldGEub3RoZXIuY29uc3RydWN0b3ItbGlzdC5oYXNrZWxsJ1xuICAgICAgICBiZWdpbjogL3tyYn1cXHMqXFwoL1xuICAgICAgICBlbmQ6IC9cXCkvXG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgeyBpbmNsdWRlOiAnI3R5cGVfY3RvcicgfVxuICAgICAgICAgIHsgaW5jbHVkZTogJyNhdHRyaWJ1dGVfbmFtZScgfVxuICAgICAgICAgIHsgaW5jbHVkZTogJyNjb21tYScgfVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1hdGNoOiAvXFwuXFwuL1xuICAgICAgICAgICAgbmFtZTogJ2tleXdvcmQub3BlcmF0b3Iud2lsZGNhcmQuaGFza2VsbCdcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNpbmZpeF9vcCdcbiAgICBdXG4gIG1vZHVsZV9uYW1lOlxuICAgIG5hbWU6ICdzdXBwb3J0Lm90aGVyLm1vZHVsZS5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtjbGFzc05hbWV9e3JifS9cbiAgbW9kdWxlX25hbWVfcHJlZml4OlxuICAgIG5hbWU6ICdzdXBwb3J0Lm90aGVyLm1vZHVsZS5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtjbGFzc05hbWV9XFwuL1xuICBwcmFnbWE6XG4gICAgbmFtZTogJ21ldGEucHJlcHJvY2Vzc29yLmhhc2tlbGwnXG4gICAgYmVnaW46IC9cXHstIy9cbiAgICBlbmQ6IC8jLVxcfS9cbiAgICBwYXR0ZXJuczogW1xuICAgICAgICBtYXRjaDogXCJ7bGJ9KCN7cHJhZ21hcy5qb2luKCd8Jyl9KXtyYn1cIlxuICAgICAgICBuYW1lOiAna2V5d29yZC5vdGhlci5wcmVwcm9jZXNzb3IuaGFza2VsbCdcbiAgICBdXG4gIGZ1bmN0aW9uX3R5cGVfZGVjbGFyYXRpb246XG4gICAgbmFtZTogJ21ldGEuZnVuY3Rpb24udHlwZS1kZWNsYXJhdGlvbi5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9e2Z1bmN0aW9uVHlwZURlY2xhcmF0aW9ufS9cbiAgICBlbmQ6IC97aW5kZW50QmxvY2tFbmR9L1xuICAgIGNvbnRlbnROYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJ1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOlxuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAge2luY2x1ZGU6ICcjZnVuY3Rpb25fbmFtZSd9XG4gICAgICAgICAgICB7aW5jbHVkZTogJyNpbmZpeF9vcCd9XG4gICAgICAgIF1cbiAgICAgIDM6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXG4gICAgXVxuICBjdG9yX3R5cGVfZGVjbGFyYXRpb246XG4gICAgbmFtZTogJ21ldGEuY3Rvci50eXBlLWRlY2xhcmF0aW9uLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH17Y3RvclR5cGVEZWNsYXJhdGlvbn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjpcbiAgICAgICAgcGF0dGVybnM6IFtcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjdHlwZV9jdG9yJ1xuICAgICAgICAgICxcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjaW5maXhfb3AnXG4gICAgICAgIF1cbiAgICAgIDM6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXG4gICAgXVxuICByZWNvcmRfZmllbGRfZGVjbGFyYXRpb246XG4gICAgbmFtZTogJ21ldGEucmVjb3JkLWZpZWxkLnR5cGUtZGVjbGFyYXRpb24uaGFza2VsbCdcbiAgICBiZWdpbjogL3tsYn17ZnVuY3Rpb25UeXBlRGVjbGFyYXRpb259L1xuICAgIGVuZDogLyg/PXtmdW5jdGlvblR5cGVEZWNsYXJhdGlvbn18fSkvXG4gICAgY29udGVudE5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDE6XG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAgICBpbmNsdWRlOiAnI2F0dHJpYnV0ZV9uYW1lJ1xuICAgICAgICAgICxcbiAgICAgICAgICAgIGluY2x1ZGU6ICcjaW5maXhfb3AnXG4gICAgICAgIF1cbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmRvdWJsZS1jb2xvbi5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXG4gICAgXVxuICB0eXBlX3NpZ25hdHVyZTpcbiAgICBwYXR0ZXJuczogW1xuICAgICAgI1RPRE86IFR5cGUgb3BlcmF0b3JzLCB0eXBlLWxldmVsIGludGVnZXJzIGV0Y1xuICAgICAgICBpbmNsdWRlOiAnI3ByYWdtYSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNjb21tZW50cydcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2tleXdvcmQub3RoZXIuZm9yYWxsLmhhc2tlbGwnXG4gICAgICAgIG1hdGNoOiAne2xifWZvcmFsbHtyYn0nXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjdW5pdCdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNlbXB0eV9saXN0J1xuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI3N0cmluZydcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2tleXdvcmQub3RoZXIuYXJyb3cuaGFza2VsbCdcbiAgICAgICAgbWF0Y2g6ICcoPzwhe29wZXJhdG9yQ2hhcn0pKC0+fOKGkikoPyF7b3BlcmF0b3JDaGFyfSknXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmJpZy1hcnJvdy5oYXNrZWxsJ1xuICAgICAgICBtYXRjaDogJyg/PCF7b3BlcmF0b3JDaGFyfSkoPT584oeSKSg/IXtvcGVyYXRvckNoYXJ9KSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNvcGVyYXRvcidcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ3ZhcmlhYmxlLm90aGVyLmdlbmVyaWMtdHlwZS5oYXNrZWxsJ1xuICAgICAgICBtYXRjaDogL3tsYn17ZnVuY3Rpb25OYW1lfXtyYn0vXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV9uYW1lJ1xuICAgIF1cbiAgdW5pdDpcbiAgICBuYW1lOiAnY29uc3RhbnQubGFuZ3VhZ2UudW5pdC5oYXNrZWxsJ1xuICAgIG1hdGNoOiAvXFwoXFwpL1xuICBlbXB0eV9saXN0OlxuICAgIG5hbWU6ICdjb25zdGFudC5sYW5ndWFnZS5lbXB0eS1saXN0Lmhhc2tlbGwnXG4gICAgbWF0Y2g6IC9cXFtcXF0vXG4gIGRlcml2aW5nOlxuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHtpbmNsdWRlOiAnI2Rlcml2aW5nX2xpc3QnfVxuICAgICAgICB7aW5jbHVkZTogJyNkZXJpdmluZ19zaW1wbGUnfVxuICAgICAgICB7aW5jbHVkZTogJyNkZXJpdmluZ19rZXl3b3JkJ31cbiAgICBdXG4gIGRlcml2aW5nX2tleXdvcmQ6XG4gICAgbmFtZTogJ21ldGEuZGVyaXZpbmcuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn0oZGVyaXZpbmcpe3JifS9cbiAgICBjYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gIGRlcml2aW5nX2xpc3Q6XG4gICAgbmFtZTogJ21ldGEuZGVyaXZpbmcuaGFza2VsbCdcbiAgICBiZWdpbjogL3tsYn0oZGVyaXZpbmcpXFxzKlxcKC9cbiAgICBlbmQ6IC9cXCkvXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgbWF0Y2g6IC97bGJ9KHtjbGFzc05hbWV9KXtyYn0vXG4gICAgICAgIGNhcHR1cmVzOlxuICAgICAgICAgIDE6IG5hbWU6ICdlbnRpdHkub3RoZXIuaW5oZXJpdGVkLWNsYXNzLmhhc2tlbGwnXG4gICAgXVxuICBkZXJpdmluZ19zaW1wbGU6XG4gICAgbmFtZTogJ21ldGEuZGVyaXZpbmcuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn0oZGVyaXZpbmcpXFxzKih7Y2xhc3NOYW1lfSl7cmJ9L1xuICAgIGNhcHR1cmVzOlxuICAgICAgMTogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICAgIDI6IG5hbWU6ICdlbnRpdHkub3RoZXIuaW5oZXJpdGVkLWNsYXNzLmhhc2tlbGwnXG4gIGluZml4X2Z1bmN0aW9uOlxuICAgIG5hbWU6ICdrZXl3b3JkLm9wZXJhdG9yLmZ1bmN0aW9uLmluZml4Lmhhc2tlbGwnXG4gICAgbWF0Y2g6IC8oYCl7ZnVuY3Rpb25OYW1lfShgKS9cbiAgICBjYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmVudGl0eS5oYXNrZWxsJ1xuICAgICAgMjogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uZW50aXR5Lmhhc2tlbGwnXG4gIHF1YXNpX3F1b3RlczpcbiAgICBiZWdpbjogLyhcXFspKHtmdW5jdGlvbk5hbWVPbmV9KShcXHwpL1xuICAgIGVuZDogLyhcXHwpKFxcXSkvXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnF1YXNpcXVvdGVzLmJlZ2luLmhhc2tlbGwnXG4gICAgICAyOiBuYW1lOiAnZW50aXR5Lm5hbWUudGFnLmhhc2tlbGwnXG4gICAgZW5kQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5xdWFzaXF1b3Rlcy5lbmQuaGFza2VsbCdcbiAgICBjb250ZW50TmFtZTogJ3N0cmluZy5xdW90ZWQucXVhc2lxdW90ZXMuaGFza2VsbCdcbiAgbW9kdWxlX2RlY2w6XG4gICAgbmFtZTogJ21ldGEuZGVjbGFyYXRpb24ubW9kdWxlLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0obW9kdWxlKXtyYn0vXG4gICAgZW5kOiAve2xifSh3aGVyZSl7cmJ9fHtpbmRlbnRCbG9ja0VuZH0vXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgZW5kQ2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIHtpbmNsdWRlOiAnI2NvbW1lbnRzJ31cbiAgICAgICAge2luY2x1ZGU6ICcjbW9kdWxlX25hbWUnfVxuICAgICAgICB7aW5jbHVkZTogJyNtb2R1bGVfZXhwb3J0cyd9XG4gICAgICAgIHtpbmNsdWRlOiAnI2ludmFsaWQnfVxuICAgIF1cbiAgY2xhc3NfZGVjbDpcbiAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi5jbGFzcy5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KGNsYXNzKXtyYn0vXG4gICAgZW5kOiAve2xifSh3aGVyZSl7cmJ9fHtpbmRlbnRCbG9ja0VuZH0vXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmNsYXNzLmhhc2tlbGwnXG4gICAgZW5kQ2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXG4gICAgXVxuICBpbnN0YW5jZV9kZWNsOlxuICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLmluc3RhbmNlLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oaW5zdGFuY2Upe3JifS9cbiAgICBlbmQ6IC97bGJ9KHdoZXJlKXtyYn18e2luZGVudEJsb2NrRW5kfS9cbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBlbmRDYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAge2luY2x1ZGU6ICcjcHJhZ21hJ31cbiAgICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgIF1cbiAgZGVyaXZpbmdfaW5zdGFuY2VfZGVjbDpcbiAgICBuYW1lOiAnbWV0YS5kZWNsYXJhdGlvbi5pbnN0YW5jZS5kZXJpdmluZy5oYXNrZWxsJ1xuICAgIGJlZ2luOiAve2luZGVudEJsb2NrU3RhcnR9KGRlcml2aW5nXFxzK2luc3RhbmNlKXtyYn0vXG4gICAgZW5kOiAve2luZGVudEJsb2NrRW5kfS9cbiAgICBjb250ZW50TmFtZTogJ21ldGEudHlwZS1zaWduYXR1cmUuaGFza2VsbCdcbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMjogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICB7aW5jbHVkZTogJyNwcmFnbWEnfVxuICAgICAgICB7aW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSd9XG4gICAgXVxuICBmb3JlaWduX2ltcG9ydDpcbiAgICBuYW1lOiAnbWV0YS5mb3JlaWduLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oZm9yZWlnbilcXHMrKGltcG9ydHxleHBvcnQpe3JifS9cbiAgICBlbmQ6IC97aW5kZW50QmxvY2tFbmR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgICAgMzogbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgICBwYXR0ZXJuczpbXG4gICAgICAgIG1hdGNoOiAvKD86dW4pP3NhZmUvXG4gICAgICAgIGNhcHR1cmVzOlxuICAgICAgICAgIDA6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjZnVuY3Rpb25fdHlwZV9kZWNsYXJhdGlvbidcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNoYXNrZWxsX2V4cHInXG4gICAgXVxuICByZWd1bGFyX2ltcG9ydDpcbiAgICBuYW1lOiAnbWV0YS5pbXBvcnQuaGFza2VsbCdcbiAgICBiZWdpbjogL3tpbmRlbnRCbG9ja1N0YXJ0fShpbXBvcnQpe3JifS9cbiAgICBlbmQ6IC97aW5kZW50QmxvY2tFbmR9L1xuICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAyOiBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjbW9kdWxlX25hbWUnXG4gICAgICAsXG4gICAgICAgIGluY2x1ZGU6ICcjbW9kdWxlX2V4cG9ydHMnXG4gICAgICAsXG4gICAgICAgIG1hdGNoOiAve2xifShxdWFsaWZpZWR8YXN8aGlkaW5nKXtyYn0vXG4gICAgICAgIGNhcHR1cmVzOlxuICAgICAgICAgIDE6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgXVxuICBkYXRhX2RlY2w6XG4gICAgbmFtZTogJ21ldGEuZGVjbGFyYXRpb24udHlwZS5kYXRhLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0oZGF0YXxuZXd0eXBlKVxccysoKD86KD8hPXx3aGVyZSkuKSopL1xuICAgIGVuZDogL3tpbmRlbnRCbG9ja0VuZH0vXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLmRhdGEuaGFza2VsbCdcbiAgICAgIDM6XG4gICAgICAgIG5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgICAgIHBhdHRlcm5zOiBbXG4gICAgICAgICAge2luY2x1ZGU6ICcjZmFtaWx5X2FuZF9pbnN0YW5jZSd9XG4gICAgICAgICAge2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnfVxuICAgICAgICBdXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJyNjb21tZW50cydcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyN3aGVyZSdcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNkZXJpdmluZydcbiAgICAgICxcbiAgICAgICAgaW5jbHVkZTogJyNhc3NpZ25tZW50X29wJ1xuICAgICAgLFxuICAgICAgICBtYXRjaDogL3tjdG9yfS9cbiAgICAgICAgY2FwdHVyZXM6XG4gICAgICAgICAgMTogcGF0dGVybnM6IFtpbmNsdWRlOiAnI3R5cGVfY3RvciddXG4gICAgICAgICAgMjpcbiAgICAgICAgICAgIG5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgICAgICAgICBwYXR0ZXJuczogW2luY2x1ZGU6ICcjdHlwZV9zaWduYXR1cmUnXVxuICAgICAgLFxuICAgICAgICBtYXRjaDogL1xcfC9cbiAgICAgICAgY2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLnNlcGFyYXRvci5waXBlLmhhc2tlbGwnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdtZXRhLmRlY2xhcmF0aW9uLnR5cGUuZGF0YS5yZWNvcmQuYmxvY2suaGFza2VsbCdcbiAgICAgICAgYmVnaW46IC9cXHsvXG4gICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ2tleXdvcmQub3BlcmF0b3IucmVjb3JkLmJlZ2luLmhhc2tlbGwnXG4gICAgICAgIGVuZDogL1xcfS9cbiAgICAgICAgZW5kQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ2tleXdvcmQub3BlcmF0b3IucmVjb3JkLmVuZC5oYXNrZWxsJ1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAge2luY2x1ZGU6ICcjY29tbWVudHMnfVxuICAgICAgICAgICAge2luY2x1ZGU6ICcjY29tbWEnfVxuICAgICAgICAgICAge2luY2x1ZGU6ICcjcmVjb3JkX2ZpZWxkX2RlY2xhcmF0aW9uJ31cbiAgICAgICAgXVxuICAgICAgLFxuICAgICAgICBpbmNsdWRlOiAnI2N0b3JfdHlwZV9kZWNsYXJhdGlvbicgI0dBRFRcbiAgICBdXG4gIHR5cGVfYWxpYXM6XG4gICAgbmFtZTogJ21ldGEuZGVjbGFyYXRpb24udHlwZS50eXBlLmhhc2tlbGwnXG4gICAgYmVnaW46IC97aW5kZW50QmxvY2tTdGFydH0odHlwZSl7cmJ9L1xuICAgIGVuZDogL3tpbmRlbnRCbG9ja0VuZH0vXG4gICAgY29udGVudE5hbWU6ICdtZXRhLnR5cGUtc2lnbmF0dXJlLmhhc2tlbGwnXG4gICAgYmVnaW5DYXB0dXJlczpcbiAgICAgIDI6IG5hbWU6ICdrZXl3b3JkLm90aGVyLnR5cGUuaGFza2VsbCdcbiAgICBwYXR0ZXJuczogW1xuICAgICAgICB7aW5jbHVkZTogJyNjb21tZW50cyd9XG4gICAgICAgIHtpbmNsdWRlOiAnI2ZhbWlseV9hbmRfaW5zdGFuY2UnfVxuICAgICAgICB7aW5jbHVkZTogJyN3aGVyZSd9XG4gICAgICAgIHtpbmNsdWRlOiAnI2Fzc2lnbm1lbnRfb3AnfVxuICAgICAgICB7aW5jbHVkZTogJyN0eXBlX3NpZ25hdHVyZSd9XG4gICAgXVxuICBrZXl3b3JkczogW1xuICAgIG5hbWU6ICdrZXl3b3JkLm90aGVyLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9KGRlcml2aW5nfHdoZXJlfGRhdGF8dHlwZXxuZXd0eXBlKXtyYn0vXG4gICxcbiAgICBuYW1lOiAna2V5d29yZC5vdGhlci5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifShkYXRhfHR5cGV8bmV3dHlwZSl7cmJ9L1xuICAsXG4gICAgbmFtZTogJ2tleXdvcmQub3BlcmF0b3IuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn1pbmZpeFtscl0/e3JifS9cbiAgLFxuICAgIG5hbWU6ICdrZXl3b3JkLmNvbnRyb2wuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn0oZG98aWZ8dGhlbnxlbHNlfGNhc2V8b2Z8bGV0fGlufGRlZmF1bHQpe3JifS9cbiAgXVxuICBjX3ByZXByb2Nlc3NvcjpcbiAgICBuYW1lOiAnbWV0YS5wcmVwcm9jZXNzb3IuYydcbiAgICBiZWdpbjogL3ttYXliZUJpcmRUcmFja30oPz0jKS9cbiAgICBlbmQ6ICcoPzwhXFxcXFxcXFwpKD89XFxcXG4pJ1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICBpbmNsdWRlOiAnc291cmNlLmMnXG4gICAgXVxuICBzdHJpbmc6XG4gICAgbmFtZTogJ3N0cmluZy5xdW90ZWQuZG91YmxlLmhhc2tlbGwnXG4gICAgYmVnaW46IC9cIi9cbiAgICBlbmQ6IC9cIi9cbiAgICBiZWdpbkNhcHR1cmVzOlxuICAgICAgMDogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmJlZ2luLmhhc2tlbGwnXG4gICAgZW5kQ2FwdHVyZXM6XG4gICAgICAwOiBuYW1lOiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLmhhc2tlbGwnXG4gICAgcGF0dGVybnM6IFtcbiAgICAgICAgaW5jbHVkZTogJyNjaGFyYWN0ZXJzJ1xuICAgICAgLFxuICAgICAgICBiZWdpbjogL1xcXFxcXHMvXG4gICAgICAgIGVuZDogL1xcXFwvXG4gICAgICAgIGJlZ2luQ2FwdHVyZXM6XG4gICAgICAgICAgMDogbmFtZTogJ21hcmt1cC5vdGhlci5lc2NhcGUubmV3bGluZS5iZWdpbi5oYXNrZWxsJ1xuICAgICAgICBlbmRDYXB0dXJlczpcbiAgICAgICAgICAwOiBuYW1lOiAnbWFya3VwLm90aGVyLmVzY2FwZS5uZXdsaW5lLmVuZC5oYXNrZWxsJ1xuICAgICAgICBwYXR0ZXJuczogW1xuICAgICAgICAgICAge2luY2x1ZGU6ICcjaW52YWxpZCd9XG4gICAgICAgIF1cbiAgICBdXG4gIG5ld2xpbmVfZXNjYXBlOlxuICAgIG5hbWU6ICdtYXJrdXAub3RoZXIuZXNjYXBlLm5ld2xpbmUuaGFza2VsbCdcbiAgICBtYXRjaDogL1xcXFwkL1xuICBxdW90ZWRfY2hhcmFjdGVyOlxuICAgIG5hbWU6ICdzdHJpbmcucXVvdGVkLnNpbmdsZS5oYXNrZWxsJ1xuICAgIG1hdGNoOiAvKCcpKHtjaGFyYWN0ZXJ9KSgnKS9cbiAgICBjYXB0dXJlczpcbiAgICAgIDE6IG5hbWU6ICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi5oYXNrZWxsJ1xuICAgICAgMjpcbiAgICAgICAgcGF0dGVybnM6W1xuICAgICAgICAgIGluY2x1ZGU6ICcjY2hhcmFjdGVycydcbiAgICAgICAgXVxuICAgICAgMzogbmFtZTogJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5oYXNrZWxsJ1xuICBzY29wZWRfdHlwZTogW1xuICAgIG1hdGNoOiBcIlxcXFwoKCN7YmFsYW5jZWQgJ3BhcmVuJywgJ1xcXFwoJywgJ1xcXFwpJ317ZG91YmxlQ29sb25PcGVyYXRvcn0je2JhbGFuY2VkICdwYXJlbjInLCAnXFxcXCgnLCAnXFxcXCknfSlcXFxcKVwiXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBwYXR0ZXJuczogW1xuICAgICAgICBpbmNsdWRlOiAnI2hhc2tlbGxfZXhwcidcbiAgICAgIF1cbiAgLFxuICAgIG1hdGNoOiAnKHtkb3VibGVDb2xvbk9wZXJhdG9yfSkoLio/KSg/PSg/PCF7b3BlcmF0b3JDaGFyfSkoPC18PSkoPyF7b3BlcmF0b3JDaGFyfSl8JCknXG4gICAgY2FwdHVyZXM6XG4gICAgICAxOiBuYW1lOiAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICAgIDI6IHtuYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgcGF0dGVybnM6IFtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ119XG4gIF1cbiAgc2NvcGVkX3R5cGVfb3ZlcnJpZGU6XG4gICAgbWF0Y2g6ICd7aW5kZW50QmxvY2tTdGFydH17ZnVuY3Rpb25UeXBlRGVjbGFyYXRpb259KC4qKSg/PCF7b3BlcmF0b3JDaGFyfSkoPC18PSkoPyF7b3BlcmF0b3JDaGFyfSknXG4gICAgY2FwdHVyZXM6XG4gICAgICAyOiBwYXR0ZXJuczogW2luY2x1ZGU6ICcjaWRlbnRpZmllciddXG4gICAgICAzOiBuYW1lOiAna2V5d29yZC5vdGhlci5kb3VibGUtY29sb24uaGFza2VsbCdcbiAgICAgIDQ6IHtuYW1lOiAnbWV0YS50eXBlLXNpZ25hdHVyZS5oYXNrZWxsJywgcGF0dGVybnM6IFtpbmNsdWRlOiAnI3R5cGVfc2lnbmF0dXJlJ119XG4gICAgICA1OiBwYXR0ZXJuczogW1xuICAgICAgICAgIHtpbmNsdWRlOiAnI2Fzc2lnbm1lbnRfb3AnfVxuICAgICAgICAgIHtpbmNsdWRlOiAnI29wZXJhdG9yJ31cbiAgICAgIF1cbiAgY29tbWE6XG4gICAgbmFtZTogJ3B1bmN0dWF0aW9uLnNlcGFyYXRvci5jb21tYS5oYXNrZWxsJ1xuICAgIG1hdGNoOiAvLC9cbiAgbGl0X251bTogW1xuICAgIG5hbWU6ICdjb25zdGFudC5udW1lcmljLmhleGFkZWNpbWFsLmhhc2tlbGwnXG4gICAgbWF0Y2g6ICcwW3hYXVswLTlhLWZBLUZdKydcbiAgLFxuICAgIG5hbWU6ICdjb25zdGFudC5udW1lcmljLm9jdGFsLmhhc2tlbGwnXG4gICAgbWF0Y2g6ICcwW29PXVswLTddKydcbiAgLFxuICAgIG5hbWU6ICdjb25zdGFudC5udW1lcmljLmZsb2F0Lmhhc2tlbGwnXG4gICAgbWF0Y2g6ICdbMC05XSsoXFxcXC5bMC05XStbZUVdWystXT98XFxcXC58W2VFXVsrLV0/KVswLTldKydcbiAgLFxuICAgIG5hbWU6ICdjb25zdGFudC5udW1lcmljLmRlY2ltYWwuaGFza2VsbCdcbiAgICBtYXRjaDogJ1swLTldKydcbiAgXVxuICBvcGVyYXRvcjpcbiAgICBuYW1lOiAna2V5d29yZC5vcGVyYXRvci5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve29wZXJhdG9yfS9cbiAgaWRlbnRpZmllcjpcbiAgICBtYXRjaDogJ3tsYn17ZnVuY3Rpb25OYW1lfXtyYn0nXG4gICAgbmFtZTogJ2lkZW50aWZpZXIuaGFza2VsbCdcbiAgICBjYXB0dXJlczogMDogcGF0dGVybnM6IFtcbiAgICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3N1cHBvcnQuZnVuY3Rpb24ucHJlbHVkZS5oYXNrZWxsJ1xuICAgICAgICBtYXRjaDogXCJ7bGJ9KCN7cHJlbHVkZS5mdW5jdC5qb2luKCd8Jyl9KXtyYn1cIlxuICAgICAgfVxuICAgIF1cbiAgdHlwZV9uYW1lOlxuICAgIG5hbWU6ICdlbnRpdHkubmFtZS50eXBlLmhhc2tlbGwnXG4gICAgbWF0Y2g6IC97bGJ9e2NsYXNzTmFtZX17cmJ9L1xuICAgIGNhcHR1cmVzOiAwOiBwYXR0ZXJuczogW1xuICAgICAgeyBpbmNsdWRlOiAnI21vZHVsZV9uYW1lX3ByZWZpeCcgfVxuICAgICAge1xuICAgICAgICAgIG5hbWU6ICdlbnRpdHkub3RoZXIuaW5oZXJpdGVkLWNsYXNzLnByZWx1ZGUuaGFza2VsbCdcbiAgICAgICAgICBtYXRjaDogXCJ7bGJ9KCN7cHJlbHVkZS5jbGFzc2VzLmpvaW4oJ3wnKX0pe3JifVwiXG4gICAgICB9XG4gICAgICB7XG4gICAgICAgICAgbmFtZTogJ3N1cHBvcnQuY2xhc3MucHJlbHVkZS5oYXNrZWxsJ1xuICAgICAgICAgIG1hdGNoOiBcIntsYn0oI3twcmVsdWRlLnR5cGVzLmpvaW4oJ3wnKX0pe3JifVwiXG4gICAgICB9XG4gICAgXVxuICB0eXBlX2N0b3I6XG4gICAgbmFtZTogJ2VudGl0eS5uYW1lLnRhZy5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtjbGFzc05hbWV9e3JifS9cbiAgICBjYXB0dXJlczogMDogcGF0dGVybnM6IFtcbiAgICAgIHsgaW5jbHVkZTogJyNtb2R1bGVfbmFtZV9wcmVmaXgnIH1cbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3N1cHBvcnQudGFnLnByZWx1ZGUuaGFza2VsbCdcbiAgICAgICAgbWF0Y2g6IFwie2xifSgje3ByZWx1ZGUuY29uc3RyLmpvaW4oJ3wnKX0pe3JifVwiXG4gICAgICB9XG4gICAgXVxuICB3aGVyZTpcbiAgICBtYXRjaDogJ3tsYn13aGVyZXtyYn0nXG4gICAgbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgZmFtaWx5X2FuZF9pbnN0YW5jZTpcbiAgICBtYXRjaDogJ3tsYn0oZmFtaWx5fGluc3RhbmNlKXtyYn0nXG4gICAgbmFtZTogJ2tleXdvcmQub3RoZXIuaGFza2VsbCdcbiAgaW52YWxpZDpcbiAgICBtYXRjaDogL1xcUysvXG4gICAgbmFtZTogJ2ludmFsaWQuaWxsZWdhbC5jaGFyYWN0ZXItbm90LWFsbG93ZWQtaGVyZS5oYXNrZWxsJ1xuICBmdW5jdGlvbl9uYW1lOlxuICAgIG5hbWU6ICdlbnRpdHkubmFtZS5mdW5jdGlvbi5oYXNrZWxsJ1xuICAgIG1hdGNoOiAve2xifXtmdW5jdGlvbk5hbWV9e3JifS9cbiAgYXNzaWdubWVudF9vcDpcbiAgICBtYXRjaDogLz0vXG4gICAgY2FwdHVyZXM6XG4gICAgICAwOiBuYW1lOiAna2V5d29yZC5vcGVyYXRvci5hc3NpZ25tZW50Lmhhc2tlbGwnXG4gIGF0dHJpYnV0ZV9uYW1lOlxuICAgIG5hbWU6ICdlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuaGFza2VsbCdcbiAgICBtYXRjaDogL3tsYn17ZnVuY3Rpb25OYW1lfXtyYn0vXG4gIGxpcXVpZGhhc2tlbGxfYW5ub3RhdGlvbjpcbiAgICBuYW1lOiAnYmxvY2subGlxdWlkaGFza2VsbCdcbiAgICBjb250ZW50TmFtZTogJ2Jsb2NrLmxpcXVpZGhhc2tlbGwuYW5ub3RhdGlvbidcbiAgICBiZWdpbjogJ1xcXFx7LUAoPyEjKSdcbiAgICBlbmQ6ICdALVxcXFx9J1xuICAgIHBhdHRlcm5zOiBbXG4gICAgICAgIGluY2x1ZGU6ICcjaGFza2VsbF9leHByJ1xuICAgIF1cbiAgc2hlYmFuZzpcbiAgICBuYW1lOiAnY29tbWVudC5saW5lLnNoZWJhbmcuaGFza2VsbCdcbiAgICBtYXRjaDogJ15cXFxcI1xcXFwhLipcXFxcYnJ1bmhhc2tlbGxcXFxcYi4qJCdcbiAgaGFza2VsbF9leHByOiBbXG4gICAgeyBpbmNsdWRlOiAnI2luZml4X2Z1bmN0aW9uJyB9XG4gICAgeyBpbmNsdWRlOiAnI3VuaXQnIH1cbiAgICB7IGluY2x1ZGU6ICcjZW1wdHlfbGlzdCcgfVxuICAgIHsgaW5jbHVkZTogJyNxdWFzaV9xdW90ZXMnIH1cbiAgICB7IGluY2x1ZGU6ICcja2V5d29yZHMnIH1cbiAgICB7IGluY2x1ZGU6ICcjcHJhZ21hJyB9XG4gICAgeyBpbmNsdWRlOiAnI3N0cmluZycgfVxuICAgIHsgaW5jbHVkZTogJyNuZXdsaW5lX2VzY2FwZScgfVxuICAgIHsgaW5jbHVkZTogJyNxdW90ZWRfY2hhcmFjdGVyJyB9XG4gICAgeyBpbmNsdWRlOiAnI2NvbW1lbnRzJyB9XG4gICAgeyBpbmNsdWRlOiAnI2luZml4X29wJyB9XG4gICAgeyBpbmNsdWRlOiAnI2NvbW1hJyB9XG4gICAgeyBpbmNsdWRlOiAnI2xpdF9udW0nIH1cbiAgICB7IGluY2x1ZGU6ICcjc2NvcGVkX3R5cGUnIH1cbiAgICB7IGluY2x1ZGU6ICcjb3BlcmF0b3InIH1cbiAgICB7IGluY2x1ZGU6ICcjaWRlbnRpZmllcicgfVxuICAgIHsgaW5jbHVkZTogJyN0eXBlX2N0b3InIH1cbiAgXVxuICBoYXNrZWxsX3RvcGxldmVsOiBbXG4gICAgeyBpbmNsdWRlOiAnI2xpcXVpZGhhc2tlbGxfYW5ub3RhdGlvbicgfVxuICAgIHsgaW5jbHVkZTogJyNjbGFzc19kZWNsJyB9XG4gICAgeyBpbmNsdWRlOiAnI2luc3RhbmNlX2RlY2wnIH1cbiAgICB7IGluY2x1ZGU6ICcjZGVyaXZpbmdfaW5zdGFuY2VfZGVjbCcgfVxuICAgIHsgaW5jbHVkZTogJyNmb3JlaWduX2ltcG9ydCcgfVxuICAgIHsgaW5jbHVkZTogJyNyZWd1bGFyX2ltcG9ydCcgfVxuICAgIHsgaW5jbHVkZTogJyNkYXRhX2RlY2wnIH1cbiAgICB7IGluY2x1ZGU6ICcjdHlwZV9hbGlhcycgfSAjIFRPRE86IHJldmlldyBzdG9wcGVkIGhlcmVcbiAgICB7IGluY2x1ZGU6ICcjY19wcmVwcm9jZXNzb3InIH1cbiAgICB7IGluY2x1ZGU6ICcjc2NvcGVkX3R5cGVfb3ZlcnJpZGUnIH1cbiAgICB7IGluY2x1ZGU6ICcjZnVuY3Rpb25fdHlwZV9kZWNsYXJhdGlvbicgfVxuICAgIHsgaW5jbHVkZTogJyNoYXNrZWxsX2V4cHInIH1cbiAgXVxuICBoYXNrZWxsX3NvdXJjZTogW1xuICAgIHsgaW5jbHVkZTogJyNzaGViYW5nJyB9XG4gICAgeyBpbmNsdWRlOiAnI21vZHVsZV9kZWNsJyB9XG4gICAgeyBpbmNsdWRlOiAnI2hhc2tlbGxfdG9wbGV2ZWwnIH1cbiAgXVxuIl19
