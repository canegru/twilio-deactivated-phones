import { assert, expect } from 'chai';
import dotEnv from 'dotenv';

import EnvironmentEnums from '../src/enums/environment.enum';
import DeactivationService from '../src/service/deactivations.service';

dotEnv.config();

describe('DeactivationService', () => {
    let deactivations: DeactivationService;

    it('should init class', () => {
        deactivations = new DeactivationService({
            applicationName: process.env[EnvironmentEnums.APP_NAME],
            twilioSid: process.env[EnvironmentEnums.TWILIO_SID],
            twilioAuthToken: process.env[EnvironmentEnums.TWILIO_AUTH_TOKEN],
        });

        expect(deactivations).to.have.property('fetchByDateSpan');
        expect(deactivations).to.have.property('fetchByDate');
        expect(deactivations).to.have.property('getTwilio');
    });

    it('should return a record by date and pass assertion', async () => {
        const dayBefore = new Date();
        dayBefore.setDate(dayBefore.getDate() - 1);

        const results = await deactivations.fetchByDate(dayBefore);
        expect(results).to.have.property('date');
        expect(results).to.have.property('data');
        expect(results.date).to.equal(dayBefore.toISOString().split('T')[0]);
        assert.typeOf(results.data, 'array');
    });

    it('should return Twilio Client', () => {
        const client = deactivations.getTwilio();
        expect(client).to.have.property('messaging');
    });
});
