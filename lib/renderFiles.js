let fs = require('fs');
let mkdirp = require('mkdirp');
let _ = require('lodash');
let Engine = require('./engine');
let nunjucks = require('nunjucks');
let Paginate = require('./extensions/paginate');

class RenderFiles {
    constructor(routes, model, templatesFolder, outputFolder, locale) {
        this._routes = routes;
        this._model = model;
        this._templatesFolder = templatesFolder;
        this._locale = locale || undefined;

        if(this._locale && this._locale.path) {
            this._outputFolder = outputFolder + this._locale.path;
        } else {
            this._outputFolder = outputFolder;
        }

        this._engine = {
            transistor: new Engine(this._model, this._locale)
        };
        
        this._env = nunjucks.configure({
            autoescape: false
        });
        this._env.addExtension('paginate', new Paginate(this._templatesFolder, this._outputFolder));
    }

    _renderPage(template, path, model, modelPath) {
        let location = this._outputFolder + path;
        model._template = template;
        model._path = path;
        if(modelPath) {
            model._model = modelPath;
        }

        this._env.render(this._templatesFolder + '/' + template, model, (err, res) => {
            if(err) {
                return console.log(err);
            }

            if (!fs.existsSync(location)){
                mkdirp.sync(location);
            }

            fs.writeFile(location + '/index.html', res, (err) => {
                if(err) throw err;
            });
        });
    }

    routesInterpreter() {
        let _temporaryModel,
            _folderName,
            _pathRegex = /(:([A-z]*))/g,
            _match,
            _pseudoModelPath,
            _pseudoModel,
            _filteredPath;

        this._routes.forEach((route) => {
            _match = _pathRegex.exec(route.path);

            if(route.model) {
                _filteredPath = route.path;
                if(typeof route.model == 'string') {
                    if(route.model.includes('.*')){
                        _pseudoModelPath = route.model.replace('.*', '');
                        if(this._locale) {
                            _pseudoModelPath = this._locale.name + '.' + _pseudoModelPath;
                        }

                        _pseudoModel = _.at(this._model, _pseudoModelPath)[0];

                        for (var key in _pseudoModel) {
                            _temporaryModel = _.merge({}, this._model, _pseudoModel[key]);

                            if(_match[0] == ':slug') {
                                _filteredPath = route.path.replace(_match[0], key);
                            } else {
                                _filteredPath = _filteredPath.replace(_match[0], _temporaryModel[_match[0].replace(':', '')]);
                            }
                            this._renderPage(route.template, _filteredPath, _temporaryModel, route.model);
                        }
                    } else {
                        _temporaryModel = _.merge({}, this._engine, _.at(this._model, this.locale.name + '.' + route.model)[0]);
                        this._renderPage(route.template, _filteredPath, _temporaryModel, route.model);    
                    }
                } else if(typeof route.model == 'object') {
                    _temporaryModel = _.merge({}, this._engine, route.model);
                    this._renderPage(route.template, _filteredPath, _temporaryModel);
                }
            } else {
                _temporaryModel = _.merge({}, this._engine);
                this._renderPage(route.template, route.path, _temporaryModel);
            }
        }, this);
    }

    write() {
        this.routesInterpreter();
    }
}

module.exports = RenderFiles;