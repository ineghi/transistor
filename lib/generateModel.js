var fs = require('fs');
var _ = require('lodash');
var ParseMd = require('./parseMd');

/*
 * Model Generator
 * 
 * A class that take a Folder, and gives back an object called Model
 * 
 * The initial fill just recursively loop trought the folder and generate a first Model
 * The routes infos fill look at the routes object and inject information in the Model about 
 * the position 
 */

class GenerateModel {
    constructor(folder, routes, locale) {
        this._folder = folder;
        this._routes = routes;
        this._locale = locale || undefined;
        this._model = {};
    }

    _initialFill(element) {
        var file = fs.statSync(element);

        if(file.isDirectory()){
            var files = fs.readdirSync(element),
                dataObject = {};
            files.forEach((elem) => {
                dataObject[elem.replace(".md", "")] = this._initialFill(element + '/' + elem);
            });
        } else if(file.isFile()){
            try {
                var parseMd = new ParseMd(fs.readFileSync(element, "utf8"));
                return parseMd.getObject();
            }catch (e){
                console.log(e);
            }
        }

        return dataObject;
    }

    _routesInfosFill(model) {
        let _pseudoPath,
            _pseudoModel,
            _pathRegex = /(:([A-z]*))/g,
            _match;

        this._routes.forEach(function(route) {
            _match = _pathRegex.exec(route.path);

            if(route.model) {
                if(route.model.includes('.*')) {
                    _pseudoPath = route.model.replace('.*', '');

                    if(this._locale) {
                        _pseudoPath  = this._locale.name + '.' + _pseudoPath;
                    }

                    _pseudoModel = _.at(model, _pseudoPath)[0];

                    for (var key in _pseudoModel) {
                        if (_pseudoModel.hasOwnProperty(key)) {
                            let _filteredPath;

                            if(_match[0] == ':slug') {
                                _filteredPath = route.path.replace(_match[0], key);
                            } else {
                                _filteredPath = route.path.replace(_match[0], _pseudoModel[key][_match[0].replace(':', '')]);
                            }

                            if(this._locale) {
                                _filteredPath = this._locale.path + _filteredPath;
                            }

                            _pseudoModel[key].getUrl = () => { return _filteredPath };
                        }
                    }
                } else {
                    model[route.model].getUrl = () => { return route.path };
                }
            }
        }, this);

        return model;
    }

    _process() {
        this._model = this._initialFill(this._folder);
        this._model = this._routesInfosFill(this._model);
        return this._model;
    }

    getModel() {
        return this._process();
    }
};

module.exports = GenerateModel;
