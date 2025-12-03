/**
 * User Model
 * Handles direct database interactions for user management using Supabase Admin Client.
 * @module models/userModel
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
     console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY not set. Admin actions will fail.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');


/**
 * User Model Object
 * Handles interactions with Supabase Auth Admin API.
 * @namespace UserModel
 */
const UserModel = {

     /**
      * Creates a new user in Supabase Auth.
      * 
      * @async
      * @function createUser
      * @memberof UserModel
      * @param {Object} params - User creation parameters
      * @param {string} params.email - User email
      * @param {string} params.password - User password
      * @param {Object} params.metadata - User metadata (role, name, etc.)
      * @returns {Promise<Object>} Supabase response object
      */
     createUser: async ({ email, password, metadata }) => {
          return await supabaseAdmin.auth.admin.createUser({
               email,
               password,
               email_confirm: true,
               user_metadata: metadata
          });
     },


     /**
      * Lists all users from Supabase Auth.
      * 
      * @async
      * @function listUsers
      * @memberof UserModel
      * @returns {Promise<Object>} Supabase response object containing list of users
      */
     listUsers: async () => {
          return await supabaseAdmin.auth.admin.listUsers();
     },


     /**
      * Retrieves a user by their JWT token.
      * 
      * @async
      * @function getUserByToken
      * @memberof UserModel
      * @param {string} token - JWT Bearer token
      * @returns {Promise<Object>} Supabase response object containing user data
      */
     getUserByToken: async (token) => {
          return await supabaseAdmin.auth.getUser(token);
     },


     /**
      * Updates a user's attributes by their ID.
      * 
      * @async
      * @function updateUserById
      * @memberof UserModel
      * @param {string} userId - UUID of the user
      * @param {Object} updates - Object containing fields to update
      * @returns {Promise<Object>} Supabase response object
      */
     updateUserById: async (userId, updates) => {
          return await supabaseAdmin.auth.admin.updateUserById(userId, updates);
     }
};

module.exports = UserModel;
