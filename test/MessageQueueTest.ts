import MessageQueue from '../src/MessageQueue';
import { MockNode } from'../src/mocks/MockNode';
import * as should from 'should';
import * as assert from 'assert';


describe('MessageQueue class', function()
{

    it('constructor creates the queue', function()
    {
        var mq = new MessageQueue(10);

        should(mq.getCurrentMessage()).be.null();
    });

    it('add() 1 msg will call it immediately', function(done: MochaDone)
    {
        var mq = new MessageQueue(10);
        var node = new MockNode('my-node');
        var msg = { payload: 'my payload' };
        mq.add(msg, node, node, (msg: any): void =>
        {
            should.exist(msg);

            var currentMsgHolder = mq.getCurrentMessage();
            should.exist(currentMsgHolder);
            should(currentMsgHolder.msg).match(msg);

            mq.done(0);

            done();
        });
    });


    it('add() 5 msg will queue properly', function(mochaDone: MochaDone)
    {
        const numMsgToTest = 5;
        var mq = new MessageQueue(10);
        var node = new MockNode('my-node');
        var callIndex = 0;
        var msgs: any[] = [];

        function checker(msg: any): void
        {
            should.exist(msg);
            let expectedMsg = msgs[callIndex];
            callIndex++;

            var currentMsgHolder = mq.getCurrentMessage();
            should.exist(currentMsgHolder);
            should(currentMsgHolder.msg).match(expectedMsg);

            mq.done(5);

            if (callIndex == numMsgToTest) {
                mochaDone();
            }
        }

        for (var i = 0; i < numMsgToTest; i++) {
            var msg = { payload: 'my payload ' + i };
            msgs[i] = msg;
            mq.add(msg, node, node, checker)
        }
    });

    it('add() will return -1 when queue is full', function(mochaDone: MochaDone)
    {
        const numMsgToTest = 7;
        const queueSize = numMsgToTest - 2;
        let mq = new MessageQueue(queueSize); // too small
        let node = new MockNode('my-node');
        let callIndex = 0;


        function checker(msg: any): void
        {
            callIndex++;

            mq.done(20); // delay so that queue can fill up

            if (callIndex == queueSize) {
                mochaDone();
            }
        }

        should(mq.add({}, node, node, checker)).be.exactly(0); // gets called immediately
        should(mq.add({}, node, node, checker)).be.exactly(2);
        should(mq.add({}, node, node, checker)).be.exactly(3);
        should(mq.add({}, node, node, checker)).be.exactly(4);
        should(mq.add({}, node, node, checker)).be.exactly(5);
        should(mq.add({}, node, node, checker)).be.exactly(6);
        should(mq.add({}, node, node, checker)).be.exactly(-1);
        should(mq.add({}, node, node, checker)).be.exactly(-1);
    });

    it('dump() will empty the queue', function(mochaDone: MochaDone)
    {
        let mq = new MessageQueue(10); // too small
        let node = new MockNode('my-node');

        function checker(msg: any): void
        {
            mq.done(20); // delay so that queue can fill up
        }

        should(mq.add({}, node, node, checker)); // gets called immediately
        should(mq.add({}, node, node, checker));
        should(mq.add({}, node, node, checker));
        should(mq.add({}, node, node, checker));
        should((<any>mq).queue.length == 3); // peak inside and check the length
        mq.dump();
        should((<any>mq).queue.length == 0); // peak inside and check the length

        mochaDone();
    });
});
