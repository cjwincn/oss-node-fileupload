var appServer = 'http://localhost:4000';
var bucket = 'uploaddemo';
var region = 'oss-cn-shanghai';


var urllib = OSS.urllib;
var OSS = OSS.Wrapper;
var STS = OSS.STS;
var ipcRenderer = require('electron').ipcRenderer;

var checkpoint;
var uploadId;
var md5;
var file;
var fileName;
var numlength;
var doT = window.doT;
var bar = document.getElementById('progress-bar');
var storage = window.localStorage;

var applyTokenDo = function (func) {
    var url = appServer;
    return urllib.request(url, {
        method: 'GET'
    }).then(function (result) {
        var creds = JSON.parse(result.data);
        var client = new OSS({
            region: region,
            accessKeyId: creds.AccessKeyId,
            accessKeySecret: creds.AccessKeySecret,
            stsToken: creds.SecurityToken,
            bucket: bucket
        });
        return func(client);
    });
};

var calculate = function (file, callback) {
    var fileReader = new FileReader(),
        blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,
        chunkSize = 2097152,
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5();

    fileReader.onload = function (e) {
        spark.appendBinary(e.target.result);
        currentChunk++;
        if (currentChunk < chunks) {
            loadNext();
        }
        else {
            callback(spark.end())
        }
    };
    function loadNext() {
        var start = currentChunk * chunkSize,
            end = start + chunkSize >= file.size ? file.size : start + chunkSize;

        fileReader.readAsBinaryString(blobSlice.call(file, start, end));
    };
    loadNext();
}

var pauseFile = function (id) {
    for (var k in storage) {
        var every = JSON.parse(storage[k]);
        if (every.uploadId == id) {
            var fileName = JSON.parse(window.storage[every.name.substr(6)]);
        }
        ;
    }
    var object = JSON.parse(window.localStorage[fileName.name])
    object.uploading = false;
    window.localStorage[fileName.name] = JSON.stringify(object);
}

var uploadFile = function (client) {
    var fileValue = document.getElementById('file').value;
    if (fileValue == '') {
        alert('请上传文件');
        return false;
    }
    ;
    file = document.getElementById('file').files[0];
    var fileArr = {
        name: file.name,
        path: file.path,
        size: file.size,
        type: file.type,
        uploading: true
    }
    window.localStorage[file.name] = JSON.stringify(fileArr);

    if (fileName != undefined) {
        if (fileName.name != file.name || fileName.size != file.size || fileName.type != file.type) {
            alert('请上传相同文件');
            return false;
        }
        ;
    }
    ;
    var key;
    if (file.type.substr(0, 11) == 'application') {
        key = 'files/' + file.name;
    } else if (file.type.substr(0, 5) == 'video') {
        key = 'video/' + file.name;
    } else if (file.type.substr(0, 5) == 'image') {
        key = 'image/' + file.name;
    } else {
        key = file.name
    }
    calculate(file, function (result) {
        md5 = result;
        checkpoint = window.localStorage[md5];
        if (checkpoint) {
            checkpoint = JSON.parse(checkpoint);
            var partNum = Math.ceil(checkpoint.fileSize / checkpoint.partSize);
            if (checkpoint.doneParts.length == partNum) {
                alert('文件已经上传完成');
                return false;
            }
            checkpoint.file = file;
        }
        document.getElementById('sidemune').className = 'show';
        document.getElementById("index").className = "hide";
        document.getElementById('menu').value = "关闭传输列表";
        return client.multipartUpload(key, file, {
            parallel: 4,
            partSize: 1024 * 1024,
            checkpoint: checkpoint,
            progress: function (p, cpt) {
                return function (done) {
                    if (p === 1 && cpt === undefined) {
                        alert('上传完成');
                        document.getElementById('sidemune').className = 'hide';
                        document.getElementById("index").className = "show";
                        document.getElementById('menu').value = "传输列表";
                        cpt = {
                            file: file,
                            name: file.name,
                            fileSize: file.size,
                            partSize: file.size,
                            uploadId: md5,
                            doneParts: [
                                {
                                    "number": 1,
                                }
                            ],
                            nextPart: 1
                        }
                    } else {
                        uploadId = cpt.uploadId;
                    }
                    var part = [];
                    for (var k in storage) {
                        var every = JSON.parse(storage[k]);
                        if (every.fileSize != undefined) {
                            var partNum = Math.ceil(every.fileSize / every.partSize);
                            if (every.doneParts.length != partNum) {
                                part.push(every);
                            }
                        }
                    }
                    if (numlength < part.length) {
                        init();
                    }
                    for (var i = 0; i < part.length; i++) {
                        if (part[i].uploadId == uploadId) {
                            var barIndex = document.getElementById('progress-' + i);
                            barIndex.style.width = Math.floor(p * 100) + '%';
                            barIndex.innerHTML = Math.floor(p * 100) + '%';
                            if (Math.floor(p * 100) === 99) {
                                barIndex.style.width = '100%';
                                barIndex.innerHTML = '100%';
                            }
                        }
                    }
                    var fileOne = JSON.parse(window.localStorage[file.name]);
                    window.localStorage[md5] = JSON.stringify(cpt);
                    if (fileOne.uploading) {
                        done()
                    }
                }
            }
        }).then(function (res) {
            fileName = undefined;
            init();
            return listFiles(client);
        });
    })
};

