"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const nodemailer = require('nodemailer');
class Mail {
    constructor(db) {
        this.db = db;
        this.transporter = null;
        this.mailOptions = {
            from: 'messageriecci@messageriecci.com',
            to: '',
            subject: 'MessagerieCCI: récupération du mot de passe',
            html: ''
        };
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'messageriecci@gmail.com',
                pass: 'chat2018,'
            }
        });
    }
    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    sendMail(mail) {
        return __awaiter(this, void 0, void 0, function* () {
            var password = this.getPassword();
            yield this.defineMail(mail, password);
            this.transporter.sendMail(this.mailOptions, function (err, info) {
                if (err)
                    console.log(err);
                else
                    console.log(info);
            });
            yield this.db.changePassword(mail, password);
            console.log('mot de passe changé dans la base');
        });
    }
    defineMail(mail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            this.mailOptions.to = mail;
            this.mailOptions.html = 'Votre pseudo: ' + (yield this.db.getUsernameFromMail(mail)) + '\nVotre nouveau mot de passe provisoire: ' + password;
        });
    }
    getPassword() {
        return randomInt(100000, 999999).toString();
    }
}
exports.Mail = Mail;
