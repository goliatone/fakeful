var fs = require('fs');
var xlsx = require('xlsx');
var cvcsv = require('csv');

exports = module.exports = XLSX_json;

function XLSX_json(config, callback) {
    if (!config.input) {
        console.error("You miss a input file");
        process.exit(1);
    }
    console.info('YO')
    var cv = new CV(config, callback);
}

function CV(config, callback) {
    this.config = config;
    this.config.headerTransforms = config.headerTransforms || [];
    var wb = this.load_xlsx(config.input)
    var ws = this.ws(wb);
    var csv = this.csv(ws)
    this.cvjson(csv, config.output, callback)
}

CV.prototype.load_xlsx = function(input) {
    console.log('INPUT', input);
    return xlsx.readFile(input);
};

CV.prototype.ws = function(wb) {
    var target_sheet = '';

    if (target_sheet === '') target_sheet = wb.SheetNames[0];
    ws = wb.Sheets[target_sheet];
    return ws;
};

CV.prototype.csv = function(ws) {
    return csv_file = xlsx.utils.make_csv(ws)
};

CV.prototype.cvjson = function(csv, output, callback) {
    var record = [],
        header = [],
        self = this;
    cvcsv()
        .from.string(csv)
        .transform(function(row, index) {
            row.unshift(row.pop());
            return row;
        })
        .on('record', function(row, index) {
            if (index === 0) {
                //TODO: We can move to a .transform(up there)
                header = [];
                row.forEach(function(head) {
                    this.config.headerTransforms.forEach(function(transform) {
                        head = transform.call(this, head);
                    }, this);
                    header.push(head);
                }, self);
            } else {
                var obj = {};
                obj._id = uid(24);
                obj._index = index;
                header.forEach(function(column, index) {
                    obj[column.trim()] = row[index].trim();
                });
                record.push(obj);
            }
        })
        .on('end', function(count) {
            // when writing to a file, use the 'close' event
            // the 'end' event may fire before the file has been written
            if (output !== null) {
                var stream = fs.createWriteStream(output, {
                    flags: 'w'
                });
                stream.write(JSON.stringify(record));
                callback(null, record);
            } else {
                callback(null, record);
            }

        })
        .on('error', function(error) {
            console.error(error.message);
        });
};

function uid(len) {
    len = len || 7;
    return Math.random().toString(35).substr(2, len);
}