const { get } = require('lodash');

module.exports = ({ sendBirdAPIService, ServiceValidationError, logger }) => {
  return async (userId, userData) => {
    logger.info(
      `Updating sendbird user ${userId} of type ${get(
        userData,
        'metadata.user_type',
      )}`,
    );
    const { users } = sendBirdAPIService;

    const sendBirdQueryRes = await users.query('user_ids', userId);
    const sendBirdUsers = get(sendBirdQueryRes, 'users');

    if (!sendBirdUsers.length) {
      logger.info(`Failed to get sendbird user of user id ${userId}`);
      if (get(userData, 'metadata.user_type') === 'coach')
        throw new ServiceValidationError({
          code: 'coaches_do_not_exist_in_sendbird',
          message: `Attempted to update but coach doesn't exist`,
        });
      else
        throw new ServiceValidationError({
          code: 'users_do_not_exist_in_sendbird',
          message: `Attempted to update but user doesn't exist`,
        });
    }

    return users.update(userId, userData);
  };
};