var continueFile = function (id) {
    var fileValue = document.getElementById('file').value;
    if (fileValue != '') {
        var arr = [];
        for (var k in storage) {
            var every = JSON.parse(storage[k]);
            if (every.fileSize != undefined) {
                var partNum = Math.ceil(every.fileSize / every.partSize);
                if (every.doneParts.length != partNum) {
                    arr.push(every);
                }
            }
        }
        for (var i = 0; i < arr.length; i++) {
            if (id == arr[i].uploadId) {
                var cont = arr[i]
                if (cont.name.substr(6) != file.name || cont.fileSize != file.size) {
                    alert('请上传相同文件');
                    document.getElementById('sidemune').className = 'hide';
                    document.getElementById("index").className = "show";
                    document.getElementById('menu').value = "传输列表";
                } else {
                    applyTokenDo(uploadFile);
                }
                ;
            }
            ;
        }
        ;
    } else {
        alert('请上传文件');
        document.getElementById('sidemune').className = 'hide';
        document.getElementById("index").className = "show";
        document.getElementById('menu').value = "传输列表";
        document.getElementById('file').onchange = function () {
            applyTokenDo(uploadFile);
        };
    }
    for (var k in storage) {
        var every = JSON.parse(storage[k]);
        if (every.uploadId == id) {
            fileName = JSON.parse(window.storage[every.name.substr(6)]);
        }
        ;
    }
};

var init = function () {
    var arr = [];
    var com = [];
    for (var k in storage) {
        var every = JSON.parse(storage[k]);
        var partNum = Math.ceil(every.fileSize / every.partSize);
        if (every.fileSize != undefined) {
            if (every.doneParts.length == partNum) {
                com.push(every);
            } else {
                arr.push(every);
            }
        }
    }
    var comStr = doT.template($('#complete-list').text())(com);
    $('#completing-list').html(comStr);
    $('#list-complete-table').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": true,
        "autoWidth": true,
        "oLanguage": {
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉， 没有找到",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据"
        },
        "scrollY": 400,
        "paging": false
    });

    var htmlStr = doT.template($('#upload-list').text())(arr);
    $('#uploading-list').html(htmlStr);
    $('#list-uploading-table').DataTable({
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": true,
        "autoWidth": false,
        "oLanguage": {
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉， 没有找到",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从 _MAX_ 条数据中检索)"
        },
        "scrollY": 400,
        "paging": false,
        "aoColumns": [                          //设定各列宽度
            {"sWidth": "20%"},
            {"sWidth": "20%"},
            {"sWidth": "40%"},
            {"sWidth": "20%"}]
    });
    numlength = arr.length;
    for (var i = 0; i < com.length; i++) {
        var obj = com[i].uploadId
        document.getElementById('del-button-' + obj).onclick = function () {
            var id = this.getAttribute("data-del");
            for (var k in storage) {
                var every = JSON.parse(storage[k]);
                if (id == every.uploadId) {
                    window.localStorage.removeItem(k)
                    init();
                }
            }
        }
    }
    ;
    for (var i = 0; i < arr.length; i++) {
        var num = Math.ceil(arr[i].fileSize / arr[i].partSize);
        var per = arr[i].nextPart / num;
        var barIndex = document.getElementById('progress-' + i);
        barIndex.style.width = Math.floor(per * 100) + '%';
        barIndex.innerHTML = Math.floor(per * 100) + '%';
        document.getElementById('pause-button-' + arr[i].uploadId).onclick = function () {
            var id = this.getAttribute("data-pause");
            pauseFile(id);
        }
        document.getElementById('file-button-' + arr[i].uploadId).onclick = function () {
            var id = this.getAttribute("data-file");
            continueFile(id);
        }
        document.getElementById('stop-button-' + arr[i].uploadId).onclick = function () {
            var id = this.getAttribute("data-stop");
            deleteFile(id);
        }
    }
    ;
    applyTokenDo(downList);
    $('.dataTables_scrollHeadInner>.dataTable').attr('style', '');
    $('.dataTables_scrollHeadInner').attr('style', '');
};

