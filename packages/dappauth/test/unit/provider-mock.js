export default class MockProvider {
  constructor(mockContract) {
    this.mockContract = mockContract;
  }

  sendAsync(payload, callback) {
    const data = payload.params[0].data.substring(2);
    const methodCall = data.substring(0, 8);
    const methodParams = data.substring(8);

    try {
      const result = this.mockContract.run(methodCall, methodParams);
      const { jsonrpc, id } = payload;
      callback(null, {
        jsonrpc,
        id,
        result,
      });
    } catch (error) {
      callback(error);
    }
  }

  send(payload, callback) {
    this.sendAsync(payload, callback);
  }
}
