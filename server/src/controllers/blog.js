"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | CLARUSWAY FullStack Team
------------------------------------------------------- */
// Blog Controller:
const Blog = require("../models/blog");
const View = require("../models/view");
const Comment = require("../models/comment");
const Like = require("../models/like");

module.exports = {
  list: async (req, res) => {
       /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "List Blogs"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */

    let filters = {};

    filters = { status: "p" };

    if (req?.query?.author && req.user.username === req?.query?.author)
      filters = req.query;
    if (req?.query?.author && !(req.user.username === req?.query?.author))
      throw new Error("You can only see your own blog");

    const data = await res.getModelList(Blog, filters, 'category');

    res.status(200).send(data);
  },

  create: async (req, res) => {
     /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Create Blog"
            #swagger.description = "Look to <b>'Models/Blog'</b> for parameters."
             #swagger.parameters['body'] = {
                in: 'body',
                required: 'true',
                schema: {
                    $ref: '#/definitions/Blog'
                }
            }
        */
    req.body.author = req.user.username;

    const data = await Blog.create(req.body);
    res.status(201).send({
      error: false,
      data,
    });
  },
  read: async (req, res) => {
         /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Get Single Blog"
        */
    let views = await View.findOne({ post_id: req.params.id });

    if (!views) views = await View.create({ post_id: req.params.id });

    const viewedBySet = new Set(views.viewedBy);

    viewedBySet.add(req.user._id.toString());

    await Blog.updateOne(
      { _id: req.params.id },
      { post_views: viewedBySet.size }
    );

    await View.updateOne(
      { post_id: req.params.id },
      { viewedBy: [...viewedBySet] }
    );

    const data = await Blog.findOne({ _id: req.params.id }).populate('category');
    res.status(200).send(data);
  },
  update: async (req, res) => {
      /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Uptade Blog"
            #swagger.description = "Look to <b>'Models/Blog'</b> for parameters."
             #swagger.parameters['body'] = {
                in: 'body',
                required: 'true',
                schema: {
                    $ref: '#/definitions/Blog'
                }
            }
        */


        req.body.images = req.body?.images || []
        for (let file of req.files) {
            // console.lof(file)
            req.body.images.push('/img/' + file.originalname)
        }
    const data = await Blog.updateOne({ _id: req.params.id }, req.body);
    res.status(202).send({
      error: false,
      data,
      new: await Blog.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
       /*
            #swagger.tags = ["Blogs"]
            #swagger.summary = "Delete Blog"
        */
    const blog = await Blog.findOne({ _id: req.params.id });

    const author = blog?.author;
    let data;

    if (req.user.username === blog?.author || req.user.isAdmin) {
      data = await Blog.deleteOne({ _id: req.params.id });

      await Comment.deleteMany({ post: req.params.id });
      await Like.deleteMany({ post_id: req.params.id });
      await View.deleteMany({ post_id: req.params.id });
    } else throw new Error("You can only delte your own comment!");

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },
};