var deleteFile = function (id) {
    for (var k in storage) {
        var every = JSON.parse(storage[k]);
        console.log(every)
        if (every.uploadId == id) {
            var obj = JSON.parse(window.storage[every.name.substr(6)]);
        }
        ;
    }
    ;
    var object = JSON.parse(window.localStorage[obj.name]);
    object.uploading = false;
    window.localStorage[obj.name] = JSON.stringify(object);
    uploadId = id;
    fileName = JSON.parse(window.localStorage[obj.name]);
    applyTokenDo(stopFile);
};

var stopFile = function (client) {
    if (fileName.type.substr(0, 11) == 'application') {
        name = 'files/' + fileName.name;
    } else if (fileName.type.substr(0, 5) == 'video') {
        name = 'video/' + fileName.name;
    } else if (fileName.type.substr(0, 5) == 'image') {
        name = 'image/' + fileName.name;
    } else {
        name = fileName.name
    }
    client.abortMultipartUpload(name, uploadId)
        .then(function (result) {
            window.localStorage.removeItem(fileName.name);
            for (var k in storage) {
                var every = JSON.parse(storage[k]);
                if (every.fileSize != undefined) {
                    var partNum = Math.ceil(every.fileSize / every.partSize);
                    if (every.doneParts.length != partNum && every.name.substr(6) == fileName.name) {
                        md5 = k;
                    }
                }
            }
            if (md5) window.localStorage.removeItem(md5);
            fileName = undefined;
            init();
        })
        .catch(function (err) {
            console.log(err)
        })
};

var downloadFile = function (client) {
    var obj = [];
    $("#list :checkbox").each(function () {
        if ($(this).prop("checked") == true) {
            obj.push($(this).val());
        }
        return obj;
    });
    if (obj.length == 0) {
        alert('请选择要下载的文件');
        return false;
    }
    obj.forEach(function (v) {
        var result = client.signatureUrl(v, {
            response: {
                'content-disposition': 'attachment; filename="' + v + '"'
            }
        });
        window.location = result;
        return result;
    })
};

var listFiles = function (client) {
    var table = document.getElementById('list-files-table');
    return client.list({
        'max-keys': 100
    }).then(function (result) {
        var objects;
        if (result.objects == undefined) {
            objects = [];
        } else {
            objects = result.objects.sort(function (a, b) {
                var ta = new Date(a.lastModified);
                var tb = new Date(b.lastModified);
                if (ta > tb) return -1;
                if (ta < tb) return 1;
                return 0;
            }).filter(function (item) {
                return item.size != 0;
            })
        }
        var htmlStr = doT.template($('#dottp-list').text())(objects);
        $('#dotcon-list').html(htmlStr);
        $('#list-files-table').DataTable({
            "lengthChange": false,
            "searching": true,
            "ordering": false,
            "info": true,
            "autoWidth": false,
            "oLanguage": {
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉， 没有找到",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
                "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                "sSearch": "搜索"
            },
            "order": [
                [2, 'asc']//第一列正序
            ],
            "scrollY": 400,
            "paging": false
        });
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i]
            document.getElementById('list-button-' + obj.name).onclick = function () {
                var object = this.getAttribute('data-list');
                var fileName = object;
                var result = client.signatureUrl(object, {
                    response: {
                        'content-disposition': 'attachment; filename="' + fileName + '"'
                    }
                });
                window.location = result;
                console.log(result);
                return result;
            }
            document.getElementById('del-button-' + obj.name).onclick = function () {
                var object = [];
                object.push(this.getAttribute('data-del'));
                return client.deleteMulti(object, {
                    quiet: true
                }).then(function () {
                    listFiles(client);
                    init();
                })
            }
        }
        ;
        $("#all").click(function () {
            if (this.checked) {
                $("#list :checkbox").prop("checked", true);
            } else {
                $("#list :checkbox").prop("checked", false);
            }
        });
        $("#list :checkbox").click(function () {
            allchk();
        });
    });
    function allchk() {
        var chknum = $("#list :checkbox").length;
        var chk = 0;
        $("#list :checkbox").each(function () {
            if ($(this).prop("checked") == true) {
                chk++;
            }
        });
        if (chknum == chk) {
            $("#all").prop("checked", true);
        } else {
            $("#all").prop("checked", false);
        }
    }
};

