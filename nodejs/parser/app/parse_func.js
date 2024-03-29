let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');
let mkdirp = require('mkdirp');
let dbsaver = require('./dbsaver');

/*
 *  Get links of companies
 */

function getLinksCompany(callback) {

    request({uri: 'https://plitkazavr.ru/'}, function (error, response, body) {
        let list = [];
        let $ = cheerio.load(body);
        $('#alfavit_flex').find('a.no').not('a.no.cn').each(function (i, elem) {
            list[i] = 'https://plitkazavr.ru' + $(this).attr('href');
        });
        callback(list);
    });
}

/*
 *  Get collection of groups for specified company
 */

function getCompanyCols(url, callback) {
    request({uri: url}, function (error, response, body) {
        let list = [];
        let $ = cheerio.load(body);
        $('#tovarf').find('a').each(function (i, elem) {
            list[i] = 'https://plitkazavr.ru' + $(this).attr('href');
        });
        callback(list);
    });
}

/*
 *  Get completed groups of collection of company
 */

function getColsGroups(url, callback) {
    request({uri: url}, function (error, response, body) {
        let list = [];
        let $ = cheerio.load(body);
        $('#tovarf').find('a').each(function (i, elem) {
            list[i] = 'https://plitkazavr.ru' + $(this).attr('href');
        });
        callback(list);
    });
}


/*
 *  Get items from specific group
 */

function getGroupItems(url, callback) {
    request({uri: url}, function (error, response, body) {
        let list = [];
        let $ = cheerio.load(body);
        $('#tovar').find('a.cat_item_disc_a').each(function (i, elem) {
            list[i] = 'https://plitkazavr.ru' + $(this).attr('href');
        });
        callback(list);
    });
}

/*
 *  Parse one item from specific link
 */

function getItem(url) {
    request({uri: url}, function (error, response, body) {
        let item = {};
        let $ = cheerio.load(body);
        $('#item_border').find('> #item_prop > ul').find('li.item_list').each(function (i, elem) {
            if ($(this).find('div.item_cell.item_val').length > 0) {
                item[getRightName($(this).find('.item_cell').first().text())] = getRightValue(($(this).find('div.item_cell.item_val').text()).trim());
            }
        });
        item.price = (parseFloat($('#item_price').text()));
        // list.abs_img = ('https://plitkazavr.ru' + $('#item_img').attr('src'));
        item.img = ($('#item_img').attr('src'));
        item.meta = ($('#item_wrap').find('meta[itemprop="description"]').attr("content"));

        // dbsaver.saveToMongo(item);
        saveImg(item.img)

    });
}

function saveImg(link) {

    if (link) {
        let fullUrl = 'https://plitkazavr.ru' + link;
        let valArr = link.split('/');
        let resPath = '';

        for (let i = 1; i < valArr.length - 1; i++) {
            resPath += valArr[i] + '/';
        }

        let imgName = valArr[valArr.length - 1];

        fs.stat(resPath + imgName, function(err, stat) {
            if(err == null) {
                console.log('File already exists.');
            } else if(err.code === 'ENOENT') {
                mkdirp(resPath, function (err) {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        request(fullUrl).on('response', function (res) {
                            if (res.statusCode === 200) {
                                try {
                                    res.pipe(fs.createWriteStream(resPath + imgName));
                                    console.log('Image "' + imgName + '" added.')
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                        });
                    }
                });
            } else {
                console.log('Error: ', err.code);
            }
        });

    } else {
        console.log('Link is empty, no photo.');
    }
}

function getRightName(name) {
    switch (name) {
        case 'Фабрика':
            return 'fabric';
        case 'Коллекция':
            return 'collection';
        case 'Название':
            return 'name';
        case 'Размер':
            return 'size';
        case 'Артикул':
            return 'art';
        case 'Код товара':
            return 'sku';
        case 'Страна производитель':
            return 'country';
        case 'Тип':
            return 'type';
        case 'Применение':
            return 'useful';
        case 'Поверхность':
            return 'surface';
        case 'В коробке':
            return 'in_box';
        case 'Тональная вариация':
            return 'tone_var';
        case 'Материал':
            return 'material';
        case 'Ректифицированная':
            return 'rectified';
        default:
            return name;
    }
}

function getRightValue(name) {
    switch (name) {
        case 'фон':
            return 'Фоновая';
        case 'керамика':
            return 'керамическая плитка';
        default:
            return name;
    }
}

module.exports = {
    getLinksCompany: getLinksCompany,
    getColsGroups: getColsGroups,
    getGroupItems: getGroupItems,
    getItem: getItem,
    saveImg: saveImg
};