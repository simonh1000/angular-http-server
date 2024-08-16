const path = require('path');
const fs = require('fs');

/**
 * Safely get the path for a file in the project directory, or reject by returning "dummy"
 *
 * @param {string} url
 * @param {string} basePath - absolute path to base directory
 * @param {object} [pathLib=path] - path library, override for testing
 * @return {string} - will return 'dummy' if the path is bad
 */
function getFilePathFromUrl(url, basePath, { pathLib = path, baseHref = '' } = {}) {
  if (!basePath) {
    throw new Error('basePath must be specified');
  }
  if (!pathLib.isAbsolute(basePath)) {
    throw new Error(`${basePath} is invalid - must be absolute`);
  }

  // we are not interested in query params
  // TODO also filter out hash routes
  let relativePath = url.split('?')[0];

  if (relativePath.indexOf('../') > -1) {
    // any path attempting to traverse up the directory should be rejected
    return 'dummy';
  }

  if (baseHref) {
    if (relativePath.startsWith('/' + baseHref)) {
      relativePath = relativePath.substr(baseHref.length + 1)
    } else {
      return 'dummy'
    }
  }

  let absolutePath = pathLib.join(basePath, relativePath);
  if ( absolutePath.endsWith(pathLib.sep) ) {
    // By convention, accessing a path routes to a default document in
    // that directory if it exists.
    // Commonly used default documents.
    const defaultDocs = [ "index.html", "index.htm", "index.php" ];
    // See if one of these exists.
    for ( let d of defaultDocs ) {
      if ( fs.existsSync( absolutePath + d ) ) {
        absolutePath += d;
        break;
      }
    }
  }

  if (
    !absolutePath.startsWith(basePath) || // if the path has broken out of the basePath, it should be rejected
    absolutePath.endsWith(pathLib.sep) // only files (not folders) can be served
  ) {
    return 'dummy';
  }

  return absolutePath;
}

module.exports = getFilePathFromUrl;