var downList = function (client) {

    return client.list({
        'max-keys': 100
    }).then(function (result) {
        var download;
        if (result.objects == undefined) {
            download = [];
        } else {
            download = result.objects.sort(function (a, b) {
                var ta = new Date(a.lastModified);
                var tb = new Date(b.lastModified);
                if (ta > tb) return -1;
                if (ta < tb) return 1;
                return 0;
            }).filter(function (item) {
                return item.size != 0;
            })
        }
        var htmlStr = doT.template($('#downloading-list').text())(download);
        $('#down-list').html(htmlStr);
        $('#list-downloading-table').DataTable({
            "lengthChange": false,
            "searching": false,
            "ordering": false,
            "info": true,
            "autoWidth": false,
            "oLanguage": {
                "sLengthMenu": "每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉， 没有找到",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "没有数据",
                "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                "sSearch": "搜索"
            },
            "scrollY": 400,
            "paging": false
        });
        for (var i = 0; i < download.length; i++) {
            var obj = download[i]
            document.getElementById('down-button-' + obj.name).onclick = function () {
                var object = this.getAttribute('data-down');
                var fileName = object;
                var result = client.signatureUrl(object, {
                    response: {
                        'content-disposition': 'attachment; filename="' + fileName + '"'
                    }
                });
                window.location = result;
                return result;
            }
        };
        $('.dataTables_scrollHeadInner>.dataTable').attr('style', '');
        $('.dataTables_scrollHeadInner').attr('style', '');
    });
};

var delFiles = function (client) {
    var obj = [];
    $("#list :checkbox").each(function () {
        if ($(this).prop("checked") == true) {
            obj.push($(this).val());
        }
        return obj;
    });
    if (obj.length == 0) {
        alert('选择要删除的文件');
        return false;
    }
    return client.deleteMulti(obj, {
        quiet: true
    }).then(function () {
        listFiles(client);
        init();
    })
}

window.onload = function () {

    $(document).on("click", ".nav-close", function () {
        ipcRenderer.send('window-all-closed');
    });
    $(document).on("click", ".nav-min", function () {
        ipcRenderer.send('hide-window');
    });
    init()
    document.getElementById('menu').onclick = function () {
        init();
        if (document.getElementById('sidemune').className == 'show') {
            document.getElementById('sidemune').className = 'hide';
            document.getElementById("index").className = "show";
            document.getElementById('menu').value = "传输列表";

        } else {
            document.getElementById('sidemune').className = 'show';
            document.getElementById("index").className = "hide";
            document.getElementById('menu').value = "关闭传输列表";
        }

    };

    document.getElementById('file-button').onclick = function () {
        $('#file').click();
    };
    document.getElementById('file').onchange = function () {
        applyTokenDo(uploadFile);
    };

    document.getElementById('dl-button').onclick = function () {
        applyTokenDo(downloadFile);
    };

    document.getElementById('del-button').onclick = function () {
        applyTokenDo(delFiles);
    }

    document.getElementById('list-files-button').onclick = function () {
        if ($('#file').outerHTML) {
            $('#file').outerHTML = $('#file').outerHTML;
        } else {
            $('#file').value = "";
        }
        applyTokenDo(listFiles);
    }

    applyTokenDo(listFiles);
};
