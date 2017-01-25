let _ = require('lodash');
let nunjucks = require('nunjucks');

class Paginate {
    constructor(templatesFolder, outputFolder) {
        this._templatesFolder = templatesFolder;
        this._outputFolder = outputFolder;
        this.tags = ['paginate'];
    }

    parse(parser, nodes, lexer) {
        var tok = parser.nextToken();
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);

        return new nodes.CallExtension(this, 'run', args);
    }

    run(context, model) {
    
        if(!context.ctx._paginated) {
            context.ctx._paginated = true;
            let _context = _.clone(context.ctx); 
            
            let _pageRoutes = [];
            let _i = 1;
            _.forOwn(model, (value, key) => {
                let _paginateModel = {};
                _.set(_paginateModel, '_paginate.currentPage', _i);
                _.set(_paginateModel, '_paginate.totalPages', _.size(model));
                _.set(_paginateModel, '_paginate.firstUrl', _context._path + 'p' + 1);
                _.set(_paginateModel, '_paginate.lastUrl', _context._path + 'p' + _.size(model));
                
                _.set(_paginateModel, '_paginate.getPrevUrls', function(number) {
                    if(typeof number == "number") {
                        let _tempModel = [];

                        while(number > 0) {
                            if((this.currentPage - number) > 0) {
                                if(number == 1) {
                                    _tempModel.push({
                                        page: number,
                                        url: context.ctx._path
                                    });
                                } else {
                                    _tempModel.push({
                                        page: number,
                                        url: context.ctx._path + 'p' + number
                                    });
                                }
                                
                            }
                            number--;
                        }

                        return _.orderBy(_tempModel, ['page'], ['asc']);
                    } else {
                        return 'hehe... I need a number here.'
                    }
                });

                _.set(_paginateModel, '_paginate.getNextUrls', function(number) {
                    if(typeof number == "number") {
                        let _tempModel = [];

                        while(number > 0) {
                            if((this.currentPage + number) <= _.size(model)) {
                                _tempModel.push({
                                    page: (this.currentPage + number),
                                    url: context.ctx._path + 'p' + (this.currentPage + number)
                                });
                            }
                            number--;
                        }

                        return _.orderBy(_tempModel, ['page'], ['asc']);
                    } else {
                        return 'hehe... I need a number here.'
                    }
                });

                if(_i < _.size(model)) {
                    _.set(_paginateModel, '_paginate.nextUrl', context.ctx._path + 'p' + (_i + 1));
                }

                if(_i > 2) {
                    _.set(_paginateModel, '_paginate.previousUrl', context.ctx._path + 'p' + (_i - 1));
                } else if(_i > 1) {
                    _.set(_paginateModel, '_paginate.previousUrl', context.ctx._path);
                }

                _.set(_paginateModel, '_paginate.entries', value);

                if(_i > 1) {
                    let _pseudoModel = _.merge({}, _context, _paginateModel);
                    let _route = {
                        path: context.ctx._path + 'p' + _i,
                        template: context.ctx._template,
                        model: _pseudoModel
                    };
                    _pageRoutes.push(_route);
                } else {
                    _.merge(context.ctx, _paginateModel);
                }
                _i++;
            });

            let RenderFiles = require('../renderFiles');
            let renderFiles = new RenderFiles(_pageRoutes, 
                                            null, 
                                            this._templatesFolder, 
                                            this._outputFolder);

            renderFiles.write();
        }
    }
}

module.exports = Paginate;