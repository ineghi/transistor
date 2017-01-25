# Transistor
A pragmatic javascript static generator.
Uses Nunjucks as template engine.

***Do not use it yet***

`$ npm i transistor --save-dev`

## Usage

You must create a javascript file, import Transistor and instenciate it with a config object as parameter.
```
const Transistor = require('transistor');

new Transistor({
    routes: [
        {
            path: '/',
            template: 'homepage.html',
        },
        {
            path: '/works/:slug',
            template: 'works/entry.html',
            model: 'works.*'
        }
    ]
});
```

You can see a (not) real life exemple [here](https://github.com/ineghi/transistor-exemple).

### Config object properties

- `routes` (array of objects, mandatory)   
Will specify wich files to render.   
Needs a path where to generate the file(s) and a template as skeleton.
model specify from wich part of the model the file(s) will be generated. 
Is optionnal, but needed when you want to generate a bunch a file from a model list (typically, blogposts).
- `locales` (array of objects)
You can define here your locales with the name you want inside the path you want.
To tell Transistor a specific locale has to be in the root, you must simply skip the path parameter.
- `contents` (string, default: 'contents')    
The input folder of your contents (will be the mirror of the Model)
- `templates` (string, default: 'pages')    
The input folder of your templates
- `debug` (boolean, default: false)   
Allow to display in the console the resulting model

## Templating 

Transistor uses Nunjucks.
The see all the interactions you can do with, please see [https://mozilla.github.io/nunjucks](https://mozilla.github.io/nunjucks)

### Paginate

Will return a _paginate object.

```
{% paginate transistor.model('works').range(3) %}

{% for name, entry in _paginate.entries %}
    <article>
        <h1>{{entry.title}}</h1>
        <p>{{entry.body}}</p>
    </article>
{% endfor %}

{% if _paginate.previousUrl|length > 0 %}
    <a href="{{_paginate.previousUrl}}">Previous page</a>
{% endif %}

{% for elem in _paginate.getPrevUrls(5) %}
    <a href="{{elem.url}}">{{elem.page}}</a>
{% endfor %}
```

#### The _paginate object
- `_paginate.entries`   
A list of entries corresponding to the current page

- `_paginate.currentPage`   
Return the current page number

- `_paginate.totalPages`   
Return the total of the pages generated

- `_paginate.firstUrl`   
Return the url of the first page

- `_paginate.lastUrl`   
Return the url of the last page

- `_paginate.getPrevUrls(n)`   
A method that fetches the lasts `n` pages numbers and it's url and return it as an array.   
```
{% for prevUrls in _paginate.getPrevUrls(5) %}
    <a href="{{prevUrls.url}}">{{prevUrls.page}}</a>
{% endfor %}
```

- `_paginate.getNextUrls(n)`
A method that fetches the next `n` pages numbers and it's url and return it as an array.   
```
{% for nextUrls in _paginate.getNextUrls(5) %}
    <a href="{{nextUrls.url}}">{{nextUrls.page}}</a>
{% endfor %}
```

## Transistor engine

The model (everything under `/contents` by default) is *always* accessible with {{ transistor.model('model.pattern') }} and supports these methods:

- `.limit(n)`   
Limit the length of the given object

- `.range(n)`   
Will return the given object divided in multiple parts.

#### Exemple:
```
{
    'elem-1': {
        ...
    },
    'elem-2': {
        ...
    },
    'elem-3': {
        ...
    }
}
```
with .range(2), will gives
```
{
    '1': {
        'elem-1': {
            ...
        },
        'elem-2': {
            ...
        }
    },
    '2': {
        'elem-3': {
            ...
        }
    }
}
```
Very usefull to make paginations