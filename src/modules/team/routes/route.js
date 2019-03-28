'use strict';
var controller = require('../controllers/controller'),
    mq = require('../../core/controllers/rabbitmq'),
    policy = require('../policy/policy');
module.exports = function (app) {
    var url = '/api/teams';
    var urlWithParam = '/api/teams/:teamId';
    app.route(url).all(policy.isAllowed)
        .get(controller.getList)
        .post(controller.create);

    app.route(urlWithParam).all(policy.isAllowed)
        .get(controller.read)
        .put(controller.update)
        .delete(controller.delete);

    app.route('/api/teams/add/:teamId')
        .put(controller.addTeam)

    app.route('/api/teams/edit/:teamId')  //สำหรับ เปลี่ยนสถานะลูกทีม
        .put(
            controller.findIndexMember,
            controller.findMemberAndUpdateById)
    
    app.route('/api/teams/adminapporve/:teamId')
        .put(
            controller.updateStatusToOwner
        )        

    app.param('teamId', controller.getByID);


    /**
     * Message Queue
     * exchange : ชื่อเครือข่ายไปรษณีย์  เช่น casan
     * qname : ชื่อสถานีย่อย สาขา
     * keymsg : ชื่อผู้รับ
     */
    // mq.consume('Team', 'created', 'created', (msg)=>{
    //     console.log(JSON.parse(msg.content));

    // });
}