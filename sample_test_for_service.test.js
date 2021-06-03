const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const expect = chai.expect;
chai.use(chaiAsPromised);

const makeServiceMock = require('/sample_path');
const makeUpdateUsersService = require('/sample_path');
const ServiceValidationError = require('/sample_path');

let sendBirdAPIService;
const mockUserId = '123';
const mockSendBirdAPIServiceRes = {
  users: [
    {
      phone_number: null,
      has_ever_logged_in: true,
      discovery_keys: [],
      user_id: '123',
      preferred_languages: [],
      created_at: null,
      is_active: true,
      is_online: false,
      last_seen_at: null,
      nickname: 'Foo Bar',
      profile_url: 'Test URL',
      metadata: {
        user_type: 'user',
      },
    },
  ],
};

const updateData = {
  nickname: 'Foo Bar',
  profile_url: 'Test URL',
};

const mockLogger = { info: () => {} };

describe('updateUsersService', () => {
  it('should find user in Sendbird and update', async () => {
    sendBirdAPIService = makeServiceMock({
      users: {
        query: sinon.stub().returns(mockSendBirdAPIServiceRes),
        update: sinon.stub().returns(mockSendBirdAPIServiceRes.users[0]),
      },
    });

    const updateUsersService = makeUpdateUsersService({
      sendBirdAPIService,
      logger: mockLogger,
    });
    const res = await updateUsersService(mockUserId, updateData);

    sinon.assert.called(sendBirdAPIService.users.update);
    sinon.assert.calledWith(
      sendBirdAPIService.users.query,
      'user_ids',
      mockUserId,
    );
    sinon.assert.calledWith(
      sendBirdAPIService.users.update,
      mockUserId,
      updateData,
    );
    expect(res).to.eql(mockSendBirdAPIServiceRes.users[0]);

    sendBirdAPIService.users.update.resetHistory();
  });

  it('should throw error when Sendbird cannot find user', async () => {
    sendBirdAPIService = makeServiceMock({
      users: {
        query: sinon.stub().returns({ users: [] }),
      },
    });

    const updateUsersService = makeUpdateUsersService({
      sendBirdAPIService,
      ServiceValidationError,
    });

    await expect(updateUsersService(mockUserId)).to.be.rejectedWith({
      code: 'users_do_not_exist_in_SendBird',
      message: `Attempted to update but user doesn't exist`,
    });
  });
});
