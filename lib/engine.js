var _ = require('lodash');
var _model = Symbol();
var _modelSearch = Symbol();
var _limit = Symbol();
var _locale = Symbol();

class Engine {
    constructor(model, locale) {
        this[_model] = model;
        this[_locale] = locale;
    }

    model(modelSearch) {
        let _temp = new Engine(this[_model]);
        _temp[_modelSearch] = _.at(this[_model], [modelSearch])[0];

        // if the current model search gives nothing, check in a locale version
        if(!_temp[_modelSearch]) {
            _temp[_modelSearch] = _.at(this[_model], [this[_locale].name + '.' + modelSearch])[0];
        }

        if(typeof _temp[_modelSearch] == 'string') {
            let _string = new String(_temp[_modelSearch]);
            Object.getOwnPropertyNames(Engine.prototype).forEach(function(element) {
                _string[element] = _temp[element];
            }, this);
            return _.assign(_string, _temp);
        } else {
            return _.assign(_temp, _temp[_modelSearch]);
        }
    }

    limit(int) {
        let _temp = new Engine(this[_model]);
        let i = 0;
        _temp[_modelSearch] = {};

        _.forOwn(this[_modelSearch], function(value, key) {
            if(i < int) {
                _temp[_modelSearch][key] = value;
                i++;
            } else {
                return false;
            }
         });

        return _.extend(_temp, _temp[_modelSearch]);
    }

    range(range) {
        let _temp = new Engine(this[_model]);
        let _i = 1;
        let _modelSearchIndex = 1;
        let _range = range;
        _temp[_modelSearch] = {};

        for (var key in this[_modelSearch]) {
            if (this[_modelSearch].hasOwnProperty(key)) {
                let element = this[_modelSearch][key];
                _.set(_temp[_modelSearch], [_modelSearchIndex, key], element);
                _i++;
                if(_i > _range) {
                    _i = 1;
                    _modelSearchIndex ++;
                }
            }
        }

        return _.extend(_temp, _temp[_modelSearch]);
    }

    escape(string = false) {
        let _temp = new Engine(this[_model]);

        if(string) {
            
        }

        let _string = new String((string ? string : this))
            
        Object.getOwnPropertyNames(Engine.prototype).forEach(function(element) {
            _string[element] = _temp[element];
        }, this);

        return _string
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }
}

module.exports = Engine;