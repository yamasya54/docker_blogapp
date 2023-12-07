"use strict"
/* -------------------------------------------------------
    EXPRESS - BlogAPP
------------------------------------------------------- */
require('dotenv').config()
const HOST = process.env?.HOST || '127.0.0.1'
const PORT = process.env?.PORT || 8000
/* ------------------------------------------------------- */
// npm i swagger-autogen //*route ları gezer jsonu hazırlar
// https://swagger-autogen.github.io/docs/

const swaggerAutogen = require('swagger-autogen')()
const packageJson = require('./package.json')

const document = {
	info: {
		version: packageJson.version,
		title: packageJson.title,
		description: packageJson.description,
		termsOfService: "https://www.linkedin.com/in/yavuz-amasya-3a314a26a?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BHLb20ozLRlO85Kpu5GC5gQ%3D%3D",
		contact: { name: packageJson.author, email: "yavuzamasya1@gmail.com" },
		license: { name: packageJson.license, },
	},
	host: `${HOST}:${PORT}`,
	basePath: '/',
	schemes: ['http', 'https'],
	securityDefinitions: {
		Token: {
			type: 'apiKey',
			in: 'header',
			name: 'Authorization',
			description: 'SimpleToken Auth * Example: <b>Token <i>...tokenKey...<i></b>'
		},
	},
	security: [{ Token: true }],
	definition: {
		
	
		"Blog": require('./src/models/blog').schema.obj,
		"Category": require('./src/models/category').schema.obj,
		"Comment": require('./src/models/comment').schema.obj,
		"User": require('./src/models/user').schema.obj,
		// "Like": require('./src/models/like').schema.obj,
		// "Token": require('./src/models/token').schema.obj,
		// "View": require('./src/models/view').schema.obj,
	}
	
};

const routes = ['./index.js']
const outputFile = './src/configs/swagger.json'

// Create JSON file:
swaggerAutogen(outputFile, routes, document)