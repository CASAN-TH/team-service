'use strict';
// use model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TeamSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: 'Please fill a Team name',
    },
    user_id:{
        type:String
    },
    codeteam: {
        type: String,
        unique: true,
        required: 'Please fill a Code Team',
    },
    detail: {
        type: String
    },
    status: {
        type: String,
        enum: ['waitapprove','approve'],
        default: ['waitapprove']
    },
    image:{
        type: String
    },
    members: {
        type: [
            {
                firstname: {
                    type: String
                },
                lastname: {
                    type: String
                },
                displayname: {
                    type: String
                },
                status: {
                    type: String,
                    enum: ['waitapprove','staff','retire'],
                    default: ['waitapprove']
                },
                member_id: {
                    type: String
                }
            }
        ]
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    },
    updateby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    }
});

mongoose.model("Team", TeamSchema);