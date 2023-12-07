"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | CLARUSWAY FullStack Team
------------------------------------------------------- */
// Comment Controller:
const Comment = require("../models/comment");
const Blog = require("../models/blog");

module.exports = {
  create: async (req, res) => {
     /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Create Comment"
            #swagger.description = "Look to <b>'Models/Comment'</b> for parameters."
             #swagger.parameters['body'] = {
                in: 'body',
                required: 'true',
                schema: {
                    $ref: '#/definitions/Comment'
                }
            }
        */
    req.body.user = req.user.username;
    req.body.post = req.params.id;

    await Comment.create(req.body);

    const commentsOfBlog = await Comment.find({ post: req.params.id });

    await Blog.updateOne({ _id: req.params.id }, { comments: commentsOfBlog });

    res.status(201).send({
      error: false,
    });
  },
  update: async (req, res) => {
     /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Uptade Comment"
            #swagger.description = "Look to <b>'Models/Comment'</b> for parameters."
             #swagger.parameters['body'] = {
                in: 'body',
                required: 'true',
                schema: {
                    $ref: '#/definitions/Comment'
                }
            }
        */
    const comment = await Comment.findOne({ _id: req.params.id });
    const post = comment?.post;

    if (req.user.username === comment?.user) {
      await Comment.updateOne({ _id: req.params.id }, req.body);

      const commentsOfBlog = await Comment.find({ post });

      await Blog.updateOne({ _id: post }, { comments: commentsOfBlog });
    } else throw new Error("You can only update your own comment!");

    res.status(202).send({
      error: false,
      new: await Comment.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
     /*
            #swagger.tags = ["Comments"]
            #swagger.summary = "Delete Comment"
           
        */
    const comment = await Comment.findOne({ _id: req.params.id });
    const post = comment?.post;
    let data;

    if (req.user.username === comment?.user || req.user.isAdmin) {
      data = await Comment.deleteOne({ _id: req.params.id });

      const commentsOfBlog = await Comment.find({ post });

      await Blog.updateOne({ _id: post }, { comments: commentsOfBlog });
    } else throw new Error("You can only delte your own comment!");

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
    });
  },
};
