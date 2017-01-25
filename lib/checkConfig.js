class CheckConfig {
    constructor(cowboyConfig) {
        this._cowboyConfig = cowboyConfig;
        this._why = [];
        this._check();
    }

    errored() {
        if(this._why.length == 0) {
            return false;
        } else {
            return this._why;
        }
    }

    _check() {
        if(typeof this._cowboyConfig.datasFolder != 'string') {
            this._why.push('contents parameter should be a string');
        }

        if(typeof this._cowboyConfig.templatesFolder != 'string') {
            this._why.push('templates parameter should be a string');
        }

        if(typeof this._cowboyConfig.outputFolder != 'string') {
            this._why.push('output parameter should be a string');
        }

        if(typeof this._cowboyConfig.debug != 'boolean') {
            this._why.push('debug parameter should be a boolean');
        }

        if(!this._cowboyConfig.routes instanceof Array) {
            this._why.push('routes parameter should be an object');
        }
    }
}

module.exports = CheckConfig;