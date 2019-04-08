import MessageQueue, { FullQueueBehaviorType } from '../src/MessageQueue';
import { MockNode } from '../src/mocks/MockNode';
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

    function assertMsgQueue(mq: MessageQueue, expectedMsgs: any[])
    {
        should(expectedMsgs.length).be.eql(mq['queue'].length);
        for (var i: number; i < expectedMsgs.length; i++) {
            var expectedMsg = expectedMsgs[i];
            should(expectedMsg).be.equal(mq['queue'][4].msg);
        }
    }

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

    it('drops new messages when queue is full', function(mochaDone: MochaDone)
    {
        var mq = new MessageQueue(5);
        var node = new MockNode('my-node');
        function noOp() { };

        var msg0 = { payload: 0 };
        var msg1 = { payload: 1 };
        var msg2 = { payload: 2 };
        var msg3 = { payload: 3 };
        var msg4 = { payload: 4 };
        var msg5 = { payload: 5 };
        var msg6 = { payload: 6 };
        var msg7 = { payload: 7 };
        var msg8 = { payload: 8 };
        var msg9 = { payload: 9 };
        var msg10 = { payload: 10 };

        // Add a bunch of messages.
        mq.add(msg0, node, node, noOp); // gets processed immediately
        mq.add(msg1, node, node, noOp);
        mq.add(msg2, node, node, noOp);
        mq.add(msg3, node, node, noOp);
        mq.add(msg4, node, node, noOp);
        assertMsgQueue(mq, [msg1, msg2, msg3, msg4]);

        // Add one more, which should fit.
        mq.add(msg5, node, node, noOp);
        assertMsgQueue(mq, [msg1, msg2, msg3, msg4, msg5]);

        // Add a message when the queue is full. It will get dropped.
        mq.add(msg6, node, node, noOp);
        assertMsgQueue(mq, [msg1, msg2, msg3, msg4, msg5]);

        // Finish the current message
        mq.done(0);
        assertMsgQueue(mq, [msg2, msg3, msg4, msg5]);

        // Finish the current message
        mq.done(0);
        assertMsgQueue(mq, [msg3, msg4, msg5]);

        // Add three messages
        mq.add(msg7, node, node, noOp);
        mq.add(msg8, node, node, noOp);
        mq.add(msg9, node, node, noOp);
        assertMsgQueue(mq, [msg3, msg4, msg5, msg7, msg8]);

        mq.done(0);
        mq.done(0);
        mq.done(0);
        mq.done(0);
        assertMsgQueue(mq, [msg8]);
        mq.done(0);
        assertMsgQueue(mq, []);

        mq.add(msg10, node, node, noOp);
        assertMsgQueue(mq, [msg10]);

        mochaDone();
    });


    it('drops old messages when queue is full (DROP_OLD option)', function(mochaDone: MochaDone)
    {
        var mq = new MessageQueue(5, FullQueueBehaviorType.DROP_OLD);
        var node = new MockNode('my-node');
        function noOp() { };

        var msg0 = { payload: 0 };
        var msg1 = { payload: 1 };
        var msg2 = { payload: 2 };
        var msg3 = { payload: 3 };
        var msg4 = { payload: 4 };
        var msg5 = { payload: 5 };
        var msg6 = { payload: 6 };
        var msg7 = { payload: 7 };
        var msg8 = { payload: 8 };
        var msg9 = { payload: 9 };
        var msg10 = { payload: 10 };

        // Add a bunch of messages.
        mq.add(msg0, node, node, noOp); // gets processed immediately
        mq.add(msg1, node, node, noOp);
        mq.add(msg2, node, node, noOp);
        mq.add(msg3, node, node, noOp);
        mq.add(msg4, node, node, noOp);
        mq.add(msg5, node, node, noOp);
        assertMsgQueue(mq, [msg1, msg2, msg3, msg4, msg5]);

        // Add a message when the queue is full. Oldest will get dropped.
        mq.add(msg6, node, node, noOp);
        assertMsgQueue(mq, [msg2, msg3, msg4, msg5, msg6]);

        // Finish the current message (msg2)
        mq.done(0);
        assertMsgQueue(mq, [msg3, msg4, msg5, msg6]);

        // Finish the current message (msg3)
        mq.done(0);
        assertMsgQueue(mq, [msg4, msg5, msg6]);

        // Add three messages
        mq.add(msg7, node, node, noOp);
        mq.add(msg8, node, node, noOp);
        mq.add(msg9, node, node, noOp);
        assertMsgQueue(mq, [msg5, msg6, msg7, msg8, msg9]);

        mq.done(0);
        mq.done(0);
        mq.done(0);
        mq.done(0);
        assertMsgQueue(mq, [msg9]);
        mq.done(0);
        assertMsgQueue(mq, []);

        mq.add(msg10, node, node, noOp);
        assertMsgQueue(mq, [msg10]);

        mochaDone();
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
