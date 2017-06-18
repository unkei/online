const LINE_CHANNEL_ACCESS_TOKEN = 'BdeFOkKnAjp4S53xFWgaMHhWcTC7eAsy3Vi8bTmhJE210DA+JGnfAmh7ir9tW+vxL4Cz4IgaHrK34A1cpXdroQH+2UUNq73mSVNFNbFE0Aik0c8M+roQsjYWHJGX77+6/4ITAiPPr8+HqcFsyRRl4QdB04t89/1O/w1cDnyilFU='

var request = require('request');

module.exports = class dietitian {
    static replyTotalCalorie(replyToken, foodList){
        var totalCalorie = 0;
        for (var food of foodList){
            totalCalorie += food.calorie;
        }
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
        }
        var body = {
            replyToken: replyToken,
            messages: [{
                type: 'text',
                text: 'カロリーは合計' + totalCalorie + 'kcalです！'
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

    static askWhichFood(replyToken, foodList){
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
        }
        var body = {
            replyToken: replyToken,
            messages: [{
                type: 'template',
                altText: 'どの食品がもっとも近いですか？',
                template: {
                    type: 'buttons',
                    text: 'どの食品がもっとも近いですか？',
                    actions: []
                }
            }]
        }

        for (var food of foodList){
            body.messages[0].template.actions.push({
                type: 'postback',
                // request ignored if length > 20. Limit to 15 for visualization.
                label: food.food_name.slice(-15),
                data: JSON.stringify(food)
            });

            // Currently limited to show up to 4 actions in a template message.
            if (body.messages[0].template.actions.length == 4) {
                break;
            }
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

