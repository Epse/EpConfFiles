(function() {
  var a, colors, ex, k, toCamelCase, tocamelCase, v;

  colors = {
    alice_blue: '#f0f8ff',
    antique_white: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanched_almond: '#ffebcd',
    blue: '#0000ff',
    blue_violet: '#8a2be2',
    brown: '#a52a2a',
    burly_wood: '#deb887',
    cadet_blue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    corn_silk: '#fff8dc',
    cornflower_blue: '#6495ed',
    crimson: '#dc143c',
    cyan: '#00ffff',
    dark_blue: '#00008b',
    dark_cyan: '#008b8b',
    dark_golden_rod: '#b8860b',
    dark_gray: '#a9a9a9',
    dark_green: '#006400',
    dark_grey: '#a9a9a9',
    dark_khaki: '#bdb76b',
    dark_magenta: '#8b008b',
    dark_olive_green: '#556b2f',
    dark_orange: '#ff8c00',
    dark_orchid: '#9932cc',
    dark_red: '#8b0000',
    dark_salmon: '#e9967a',
    dark_seagreen: '#8fbc8f',
    dark_slateblue: '#483d8b',
    dark_slategray: '#2f4f4f',
    dark_slategrey: '#2f4f4f',
    dark_turquoise: '#00ced1',
    dark_violet: '#9400d3',
    deep_pink: '#ff1493',
    deep_skyblue: '#00bfff',
    dim_gray: '#696969',
    dim_grey: '#696969',
    dodger_blue: '#1e90ff',
    fire_brick: '#b22222',
    floral_white: '#fffaf0',
    forest_green: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghost_white: '#f8f8ff',
    gold: '#ffd700',
    golden_rod: '#daa520',
    gray: '#808080',
    green: '#008000',
    green_yellow: '#adff2f',
    grey: '#808080',
    honey_dew: '#f0fff0',
    hot_pink: '#ff69b4',
    indian_red: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavender_blush: '#fff0f5',
    lawn_green: '#7cfc00',
    lemon_chiffon: '#fffacd',
    light_blue: '#add8e6',
    light_coral: '#f08080',
    light_cyan: '#e0ffff',
    light_golden_rod_yellow: '#fafad2',
    light_gray: '#d3d3d3',
    light_green: '#90ee90',
    light_grey: '#d3d3d3',
    light_pink: '#ffb6c1',
    light_salmon: '#ffa07a',
    light_sea_green: '#20b2aa',
    light_sky_blue: '#87cefa',
    light_slate_gray: '#778899',
    light_slate_grey: '#778899',
    light_steel_blue: '#b0c4de',
    light_yellow: '#ffffe0',
    lime: '#00ff00',
    lime_green: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    medium_aquamarine: '#66cdaa',
    medium_blue: '#0000cd',
    medium_orchid: '#ba55d3',
    medium_purple: '#9370db',
    medium_sea_green: '#3cb371',
    medium_slate_blue: '#7b68ee',
    medium_spring_green: '#00fa9a',
    medium_turquoise: '#48d1cc',
    medium_violet_red: '#c71585',
    midnight_blue: '#191970',
    mint_cream: '#f5fffa',
    misty_rose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajo_white: '#ffdead',
    navy: '#000080',
    old_lace: '#fdf5e6',
    olive: '#808000',
    olive_drab: '#6b8e23',
    orange: '#ffa500',
    orange_red: '#ff4500',
    orchid: '#da70d6',
    pale_golden_rod: '#eee8aa',
    pale_green: '#98fb98',
    pale_turquoise: '#afeeee',
    pale_violet_red: '#db7093',
    papaya_whip: '#ffefd5',
    peach_puff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powder_blue: '#b0e0e6',
    purple: '#800080',
    rebecca_purple: '#663399',
    red: '#ff0000',
    rosy_brown: '#bc8f8f',
    royal_blue: '#4169e1',
    saddle_brown: '#8b4513',
    salmon: '#fa8072',
    sandy_brown: '#f4a460',
    sea_green: '#2e8b57',
    sea_shell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    sky_blue: '#87ceeb',
    slate_blue: '#6a5acd',
    slate_gray: '#708090',
    slate_grey: '#708090',
    snow: '#fffafa',
    spring_green: '#00ff7f',
    steel_blue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    white_smoke: '#f5f5f5',
    yellow: '#ffff00',
    yellow_green: '#9acd32'
  };

  module.exports = ex = {
    lower_snake: colors,
    UPPER_SNAKE: {},
    lowercase: {},
    UPPERCASE: {},
    camelCase: {},
    CamelCase: {},
    allCases: {}
  };

  toCamelCase = function(s) {
    return s[0].toUpperCase() + s.slice(1);
  };

  tocamelCase = function(s, i) {
    if (i === 0) {
      return s;
    } else {
      return s[0].toUpperCase() + s.slice(1);
    }
  };

  for (k in colors) {
    v = colors[k];
    a = k.split('_');
    ex.allCases[k] = ex.allCases[a.map(toCamelCase).join('')] = ex.allCases[a.map(tocamelCase).join('')] = ex.allCases[a.join('_').toUpperCase()] = ex.allCases[a.join('')] = ex.allCases[a.join('').toUpperCase()] = ex.CamelCase[a.map(toCamelCase).join('')] = ex.camelCase[a.map(tocamelCase).join('')] = ex.UPPER_SNAKE[a.join('_').toUpperCase()] = ex.lowercase[a.join('')] = ex.UPPERCASE[a.join('').toUpperCase()] = v;
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvZXBzZS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvc3ZnLWNvbG9ycy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFaO0FBQUEsSUFDQSxhQUFBLEVBQWUsU0FEZjtBQUFBLElBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxJQUdBLFVBQUEsRUFBWSxTQUhaO0FBQUEsSUFJQSxLQUFBLEVBQU8sU0FKUDtBQUFBLElBS0EsS0FBQSxFQUFPLFNBTFA7QUFBQSxJQU1BLE1BQUEsRUFBUSxTQU5SO0FBQUEsSUFPQSxLQUFBLEVBQU8sU0FQUDtBQUFBLElBUUEsZUFBQSxFQUFpQixTQVJqQjtBQUFBLElBU0EsSUFBQSxFQUFNLFNBVE47QUFBQSxJQVVBLFdBQUEsRUFBYSxTQVZiO0FBQUEsSUFXQSxLQUFBLEVBQU8sU0FYUDtBQUFBLElBWUEsVUFBQSxFQUFZLFNBWlo7QUFBQSxJQWFBLFVBQUEsRUFBWSxTQWJaO0FBQUEsSUFjQSxVQUFBLEVBQVksU0FkWjtBQUFBLElBZUEsU0FBQSxFQUFXLFNBZlg7QUFBQSxJQWdCQSxLQUFBLEVBQU8sU0FoQlA7QUFBQSxJQWlCQSxTQUFBLEVBQVcsU0FqQlg7QUFBQSxJQWtCQSxlQUFBLEVBQWlCLFNBbEJqQjtBQUFBLElBbUJBLE9BQUEsRUFBUyxTQW5CVDtBQUFBLElBb0JBLElBQUEsRUFBTSxTQXBCTjtBQUFBLElBcUJBLFNBQUEsRUFBVyxTQXJCWDtBQUFBLElBc0JBLFNBQUEsRUFBVyxTQXRCWDtBQUFBLElBdUJBLGVBQUEsRUFBaUIsU0F2QmpCO0FBQUEsSUF3QkEsU0FBQSxFQUFXLFNBeEJYO0FBQUEsSUF5QkEsVUFBQSxFQUFZLFNBekJaO0FBQUEsSUEwQkEsU0FBQSxF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

//# sourceURL=/home/epse/.atom/packages/pigments/lib/svg-colors.coffee
