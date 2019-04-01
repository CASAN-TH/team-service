'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    mq = require('../../core/controllers/rabbitmq'),
    Team = mongoose.model('Team'),
    errorHandler = require('../../core/controllers/errors.server.controller'),
    _ = require('lodash');

exports.getList = function (req, res) {
    Team.find(function (err, datas) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: datas
            });
        };
    });
};

exports.create = function (req, res) {
    var newTeam = new Team(req.body);
    newTeam.createby = req.user;
    newTeam.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
            /**
             * Message Queue
             */
            // mq.publish('Team', 'created', JSON.stringify(data));
        };
    });
};

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    Team.findById(id, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.data = data ? data : {};
            next();
        };
    });
};

exports.read = function (req, res) {
    res.jsonp({
        status: 200,
        data: req.data ? req.data : []
    });
};

exports.update = function (req, res) {
    var updTeam = _.extend(req.data, req.body);
    updTeam.updated = new Date();
    updTeam.updateby = req.user;
    updTeam.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.delete = function (req, res) {
    req.data.remove(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.addTeam = function (req, res) {


    var updTeam = req.data;
    var data = {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        displayname: req.user.firstname + ' ' + req.user.lastname,
        member_id: req.body.member_id
    }
    updTeam.updated = new Date();
    // updTeam.updateby = req.user;
    updTeam.members.push(data);
    updTeam.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
}

exports.findIndexMember = function (req, res, next) {
    var membersData = req.data;
    var status = req.body.status;
    console.log(req.data)
    if (req.body.status === "staff") {
        req.update = req.data.members.findIndex(function (data) {
            // console.log(data)
            return data.member_id === req.body.member_id;
        });
        membersData.members[req.update].status = status
        req.memberOne = membersData
        // req.memberOne.members.splice(req.update,1)
        // console.log(membersData);
        next();
    }


    if (req.body.status === "retire") {
        req.update = req.data.members.findIndex(function (data) {
            // console.log(data)
            return data.member_id === req.body.member_id;
        });
        membersData.members.splice(req.update, 1)
        req.memberOne = membersData
        // console.log(membersData);
        req.memberOne.save(function (err, memberdata) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.memberdelete = memberdata;
                next();
            };
        });

    }
}

exports.findMemberAndUpdateById = function (req, res) {

    if (req.body.status === "staff") {
        var membersData = req.memberOne
        // console.log(membersData)

        var userrabbitmq = {
            userid: req.body.member_id,
            status: req.body.status,
            statusmember:req.body.statusmember
        }

        mq.publish('casanteam', 'updatestatusteam', JSON.stringify(userrabbitmq))

        Team.findByIdAndUpdate(membersData._id, membersData, { new: true }, function (err, data) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                // console.log(data)
                res.jsonp({
                    status: 200,
                    data: data
                });
            };
        });
    }

    if (req.body.status === "retire") {
        res.jsonp({
            status: 200,
            data: req.memberdelete
        });
    }

}

exports.updateStatusToOwner = function (req, res) {

    var status = req.body.status;
    var id = req.data._id;
    if (req.body.status === "approve") {
        Team.findByIdAndUpdate(id, { $set: { status: status } }, { new: true }, function (err, data) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var userteamid = {
                    userid: data.user_id,
                    status: req.body.status
                }
                mq.publish('casan', 'updatestatus', JSON.stringify(userteamid))
                console.log(data)
                res.jsonp({
                    status: 200,
                    data: data
                });
            };
        });
    }
    if (req.body.status === "reject") {
        req.data.remove(function (err, data) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                console.log(data)
                res.jsonp({
                    status: 200,
                    data: data
                });
            };
        });
    }
}