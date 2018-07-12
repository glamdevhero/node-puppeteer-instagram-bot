let PouchDB = require('pouchdb');

let db = new PouchDB('follows');
let db_archive = new PouchDB('followsArchive');

let addFollow = async function (username) {
    return db.put({_id: username, added: new Date().getTime()});
};

let getFollows = async function () {
    return db.allDocs({include_docs: true});
};

let unFollow = async function (username) {
    return new Promise(function (resolve, reject) {
        db.get(username).then(doc => {
            return db.remove(doc);
        }).then(() => {
            return db_archive.put({_id: username});
        }).then(() => {
            resolve(true);
        }).catch(e => reject(e));
    });
};

let inArchive = async function (username) {
    return db_archive.get(username);
};

module.exports.addFollow = addFollow;
module.exports.inArchive = inArchive;
module.exports.getFollows = getFollows;
module.exports.unFollow = unFollow;

