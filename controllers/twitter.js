require('custom-env').env('', './config');
const twitterService = require("../services/twitter");

twitterService.tweet("this is a very long text  ");



