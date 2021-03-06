
// Load Modules.
var fs = require('fs-extra');
var path = require('path');
var glob = require('multi-glob').glob;

/**
 * The Module Object.
 */
function om() {}
/**
 * The copy function. The purpose of this module.
 *
 * @param {string} source - The glob input for the source paths.
 * @param {string} destination - The input path for to the destination folder.
 * @param {array} exclude - The glob input for the paths to be excluded.
 * @return {Promise} - Resolve: return nothing. reject: return err.
 */
om.copy = function(source, destination, exclude) {
  om.start=new Date();
  /**
   * Make Paths Task.
   * Convert Glob input to real path arr.
   * Put Each Input array into Obj.
   * Return Obj.
   *
   * @param {string} source - The glob input for the source paths.
   * @param {array} exclude - The glob input for the paths to be excluded.
   * @return {Promise} - resolve: returns Array of paths to be copied. reject: returns err.
   */
  var makePathsTask = function(source, exclude) {
    /**
     * Convert glob input into paths.
     *
     * @param {array|string} input - Glob input.
     * @return {Promise} - resolve: returns array with paths. reject: returns err.
       */
    var makePathsFromGlob = function(input) {
      return new Promise(function(resolve, reject) {
        glob(input, function(err, paths) {
          if (err) reject(err);
          resolve(paths);
        });
      });
    };
    /**
     * Normalize paths
     *
     * @param {array|string} input - raw path/paths.
     * @return {Promise} - resolve: return array of normalized paths.
     */
    var normalizePaths = function(input) {
      return new Promise(function(resolve) {
        var output = [];
        var i = 0;
        if (input.length === 0) {
          resolve(output);
        } else {
          input.forEach(function(curInput) {
            i++;
            output.push(path.normalize(curInput));
            if (i >= input.length) {
              resolve(output);
            }
          });
        }
      });
    };
    /**
     * Filter source arr with exclude array.
     *
     * @param {array} source - all source paths.
     * @param {array} exclude - all paths to be excluded.
     * @return {Array} - returns the filtered paths.
     */
    var filterExcludeFromSource = function(source, exclude) {
      return source.filter(function(val) {
        return exclude.indexOf(val) === -1;
      });
    };
    /**
     * Make Paths Task Constructor
     *
     */
    return new Promise(function(resolve, reject) {
      Promise.all([
        makePathsFromGlob(source),
        makePathsFromGlob(exclude)
      ]).then(function(paths) {
        return Promise.all([
          normalizePaths(paths[0]),
          normalizePaths(paths[1])
        ]).then(function(result) {
          return result;
        });
      }).then(function(paths) {
        resolve(filterExcludeFromSource(paths[0], paths[1]));
      }).catch(function(err) {
        reject(err);
      });
    });
  };
  /**
   * Copy Task.
   * If source file Exist => compare src/dest. Copy if size not the same.
   * If src file not Exist => Make dir and copy.
   *
   * @param {array} srcPaths - the src paths of all files that are to be copied.
   * @param {string} source - the main source input path (glob).
   * @param {string} destination - The input path for to the destination folder.
   * @return {Promise} - resolve: returns nothing. reject: returns err.
   */
  var copyTask = function(srcPaths, source, destination) {
    /**
     * Make Destination Path.
     *
     * @param {string} curSrc - The current source path.
     * @param {string} source - The glob input for the source paths.
     * @param {string} destination - the current destination path.
     * @return {string} - returns the current destination path.
     */
    var makeDestPath = function(curSrc, source, destination) {
      return path.normalize(curSrc.replace(source, destination));
    };
    /**
     * CopyTask Function Constructor
     *
     */
    source = path.dirname(source);
    source = path.normalize(source);
    destination = path.normalize(destination);

    return new Promise(function(resolve) {
      for (var i = 0; i <= srcPaths.length - 1; i++) {
        var curSrc = srcPaths[i];
        var curDest = makeDestPath(curSrc, source, destination);
        if (fs.statSync(curSrc).isFile()) {
          fs.ensureFileSync(curDest);
          if (fs.statSync(curSrc).size !== fs.statSync(curDest).size) {
            fs.copySync(curSrc, curDest, {clobber: true});
            if(i%100===0){
              console.log("[copyTask.promise]start copy the",i/100,"th 100 files.run(ms):",new Date()-om.start);
              console.log("[copyTask.promise]this batch last file is:" + curDest);
            }
          }
        } else {
          fs.ensureDirSync(curDest);
        }
        if (i >= srcPaths.length - 1) {
          var msg=`${i} 个files，Copy done...\n`;
          console.log(msg);
          resolve(msg);
        }
      }
    });
  };
  /**
   * Module Constructor
   */
  return new Promise(function(resolve, reject) {
    makePathsTask(source, exclude)
      .then(function(srcPaths) {
        copyTask(srcPaths, source, destination)
          .then(function(msg) {
            resolve(msg);
          }).catch(function(err) {
            reject(err);
          });
      });
  });
};

om.copyWithConfig=function(configPath="./config.js"){
  if(fs.existsSync(configPath)){
      var config=require(configPath);
      var {source, destination, exclude}=config;
      if(source&&destination){
        console.log("[copyWithConfig]config=",config);
        
        return om.copy(source, destination, exclude);
      }
  }
}
module.exports = om;

