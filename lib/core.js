let GenerateModel = require('./generateModel');
let RenderFiles = require('./renderFiles');
let CheckConfig = require('./checkConfig');

/*
 * Core
 * We initialize everything here
 * 
 * configuration:
 * - datas 
 * - templates
 * - output
 * - debug
 * - routes
 */

class Core {
    constructor(config) {
        this._config = config || {};
        this._config.datasFolder = this._config.datas || './contents';
        this._config.templatesFolder = this._config.templates || './templates';
        this._config.outputFolder = this._config.output || './site';
        this._config.assetsFolder = this._config.assets || './assets';
        this._config.debug = this._config.debug || false;

        this._config.locales = this._config.locales || [];
        this._routes = this._config.routes || [];

        this._model = {};

        this.init();
    }

    _errored() {
        const checkConfig = new CheckConfig(this._config);
        return checkConfig.errored();
    }

    _generateModel(locale) {
        const generateModel = new GenerateModel(this._config.datasFolder, this._routes, locale);
        this._model = generateModel.getModel();
        return this._model;
    }

    _renderFiles(model, locale) {
        const renderFiles = new RenderFiles(this._config.routes, 
                                      model, 
                                      this._config.templatesFolder, 
                                      this._config.outputFolder, 
                                      locale);
        renderFiles.write();
    }

    init() {
        if(!this._errored()) {

            if(this._config.debug) {
                console.log(JSON.stringify(this._generateModel()));
            }

            if(this._config.locales.length > 0) {
                this._config.locales.forEach(function(locale) {
                    this._renderFiles(this._generateModel(locale), locale);
                }, this);
            } else {
                this._renderFiles(this._generateModel());
            }

            //this._copyAssets();

        } else {
            console.log('fails', this._errored());
        }
    }
}

module.exports = Core;