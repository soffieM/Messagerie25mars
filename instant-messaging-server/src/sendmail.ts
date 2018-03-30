import { DbModel } from "./dbModel";

function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const nodemailer = require('nodemailer');

export class Mail {

    private transporter: any = null;
    private mailOptions = {
        from: 'messageriecci@messageriecci.com', 
        to: '', 
        subject: 'MessagerieCCI: récupération du mot de passe', 
        html: ''
    };

    public constructor(private db:DbModel) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
             auth: {
                    user: 'messageriecci@gmail.com',
                    pass: 'chat2018,'
            }
        });
    }

    public randomIntFromInterval(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    async sendMail(mail: string): Promise<void> {
        var password = this.getPassword();
        await this.defineMail(mail,password);
        this.transporter.sendMail(this.mailOptions, function (err, info) {
            if(err)
                console.log(err)
            else
                console.log(info);
        });
        await this.db.changePassword(mail, password);
        console.log('mot de passe changé dans la base');
    }

    async defineMail(mail: string, password: string){
           this.mailOptions.to = mail; 
           this.mailOptions.html='Votre pseudo: '+ await this.db.getUsernameFromMail(mail)+'\nVotre nouveau mot de passe provisoire: '+password;
    }

    public getPassword():string{
        return randomInt(100000,999999).toString();
    }

}
