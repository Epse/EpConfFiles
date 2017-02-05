module.exports = {
  cmd: 'echo',
  args: [ 'cake' ],
  name: 'from js',
  sh: true,
  functionMatch: function (terminal_output) {
    return [
      {
        file: '.atom-build.js',
        line: '5',
        type: 'Warning',
        message: 'mildly bad things',
      }
    ];
  }
};
