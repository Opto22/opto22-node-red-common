import { MockRed } from '../src/mocks/MockRed';
import * as mocha from 'mocha';
import * as should from 'should';
import * as CertificateUtil from '../src/CertificateUtil';
import * as path from 'path';

// Until we have an actual test, we need to require() the file
// so that Istanbul will give us an accurate test coverage report.
var CertificateUtilRequired = require('../src/CertificateUtil');

describe('CertificateUtil', function()
{
    var RED = new MockRed();

    it('getCertFile() can open a file from an absolute path', (): void =>
    {
        var testFileAbsolutePath = path.dirname(module.filename) + '/certs/test.pem'

        var buffer = CertificateUtil.getCertFile(RED, testFileAbsolutePath);
        should(buffer.toString()).be.exactly('test file contents');
    });

    it('getCertFile() can open a file from just a filename', (): void =>
    {
        // Patch in a userDir for this test.
        // getCertFile() will use RED.settings.userDir() + '/certs' for the path
        RED.settings.userDir = path.dirname(module.filename);

        var buffer = CertificateUtil.getCertFile(RED, 'test.pem');
        should(buffer.toString()).be.exactly('test file contents');
    });


    it('getCertFile() returns null with empty filename', (): void =>
    {
        // Patch in a userDir for this test.
        // getCertFile() will use RED.settings.userDir() + '/certs' for the path
        RED.settings.userDir = path.dirname(module.filename);

        var buffer = CertificateUtil.getCertFile(RED, '');
        should(buffer).be.null();
    });
});