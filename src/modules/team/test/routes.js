'use strict';
var request = require('supertest'),
    assert = require('assert'),
    config = require('../../../config/config'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    app = require('../../../config/express'),
    Team = mongoose.model('Team');

var credentials,
    token,
    mockup;

describe('Team CRUD routes tests', function () {

    before(function (done) {
        mockup = {
            name: 'name',
            codeteam: 'tst',
            detail: 'test Detail2',
            // members: [
            //     {
            //         firstname: 'nutshapon2',
            //         lastname: 'lertlaosakunporn2'
            //     }
            // ]
        };
        credentials = {
            username: 'username',
            password: 'password',
            firstname: 'firstname',
            lastname: 'lastname',
            email: 'test@email.com',
            roles: ['user']
        };
        token = jwt.sign(_.omit(credentials, 'password'), config.jwt.secret, {
            expiresIn: 2 * 60 * 60 * 1000
        });
        done();
    });

    it('should be Team get use token', (done) => {
        request(app)
            .get('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                done();
            });
    });

    it('should be Team get by id', function (done) {

        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .get('/api/teams/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        // console.log(resp);
                        assert.equal(resp.status, 200);
                        assert.equal(resp.data.name, mockup.name);
                        done();
                    });
            });

    });

    it('should be Team post use token', (done) => {
        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.name, mockup.name);
                done();
            });
    });

    it('should be team put use token', function (done) {

        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                var update = {
                    name: 'name update'
                }
                request(app)
                    .put('/api/teams/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .send(update)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.data.name, update.name);
                        done();
                    });
            });

    });

    it('should be team delete use token', function (done) {

        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .delete('/api/teams/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(done);
            });

    });

    it('should be team get not use token', (done) => {
        request(app)
            .get('/api/teams')
            .expect(403)
            .expect({
                status: 403,
                message: 'User is not authorized'
            })
            .end(done);
    });

    it('should be team post not use token', function (done) {

        request(app)
            .post('/api/teams')
            .send(mockup)
            .expect(403)
            .expect({
                status: 403,
                message: 'User is not authorized'
            })
            .end(done);

    });

    it('should be team put not use token', function (done) {

        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                var update = {
                    name: 'name update'
                }
                request(app)
                    .put('/api/teams/' + resp.data._id)
                    .send(update)
                    .expect(403)
                    .expect({
                        status: 403,
                        message: 'User is not authorized'
                    })
                    .end(done);
            });

    });

    it('should be team delete not use token', function (done) {

        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .delete('/api/teams/' + resp.data._id)
                    .expect(403)
                    .expect({
                        status: 403,
                        message: 'User is not authorized'
                    })
                    .end(done);
            });

    });

    it('this should add new member', function (done) {

        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.name, mockup.name)
                assert.equal(resp.data.members.length, 0)
                // done();
                var updateTeam = {
                    member_id: 'member001'
                }
                request(app)
                    .put('/api/teams/add/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .send(updateTeam)
                    .expect(200)
                    .end((err, res) => {
                        var respupdate = res.body;
                        // console.log(respupdate.data);
                        assert.equal(respupdate.status, 200);
                        assert.equal(respupdate.data.members.length, 1)
                        assert.equal(respupdate.data.members[0].firstname, credentials.firstname)
                        assert.equal(respupdate.data.members[0].lastname, credentials.lastname)
                        assert.equal(respupdate.data.members[0].displayname, credentials.firstname + ' ' + credentials.lastname)
                        assert.equal(respupdate.data.members[0].member_id, updateTeam.member_id)
                        done();
                    });
            });
    });

    it('Should updata status member in team by Leader', function (done) {
        var mockup2 = {
            name: 'name',
            codeteam: 'tst',
            detail: 'test Detail2',
            members: [
                {
                    firstname: "nutnut",
                    lastname: 'lerler',
                    displayname: 'nutnut lerler',
                    member_id: "member002"
                }
            ]
        };
        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup2)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.name, mockup.name)
                assert.equal(resp.data.codeteam, mockup.codeteam)
                assert.equal(resp.data.detail, mockup.detail)
                assert.equal(resp.data.members.length, 1)
                // done();
                var updateTeam = {
                    member_id: 'member001'
                }
                request(app)
                    .put('/api/teams/add/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .send(updateTeam)
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err)
                        }
                        var respupdate = res.body;
                        // console.log(respupdate.data);
                        assert.equal(respupdate.status, 200);
                        assert.equal(respupdate.data.members.length, 2)
                        assert.equal(respupdate.data.members[1].firstname, credentials.firstname)
                        assert.equal(respupdate.data.members[1].lastname, credentials.lastname)
                        assert.equal(respupdate.data.members[1].displayname, credentials.firstname + ' ' + credentials.lastname)
                        assert.equal(respupdate.data.members[1].member_id, updateTeam.member_id)
                        // done();

                        var updStatus = {
                            member_id: 'member001',
                            status: 'staff'
                            // status: 'retire'
                        }  //หัวทีม แก้สถานะของลูกทีม
                        request(app)
                            .put('/api/teams/edit/' + resp.data._id)
                            .set('Authorization', 'Bearer ' + token)
                            .send(updStatus)
                            .expect(200)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                }
                                var resMemUpdateStatus = res.body;
                                // console.log(resMemUpdateStatus.data)
                                assert.equal(resMemUpdateStatus.data.name, mockup2.name)
                                assert.equal(resMemUpdateStatus.data.code, mockup2.code)
                                assert.equal(resMemUpdateStatus.data.detail, mockup2.detail)
                                assert.equal(resMemUpdateStatus.data.members[0].firstname, mockup2.members[0].firstname)
                                assert.equal(resMemUpdateStatus.data.members[0].lastname, mockup2.members[0].lastname)
                                assert.equal(resMemUpdateStatus.data.members[0].displayname, mockup2.members[0].displayname)
                                assert.equal(resMemUpdateStatus.data.members[0].member_id, mockup2.members[0].member_id)
                                assert.equal(resMemUpdateStatus.data.members[1].firstname, credentials.firstname)
                                assert.equal(resMemUpdateStatus.data.members[1].lastname, credentials.lastname)
                                assert.equal(resMemUpdateStatus.data.members[1].displayname, credentials.firstname + ' ' + credentials.lastname)
                                assert.equal(resMemUpdateStatus.data.members[1].member_id, updStatus.member_id)
                                assert.equal(resMemUpdateStatus.data.members[1].status, updStatus.status)
                                done();
                            });
                    });
            });
    });

    it('Should Admin Apporve owner', function (done) {
        var mockup2 = {
            name: 'name',
            codeteam: 'tst',
            detail: 'test Detail2',
            members: [
                {
                    firstname: "nutnut",
                    lastname: 'lerler',
                    displayname: 'nutnut lerler',
                    member_id: "member002"
                }
            ]
        };
        request(app)
            .post('/api/teams')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup2)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.name, mockup.name)
                assert.equal(resp.data.codeteam, mockup.codeteam)
                assert.equal(resp.data.detail, mockup.detail)
                assert.equal(resp.data.members.length, 1)
                // done();
                var updateTeam = {
                    member_id: 'member001'
                }
                request(app)
                    .put('/api/teams/add/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .send(updateTeam)
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err)
                        }
                        var respupdate = res.body;
                        // console.log(respupdate.data);

                        var updStatus = {
                         
                            status: 'apporve'
                            // status: 'retire'
                        }  //หัวทีม แก้สถานะของลูกทีม
                        request(app)
                            .put('/api/teams/adminapporve/' + resp.data._id)
                            .set('Authorization', 'Bearer ' + token)
                            .send(updStatus)
                            .expect(200)
                            .end((err, res) => {
                                if (err) {
                                    return done(err);
                                }
                                var resMemUpdateStatus = res.body;
                                // console.log(resMemUpdateStatus.data)
                        
                                done();
                            });
                    });
            });
    });

    afterEach(function (done) {
        Team.remove().exec(done);
    });

});