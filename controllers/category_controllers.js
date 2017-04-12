/**
 * @author Gaurav Sharma
 * @description controller middleware for product categories
 */

import express from 'express';
import CategoryModel from '../models/category_model';
import response from '../utility/response_generator';

var exports = module.exports = {};

/**
 * requires request to be authenticated
 */
exports.all = (req, res, next) => {
    CategoryModel.allCategories ((err, data) => {
        if (err) {
            res.send (response.error (err));
        } else if (data) {
            res.send (response.success (data))
        } else {
            res.send (response.error ('No data'))
        }
    });
};

/**
 * requires request to be authenticated and user to be admin
 * @param {string} category representing the name of category to add
 */
exports.addCategory = (req, res, next) => {
    CategoryModel.addCategory (req.params.category, (err, data) => {
        if (err) {
            res.send (response.error (err));
        } else if (data) {
            res.send (response.success (data));
        } else {
            res.send (response.error ('No data'));
        }
    });
};

/**
 * update an existing category.
 * request to be authenticated and only admin can make requests
 * @param {id} string as category id to update
 * @param {string} string as category name to update to
 */
exports.updateCategory = (req, res, next) => {
    CategoryModel.updateCategory (req.params.id, req.params.category, (err, data) => {
        if (err) {
            res.send (response.error (err));
        } else if (data) {
            res.send (response.success (data));
        } else {
            res.send (response.error ('Category not found'));
        }
    });
};

/**
 * auth request
 * @param {string} category as category's name
 */
exports.getByName = (req, res, next) => {
    CategoryModel.getCategory (req.params.category, (err, data) => {
        if (err) {
            res.send (response.error (err));
        } else if (data) {
            res.send (response.success ('found'));
        } else {
            res.send (response.error ('Not found'));
        }
    })
};