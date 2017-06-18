// -----------------------------------------------------------------------------
// 定数の設定
const LINE_CHANNEL_ACCESS_TOKEN = 'BdeFOkKnAjp4S53xFWgaMHhWcTC7eAsy3Vi8bTmhJE210DA+JGnfAmh7ir9tW+vxL4Cz4IgaHrK34A1cpXdroQH+2UUNq73mSVNFNbFE0Aik0c8M+roQsjYWHJGX77+6/4ITAiPPr8+HqcFsyRRl4QdB04t89/1O/w1cDnyilFU='

// -----------------------------------------------------------------------------
// モジュールのインポート
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var mecab = require('mecabaas-client');
var shokuhin = require('shokuhin-db');
var memory = require('memory-cache');
var dietitian = require('./dietitian');
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
        if (event.type == 'message' && event.message.text){
            mecab.parse(event.message.text)
            .then(
                function(response){
                    var foodList = [];
                    for (var elem of response){
                        if (elem.length > 2 && elem[1] == '名詞'){
                            foodList.push(elem);
                        }
                    }
                    var gotAllNutrition = [];
                    if (foodList.length > 0){
                        for (var food of foodList){
                            gotAllNutrition.push(shokuhin.getNutrition(food[0]))
                        }
                        return Promise.all(gotAllNutrition);
                    }
                }
            ).then(
                function(responseList){
                    var botMemory = {
                        confirmedFoodList: [],
                        toConfirmFoodList: [],
                        confirmingFood: null
                    }
                    for (var nutoritionList of responseList) {
                        if (nutoritionList.length == 0){
                            continue;
                        } else if (nutoritionList.length == 1){
                            botMemory.confirmedFoodList.push(nutoritionList[0]);
                        } else if (nutoritionList.length > 1){
                            botMemory.toConfirmFoodList.push(nutoritionList);
                        }
                    }

                    if (botMemory.toConfirmFoodList.length == 0 && botMemory.confirmedFoodList.length > 0){
                        console.log('Going to reply the total calorie.');
                        dietitian.replyTotalCalorie(event.replyToken, botMemory.confirmedFoodList);
                    } else if (botMemory.toConfirmFoodList.length > 0){
                        console.log('Going to ask which food the user had.');
                        dietitian.askWhichFood(event.replyToken, botMemory.toConfirmFoodList[0]);

                        botMemory.confirmingFood = botMemory.toConfirmFoodList[0];
                        botMemory.toConfirmFoodList.splice(0, 1);

                        memory.put(event.source.userId, botMemory);
                    }
                }
            );
        } else if (event.type == 'postback'){
            var answeredFood = JSON.parse(event.postback.data);
            var botMemory = memory.get(event.source.userId);
            botMemory.confirmedFoodList.push(answeredFood);
            if (botMemory.toConfirmFoodList.length == 0 && botMemory.confirmedFoodList.length > 0){
                console.log('Going to reply the total calorie.');
                dietitian.replyTotalCalorie(event.replyToken, botMemory.confirmedFoodList);
            } else if (botMemory.toConfirmFoodList.length > 0){
                console.log('Going to ask which food the user had.');
                dietitian.askWhichFood(event.replyToken, botMemory.toConfirmFoodList[0]);
                botMemory.confirmedFoodList = botMemory.toConfirmFoodList[0];
                botMemory.toConfirmFoodList.slice(0, 1);

                memory.put(event.source.userId, botMemory);
            }
        }
    }
});

