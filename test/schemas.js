var Joi = require('joi');

exports.type = Joi.object({
	name: Joi.string().required(),
	protocol: Joi.string(),
	subtypes: Joi.array(),
});

exports.question = {
	type: Joi.array().includes(exports.type),
	port: Joi.number().integer().optional(),
	fullname: Joi.string().optional(),
	host: Joi.string().optional(),
	txt: Joi.array()
};

exports.answer = {
	type: Joi.array().includes(exports.type),
	host: Joi.string(),
	port: Joi.number().integer(),
	fullname: Joi.string(),
	txt: Joi.array()
}

exports.additional = {
	port: Joi.number().integer(),
	fullname: Joi.string(),
	txt: Joi.array(),
	host: Joi.string()
}

exports.authority = {

}


exports.validate = Joi.validate;