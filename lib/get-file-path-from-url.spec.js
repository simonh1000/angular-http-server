const path = require('path');

const getFilePathFromUrl = require('./get-file-path-from-url');

describe('getFilePathFromUrl', () => {
  const VALID_PATHS = [
    // normal inputs
    '/index.html',
    '/beach.js?_=1236363',
    '/static/beach.jpg',
    '/VERSION',
    // common false-positives
    '/./index.html',
    '/a.weird.folder/file.css',
    '/a..weirder..folder/file.js',
    '/.valid/test.zip',
    '/..valid/test.zip',
    '/......a/dots.jpg',
  ];
  const INVALID_PATHS = [
    // directories
    '/',
    '/../',
    '/static/',
    // traversal within base path
    '/../output/index.html',
    '/static/../index.html',
    // traversal out of base path
    '/..',
    '/../static/file.png',
    '/../../../../sys/passwd', // https://hackerone.com/reports/309120
  ];

  function testInvalidBasePaths(pathLib, relativePaths) {
    const input = VALID_PATHS[0];

    it('should throw an error if the basePath is undefined', () => {
      expect(() => getFilePathFromUrl(input, undefined, { pathLib })).to.throw('basePath must be specified');
    });

    context('where basePath is not absolute', () => {
      relativePaths.forEach((basePath) => {
        it(`should throw an error if basePath = ${basePath}`, () => {
          expect(() => getFilePathFromUrl(input, basePath, { pathLib })).to.throw('must be absolute');
        });
      });
    });
  }

  function testValidBasePaths(pathLib, basePaths) {
    basePaths.forEach((basePath) => {
      context(`where basePath = ${basePath}`, () => {
        function createTest(input, expected) {
          it(`should return "${expected}" given input "${input}"`, () => {
            expect(getFilePathFromUrl(input, basePath, { pathLib })).to.equal(expected);
          });
        }

        VALID_PATHS.forEach((testPath) => {
          const expected = pathLib.join(basePath, testPath).split('?')[0];
          createTest(testPath, expected);
        });
        INVALID_PATHS.forEach((testPath) => createTest(testPath, 'dummy'));
      });
    });
  }

  function testWithBaseHref(pathLib, basePath) {
    const baseHref = 'myapp';
    context (`where baseHref = "${baseHref}" and basePath = "${basePath}"`, () => {
      function createTest(input, expected) {
        it(`should return "${expected}" given input "${input}"`, () => {
          expect(getFilePathFromUrl(input, basePath, { pathLib, baseHref})).to.equal(expected)
        });
      }
      function expectPath(input, expected) {
        createTest(input, pathLib.join(basePath, expected).split('?')[0]);
      }
      function expectDummy(input, expected) {
        createTest(input, 'dummy');
      }
      expectPath('/myapp/test.js', 'test.js');
      expectDummy('/test.js');
    });
  }

  context('on a Windows system', () => {
    const pathLib = path.win32;

    testInvalidBasePaths(pathLib, ['dist\\output', '.\\', '.', '.\\serve']);
    testValidBasePaths(pathLib, ['C:\\', 'C:\\project', 'C:\\project\\serve\\output']);
    testWithBaseHref(pathLib, 'C:\\project');
  });

  context('on a POSIX system', () => {
    const pathLib = path.posix;

    testInvalidBasePaths(pathLib, ['dist/output', './', '.', './serve']);
    testValidBasePaths(pathLib, ['/', '/home', '/home/user/project/serve/output']);
    testWithBaseHref(pathLib, '/home/user/project');
  });
});
