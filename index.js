const fs = require('fs');
const megaquery = require('megaquery');
const stopword = require('stopword');
const { Index } = require("flexsearch");

function genStopwords(strin) {
  strin = strin.clean(["\n", "&nbsp;", "rt"]);
  let st = strin.split(" ");
  const myKeywords = stopword.removeStopwords(st)
  return [...new Set(myKeywords)];
}

String.prototype.clean = function (args) {
  let data = this.toLowerCase();
  for (var i = 0; i < args.length; i++) {
    data = data.replace(args[i]," ");
  }
  data = data.replace(/[^\w ]/g,"");
  data = data.replace(/\s\s+/g, ' ');
  return data.trim();
};

function megasearch() {
  this.query = (query, max=500) => {
    let index = new Index({
        preset: "match",
        tokenize: "forward"
    });
    return new Promise(async function(resolve, reject) {
      let stopwords = genStopwords(query);
      let documentStore = [];
      for (var i = 0; i < stopwords.length; i++) {
        let sw = stopwords[i];
        let file = await megaquery.api({q: sw});
        if (file != `{"error": "value doesn't exist"}`) {
          documentStore = documentStore.concat(file.split("\n"));
        }
      }
      documentStore = [...new Set(documentStore)];
      let documentOBJ = {};
      for (var i = 0; i < documentStore.length; i++) {
        let docId = documentStore[i];
        let doc = await megaquery.api({q: docId});
        index.add(docId,doc);
        documentOBJ[docId] = doc;
      }
      let indexs = index.search(query,max);
      let res = []
      for (var i = 0; i < indexs.length; i++) {
        let num = indexs[i];
        res.push(documentOBJ[num]);
      }
      resolve(res);
    });
  }
  this.id = async (id) => {
    return new Promise(async function(resolve, reject) {
      let query = await megaquery.api({q: id});
      if (query == `{"error": "value doesn't exist"}`) {
        reject(query);
      } else {
        resolve(query);
      }
    });
  }
  this.add = async (id, value) => {
    return new Promise(async function(resolve, reject) {
      let query = await megaquery.api({q: id});
      let stopwords = genStopwords(value);
      if (query == `{"error": "value doesn't exist"}`) {
        await megaquery.api({
          key: id,
          value: value
        });
        for (var i = 0; i < stopwords.length; i++) {
          let sw = stopwords[i];
          let file = await megaquery.api({q: sw});
          if (file != `{"error": "value doesn't exist"}`) {
            file = file.split("\n");
            file.push(id);
            await megaquery.api({
              key: sw,
              value: file.join("\n"),
              overwrite: "true"
            });
          } else {
            await megaquery.api({
              key: sw,
              value: id
            });
          }
        }
      } else {
        reject({sucess: false, error: "Error: value already exists"});
      }
    });
  }
}

module.exports = megasearch;
