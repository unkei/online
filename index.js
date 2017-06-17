// -----------------------------------------------------------------------------
// 定数の設定
const LINE_CHANNEL_ACCESS_TOKEN = 'BdeFOkKnAjp4S53xFWgaMHhWcTC7eAsy3Vi8bTmhJE210DA+JGnfAmh7ir9tW+vxL4Cz4IgaHrK34A1cpXdroQH+2UUNq73mSVNFNbFE0Aik0c8M+roQsjYWHJGX77+6/4ITAiPPr8+HqcFsyRRl4QdB04t89/1O/w1cDnyilFU='

// -----------------------------------------------------------------------------
// モジュールのインポート
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

// -----------------------------------------------------------------------------
// ミドルウェア設定
app.use(bodyParser.json()); // 追加

// -----------------------------------------------------------------------------
// Webサーバー設定
var port = (process.env.PORT || 3000);
var server = app.listen(port, function() {
    console.log('Node is running on port ' + port);
});

// -----------------------------------------------------------------------------
// ルーター設定
app.get('/', function(req, res, next){
    res.send('Node is running on port ' + port);
});

app.post('/webhook', function(req, res, next){
    res.status(200).end();
    for (var event of req.body.events){
        if (event.type == 'message'){
            console.log(event.message);
            if (event.message.text == 'ハロー') {
                var headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
                }
                var body = {
                    'replyToken': event.replyToken,
                    messages: [{
                        type: 'text',
                        text: 'こんにちはー'
                    }]
                }
                var url = 'https://api.line.me/v2/bot/message/reply';
                request({
                    url: url,
                    method: 'POST',
                    headers: headers,
                    body: body,
                    json: true
                });
            }
        }
    }
});

