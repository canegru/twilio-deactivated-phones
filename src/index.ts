import fs from 'fs/promises';

import dotEnv from 'dotenv';

import EnvironmentEnums from './enums/environment.enum';
import DeactivationService from './service/deactivations.service';
import validateEnvironment from './utils/validateEnvironment';

dotEnv.config();

const init = async (): Promise<void> => {
    validateEnvironment([EnvironmentEnums.TWILIO_SID, EnvironmentEnums.TWILIO_AUTH_TOKEN, EnvironmentEnums.APP_NAME]);

    const deactivations = new DeactivationService({
        applicationName: process.env[EnvironmentEnums.APP_NAME],
        twilioSid: process.env[EnvironmentEnums.TWILIO_SID],
        twilioAuthToken: process.env[EnvironmentEnums.TWILIO_AUTH_TOKEN],
    });

    /**
    * write your code here to read from source and find the last pulled date
    */
    if (!fs.stat('./data')) {
        fs.mkdir('./data');
    }

    await deactivations.fetchByDateSpan(
        new Date('2020-09-05'),
        new Date('2022-02-02'),
        async (date, data) => {
            /**
            * write to db code, the reason this function is required as a passthrough
            * is to not store all the phone numbers in memory and we can dump the list after every process
            */
            await fs.writeFile(`./data/${date}.txt`, JSON.stringify(data));
        },
    );
};

init();
