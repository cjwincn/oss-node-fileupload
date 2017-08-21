var express = require('express');
var http = require('http');
var STS = require('ali-oss').STS;
var co = require('co');
var fs = require('fs');
var app = express();
var OSS = require('ali-oss')

//加密
app.get('/', function (req, res) {
  var conf = JSON.parse(fs.readFileSync('./config.json'));
  var policy;
  if (conf.PolicyFile) {
    policy = fs.readFileSync(conf.PolicyFile).toString('utf-8');
  }

  var client = new STS({
    accessKeyId: conf.AccessKeyId,
    accessKeySecret: conf.AccessKeySecret,
  });

  co(function* () {
    var result = yield client.assumeRole(conf.RoleArn, policy, conf.TokenExpireTime);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-METHOD', 'GET');
    res.json({
      AccessKeyId: result.credentials.AccessKeyId,
      AccessKeySecret: result.credentials.AccessKeySecret,
      SecurityToken: result.credentials.SecurityToken,
      Expiration: result.credentials.Expiration
    });
  }).then(function () {
  }).catch(function (err) {
    res.status(400).json(err.message);
  });
});

app.get('/list',function (req,res) {
    var type = req.query.type;
    var conf = JSON.parse(fs.readFileSync('./config.json'));
    var client = new OSS({
        region: 'oss-cn-shanghai',
        accessKeyId: conf.AccessKeyId,
        accessKeySecret: conf.AccessKeySecret,
        bucket: 'uploaddemo'
    })
    function* listDir(dir){
        if(dir!='video/'&&dir!='image/'&&dir!='files/'){
            res.json({err:[]});
            return;
        }
        var result = yield client.list({
            prefix: dir,
            delimiter: '/'
        });
       var arr = result.objects.filter(function(item){
            return item.size != 0 ;
       })
        var data;
        var ind;
        var obj={};
        if(dir=='video/'||dir=='image/'){
            arr.forEach(function(v){
                v.name=v.name.substring(6);
                delete v.etag;
            })
            obj.data=arr;
            return res.json(obj);
        }else if(dir=='files/'){
            function fn(callback){
                arr.forEach(function (v,i) {
                    v.name=v.name.substring(6)
                    if(v.name=='config.txt'){
                        ind=i
                        http.get(v.url, function(res) {
                            var buffers = [];
                            res.on('data', function(chunk) {
                                buffers.push(chunk);
                            });
                            res.on('end', function(chunk) {
                                var wholeData = Buffer.concat(buffers);
                                data = JSON.parse(wholeData);
                                callback(data);
                            });

                        }).on('error', function(e) {
                            console.log( e.message);
                        });
                    }

                })
            };
            fn(function (data) {
                arr.forEach(function (v) {
                    data.forEach(function (a) {
                        if(a.name == v.name && a.size == v.size){
                            v.isEncrypt = a.isEncrypt
                            v.password  = a.password;
                            v.lastModified = new Date(v.lastModified);
                            // console.log(typeof v.lastModified)
                            delete v.etag;
                        }
                    })

                })
                arr.splice(ind,1);
                obj.data=arr;
                res.json(obj);
            });
        }

    }
    co(listDir(type+'/')).catch(function (err) {
        console.log(err);
    });
})

// app.get('/continue',function (req,res) {
//     var filepath = req.query.path;
//     function exprose(client) {
//         var filepath ='C:/Users/Administrator/Desktop/2.avi';
//         console.log(filepath);
//         var object =client.put('video/2.avi',filepath);
//         console.log(object);
//
//     }
//     exprose()
//
// })

app.get('/upload',function (req,res) {
    var type = req.query.type;
    var url = "C:\\Users\\Administrator\\Desktop\\2.avi";
    fs.open(url, 'r', '0666', function (err, fd) {
        console.log(fd);
    })

})

app.listen(4000, function () {
  console.log('App started.');
});

