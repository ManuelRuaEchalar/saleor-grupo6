module.exports = {
  createTransport: () => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'mocked-message-id' }))
  })
};
