const Router = require('koa-router');
const { validation } = require('sample_path_pvt_lib');
const { flatten } = require('lodash');

const requireAuthentication = require('/sample_path');
const { createSchema } = require('/sample_path');
const filterSendBirdTokenAttributes = require('/sample_path');

const router = new Router();

router.post(
  '/',
  requireAuthentication,
  validation.createKoaMiddleware(createSchema, { stripUnknown: false }),
  filterSendBirdTokenAttributes,
  async ctx => {
    const { user_ids: userIds } = ctx.state.body;

    const currentUser = ctx.scope.resolve('currentUser');
    const getOrCreateSendBirdUserService = ctx.scope.resolve(
      'getOrCreateSendBirdUserService',
    );
    const getOrCreateUserService = ctx.scope.resolve('getOrCreateUserService');

    let sendBirdUsers;
    sendBirdUsers = await Promise.all([
      getOrCreateSendBirdUserService(currentUser.id),
      getOrCreateUserService(userIds),
    ]);

    sendBirdUsers = flatten(sendBirdUsers);

    ctx.body = { data: sendBirdUsers };
  },
);

module.exports = router;
