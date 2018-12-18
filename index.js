'use strict';

const Parser = require('library-parser');
const Trakt = require('trakt.tv');
const async = require('async');

module.exports = class Library {
    constructor(traktId = String(), paths = Array(), debug = false) {
        if (!traktId) throw Error('You need to pass a Trakt.tv client_id, see http://docs.trakt.apiary.io/');
        if (!paths.length) throw Error('At least one path is required');
        if (paths.constructor == String) paths = paths.split(',');

        this.debug = debug;
        this.log = message => this.debug && console.log(message);

        this.trakt = new Trakt({
            client_id: traktId,
            plugins: {
                matcher: require('trakt.tv-matcher')
            }
        });

        this.parser = new Parser({
            paths: paths,
            types: ['video'],
            throttle: true
        });

        this.log('Module initialized');
    }

    scan() {
        return this.parser.scan().then(this.match.bind(this));
    }

    update(db) {
        return this.parser.update(db).then(this.match.bind(this));
    }

    match (files) {
        return new Promise(resolve => {
            this.log('Library contains ' + files.length + ' files');

            this.matchedFiles = Array();
            this.unmatchedFiles = Array();

            const queue = async.queue(this.getFromTrakt.bind(this), 5);

            queue.drain = () => { 
                this.log('Matching process done: ' + this.matchedFiles.length + ' results with metadata (total is ' + files.length + ')');
                resolve(this.matchedFiles.concat(this.unmatchedFiles));
            };

            queue.push(files);
        });
    }

    getFromTrakt(file, callback) {
        if (file.metadata) {
            this[(file.metadata.type ? '' : 'un') + 'matchedFiles'].push(file);
            return callback();
        }

        this.trakt.matcher.match(file).then((md = {}) => {
            file.metadata = md;

            this.log((md.type ? 'Match' : 'No match') + ' found for ' + file.filename);

            this[(md.type ? '' : 'un') + 'matchedFiles'].push(file);
        }).catch(err => {
            this.log('An error occured while trying to match the file on Trakt:' + err.message);
            this.unmatchedFiles.push(file);
        }).then(callback);
    }
};