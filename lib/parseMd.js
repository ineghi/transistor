var showdown = require('showdown');

class ParseMd {
    constructor(string) {
        this._string = string;
        this._regex = /^(\s*\{([\s\S]+?)\}\s*)/i;
        this._object = {};
    }

    getObject() {
        var match = this._regex.exec(this._string);
        var converter = new showdown.Converter({
            noHeaderId: false
        });
        console.log(match);
        if (match && match.length) {
            try {
                this._object = eval('({' + match[2].replace(/^\s+|\s+$/g, '') + '})');
            }catch (e) {
                console.log(e);
            }
            this._object.body = converter.makeHtml(this._string.replace(match[0], ''));
        } else {
            this._object.body = converter.makeHtml(this._string);
        }

        return this._object;
    }
}

module.exports = ParseMd;