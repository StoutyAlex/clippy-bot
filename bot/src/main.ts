import dotenv from 'dotenv'
import { SheevBot } from './base/sheev-bot';
import { environment } from './config';
import AWS from 'aws-sdk';

dotenv.config();

AWS.config.update({region: 'eu-west-1'});

console.log('Running on environment', environment);

const client = new SheevBot();

client.start(process.env.BOT_TOKEN!).then(() => console.log('Logged in'));