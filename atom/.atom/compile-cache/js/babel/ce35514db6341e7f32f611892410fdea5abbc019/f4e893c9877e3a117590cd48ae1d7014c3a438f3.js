'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var isWin = process.platform === 'win32';
exports.isWin = isWin;
var sleep = function sleep(duration) {
  return isWin ? 'ping 127.0.0.1 -n ' + duration + ' > NUL' : 'sleep ' + duration;
};
exports.sleep = sleep;
var cat = function cat() {
  return isWin ? 'type' : 'cat';
};
exports.cat = cat;
var shellCmd = isWin ? 'cmd /C' : '/bin/sh -c';
exports.shellCmd = shellCmd;
var waitTime = process.env.CI ? 2400 : 200;
exports.waitTime = waitTime;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vwc2UvRXBDb25mRmlsZXMvYXRvbS8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7OztBQUVMLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDOztBQUMzQyxJQUFNLEtBQUssR0FBRyxTQUFSLEtBQUssQ0FBSSxRQUFRO1NBQUssS0FBSywwQkFBd0IsUUFBUSx5QkFBb0IsUUFBUSxBQUFFO0NBQUEsQ0FBQzs7QUFDaEcsSUFBTSxHQUFHLEdBQUcsU0FBTixHQUFHO1NBQVMsS0FBSyxHQUFHLE1BQU0sR0FBRyxLQUFLO0NBQUEsQ0FBQzs7QUFDekMsSUFBTSxRQUFRLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxZQUFZLENBQUM7O0FBQ2pELElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMiLCJmaWxlIjoiL2hvbWUvZXBzZS9FcENvbmZGaWxlcy9hdG9tLy5hdG9tL3BhY2thZ2VzL2J1aWxkL3NwZWMvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgY29uc3QgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuZXhwb3J0IGNvbnN0IHNsZWVwID0gKGR1cmF0aW9uKSA9PiBpc1dpbiA/IGBwaW5nIDEyNy4wLjAuMSAtbiAke2R1cmF0aW9ufSA+IE5VTGAgOiBgc2xlZXAgJHtkdXJhdGlvbn1gO1xuZXhwb3J0IGNvbnN0IGNhdCA9ICgpID0+IGlzV2luID8gJ3R5cGUnIDogJ2NhdCc7XG5leHBvcnQgY29uc3Qgc2hlbGxDbWQgPSBpc1dpbiA/ICdjbWQgL0MnIDogJy9iaW4vc2ggLWMnO1xuZXhwb3J0IGNvbnN0IHdhaXRUaW1lID0gcHJvY2Vzcy5lbnYuQ0kgPyAyNDAwIDogMjAwO1xuIl19