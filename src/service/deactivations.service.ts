import { Sema } from 'async-sema';
import axios, { AxiosInstance } from 'axios';
import twilio, { Twilio } from 'twilio';

interface DisconnectedNumbersData {
    date: string
    data: string
}

interface DeactivationListConfiguration {
    workers?: number
    applicationName: string
    twilioSid: string
    twilioAuthToken: string
}

class DeactivationService {
    private client: Twilio

    private workerPool: Sema;

    private request: AxiosInstance

    private twilioSid: string

    constructor({
        workers = 100, applicationName, twilioSid, twilioAuthToken,
    }: DeactivationListConfiguration) {
        this.client = twilio(twilioSid, twilioAuthToken);
        this.request = axios.create({
            headers: { 'X-Application-Name': applicationName },
        });
        this.workerPool = new Sema(workers);

        this.twilioSid = twilioSid;
    }

    public fetchByDateSpan = async (
        startDate: Date,
        endDate: Date,
        execute: (humanDate: DisconnectedNumbersData['date'], numbers: string[]) => Promise<void>,
    ): Promise<DisconnectedNumbersData[]> => {
        const dates = [];
        for (let q = startDate; q <= endDate; q = new Date(q.getTime() + 8.64e+7)) {
            dates.push(q);
        }

        const data = await Promise.all(dates.map((date) => this.fetchByDate(date, execute)));
        return data;
    }

    public fetchByDate = async (
        date: Date,
        execute: (humanDate: DisconnectedNumbersData['date'], numbers: string[]) => Promise<void> | undefined = null,
    ): Promise<DisconnectedNumbersData> => {
        await this.workerPool.acquire();
        try {
            const deactivations = await this.client.messaging.deactivations(this.twilioSid).fetch({ date });
            const { data } = await this.request({ url: deactivations.redirectTo });
            const numbers = data.split(/\r\n|\r|\n/);
            const humanDate = date.toISOString().split('T')[0];

            if (execute) {
                await execute(humanDate, numbers);
            }

            return {
                date: humanDate,
                data: execute ? 'processed in execute statement' : numbers,
            };
        } catch (error) {
            throw new Error(error);
        } finally {
            this.workerPool.release();
        }
    }

    public getTwilio = (): Twilio => this.client
}

export default DeactivationService;
