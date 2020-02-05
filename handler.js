'use strict';

const AWS = require('aws-sdk');
const ExifImage = require('exif').ExifImage;

const S3 = new AWS.S3({
  signatureVersion: 'v4', // let's also add a signature version, this just tells S3 to use the v4 set of permissions 
});

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

module.exports.display = (event, context, callback) => {
  
  (async function() {
    try {
        S3.listObjectsV2({Bucket: BUCKET}).promise()
        .then(response => getResponse(response))
        .then(meta => createHTML(meta))
        .then(data => callback(null, {
            statusCode: 200,
            headers: {
              'Content-Type': 'text/html',
            },
          body: data,
        }))
    } catch (e) {
      console.log('our error', e);
    }
  })();

  const getResponse = function(response) {
    const list = [];
    const res = response.Contents;
    console.log(res);
    for (let r of res) {
      console.log(r.Key);
      const obj = new Object();
      obj.url = `${URL}/${r.Key}`;
      obj.meta = r;
      list.push(obj);
    }
    return list;
  }

  const createHTML = function(meta) {
    let html = "";
    for (let m of meta) {
      let para = "";
      const metaObject = m.meta;
      for (let key in metaObject) {
        para += `<p>${key} : ${metaObject[key]}</p>`;
      }
      html += `
      <div>
        <img src="${m.url}" style="width:160px;height:300px;">
        <p>${para}</p>
      </div>`;
    }
    return `
      <body>
        ${html}
      </body>`;
  }
}
