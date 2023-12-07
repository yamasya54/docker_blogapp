"use strict";
/* -------------------------------------------------------
    EXPRESS_JS - User-API Controller
------------------------------------------------------- */
// User Controller:
const User = require("../models/user");
const Token = require("../models/token");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const sendMail = require('../helpers/sendMail')

module.exports = {
  list: async (req, res) => {
      /*
            #swagger.tags = ["Users"]
            #swagger.summary = "List Users"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */
    const data = await res.getModelList(User);
    sendMail("yavuzamasya1@gmail.com","welcome","Welcome my blog app")
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User),
      data,
    });
  },

  create: async (req, res) => {
     /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Create User"
            #swagger.description = "Look to <b>'Models/User'</b> for parameters."
             #swagger.parameters['body'] = {
                in: 'body',
                required: 'true',
                schema: {
                    $ref: '#/definitions/User'
                }
            }
        */

    const user = await User.create(req.body);
    

    // register
    const tokenData = await Token.create({user_id: user._id,token: passwordEncrypt(user._id + Date.now())});


    user._doc.id = user._id;
    user._doc.token = tokenData.token;

    sendMail(
      user.email,
      'welcome',
      `
      <p>Welcome my blog app</p>
      Verify Email: https://blog-app-mern-stack-nine.vercel.app/users/verify/?id=${user._id}&verifyCode=${passwordEncrypt(user.email)}
      `
    )

    res.status(201).send(user);
  },

  read: async (req, res) => {
      /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Get Single User"
        */
    const data = await User.findOne({ _id: req.params.id });
    res.status(200).send({
      error: false,
      data,
    });
  },
  update: async (req, res) => {
       /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Uptade User"
            #swagger.description = "Look to <b>'Models/User'</b> for parameters."
             #swagger.parameters['body'] = {
                in: 'body',
                required: 'true',
                schema: {
                    $ref: '#/definitions/User'
                }
            }
        */
    const data = await User.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });
    res.status(202).send({
      error: false,
      data,
      new: await User.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
     /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Delete User"
        */
    const data = await User.delete({ _id: req.params.id });
    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },
  verify: async (req, res) => {
    const { id: _id, verifyCode } = req.query
    console.log(req.query)
    const user = await User.findOne({ _id })
    console.log(user)
    if (
      user && verifyCode == passwordEncrypt(user.email)
    ) {
      await User.updateOne({ _id }, { emailVerified: true })
      sendMail(
        user.email,
        'Email Verified',
        'Email Verified'
      )
      res.status(200).send({
        error: false,
        message: 'Email Verified'
      })
    } else {
      res.errorStatusCode = 402
      throw new Error('User not found')
    }
  }
};

