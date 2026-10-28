/**
 * Portfolio Philippe Roumbo — envoi automatique du CV par e-mail.
 *
 * Déployé en "Application Web" Google Apps Script (voir README-envoi-cv.md).
 * Le portfolio envoie { email, lang, website } en POST ; ce script :
 *   1. vérifie l'adresse et les garde-fous anti-abus,
 *   2. envoie au visiteur un e-mail soigné avec le CV et la lettre de motivation
 *      en pièces jointes, dans la langue choisie (fr ou en),
 *   3. te prévient (adresse de notification) qu'un CV vient d'être envoyé.
 */

const CONFIG = {
  // PDF publiés sur GitHub Pages (les fichiers sont à la racine du dépôt portfolio)
  BASE_URL: 'https://filou337.github.io/portfolio/',
  ATTACHMENTS: {
    fr: [
      { file: 'CV_Philippe_ROUMBO_Analytics_Engineer_FR.pdf', name: 'CV_Philippe_ROUMBO_Analytics_Engineer.pdf' },
      { file: 'LM_Philippe_ROUMBO_Analytics_Engineer_FR.pdf', name: 'LM_Philippe_ROUMBO_Analytics_Engineer.pdf' }
    ],
    en: [
      { file: 'CV_Philippe_ROUMBO_Analytics_Engineer_EN.pdf', name: 'Resume_Philippe_ROUMBO_Analytics_Engineer.pdf' },
      { file: 'Cover_Letter_Philippe_ROUMBO_Analytics_Engineer_EN.pdf', name: 'Cover_Letter_Philippe_ROUMBO_Analytics_Engineer.pdf' }
    ]
  },
  SENDER_NAME: 'Philippe Roumbo',
  REPLY_TO: 'roumbop@gmail.com',
  NOTIFY_TO: 'roumbop@gmail.com',      // mets '' pour ne pas être notifié
  PORTFOLIO_URL: 'https://filou337.github.io/portfolio/',
  LINKEDIN_URL: 'https://www.linkedin.com/in/philippe-roumbo-69b42a2ab/',
  PHONE: '+33 7 49 23 33 72',
  MAX_PER_DAY: 40,                     // plafond global d'envois par jour
  SAME_EMAIL_COOLDOWN_H: 12            // une même adresse ne reçoit le CV qu'une fois / 12 h
};

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    const lang = body.lang === 'en' ? 'en' : 'fr';

    // Champ piège invisible : un humain ne le remplit jamais.
    if (body.website) return json_({ ok: true });

    if (!/^[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[a-z]{2,}$/i.test(email) || email.length > 120) {
      return json_({ ok: false, error: 'invalid_email' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const cache = CacheService.getScriptCache();
      const key = 'sent_' + Utilities.base64EncodeWebSafe(email);
      if (cache.get(key)) return json_({ ok: true, already: true });

      const props = PropertiesService.getScriptProperties();
      const today = Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd');
      const count = props.getProperty('day') === today ? Number(props.getProperty('count') || 0) : 0;
      if (count >= CONFIG.MAX_PER_DAY || MailApp.getRemainingDailyQuota() < 2) {
        return json_({ ok: false, error: 'quota' });
      }

      sendCv_(email, lang);
      props.setProperties({ day: today, count: String(count + 1) });
      cache.put(key, '1', CONFIG.SAME_EMAIL_COOLDOWN_H * 3600);
    } finally {
      lock.releaseLock();
    }

    if (CONFIG.NOTIFY_TO) {
      MailApp.sendEmail({
        to: CONFIG.NOTIFY_TO,
        subject: 'Portfolio : CV + LM envoyés à ' + email + ' (' + lang.toUpperCase() + ')',
        body: 'Ton CV et ta lettre de motivation viennent d\'être envoyés automatiquement à ' + email + ' (langue : ' + lang + ') depuis ton portfolio.\n\n'
            + 'Pense à le relancer dans quelques jours si c\'est un recruteur.'
      });
    }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

// Permet de vérifier dans le navigateur que le déploiement répond.
function doGet() {
  return json_({ ok: true, service: 'cv-mailer' });
}

function sendCv_(to, lang) {
  const attachments = CONFIG.ATTACHMENTS[lang].map(a =>
    UrlFetchApp.fetch(CONFIG.BASE_URL + a.file + '?v=' + Date.now()).getBlob().setName(a.name));
  const t = TEXT[lang];
  MailApp.sendEmail({
    to: to,
    name: CONFIG.SENDER_NAME,
    replyTo: CONFIG.REPLY_TO,
    subject: t.subject,
    body: t.plain,
    htmlBody: html_(t),
    attachments: attachments
  });
}

const TEXT = {
  fr: {
    subject: 'Ma candidature — Philippe Roumbo, Analytics Engineer junior',
    hello: 'Bonjour,',
    p1: 'Merci d\'avoir pris le temps de parcourir mon portfolio. Comme promis, vous trouverez en pièces jointes mon CV et ma lettre de motivation.',
    p2: 'Je recherche un poste d\'<b>Analytics Engineer junior en CDI</b>, en Île-de-France, en hybride ou sur site. Je construis des pipelines sur Databricks et Azure Data Factory en architecture Bronze / Silver / Gold, je fiabilise les données et je les valorise dans Power BI.',
    p3: 'Si mon profil correspond à l\'un de vos besoins, je serais ravi d\'en discuter avec vous. Il vous suffit de répondre à ce message ou de m\'appeler.',
    bye: 'Bien cordialement,',
    cta: 'Revoir le portfolio',
    phone: 'Téléphone',
    plain: 'Bonjour,\n\nMerci d\'avoir pris le temps de parcourir mon portfolio. Comme promis, vous trouverez en pièces jointes mon CV et ma lettre de motivation.\n\n'
         + 'Je recherche un poste d\'Analytics Engineer junior en CDI, en Île-de-France, en hybride ou sur site.\n\n'
         + 'Si mon profil correspond à l\'un de vos besoins, je serais ravi d\'en discuter avec vous : il vous suffit de répondre à ce message.\n\n'
         + 'Bien cordialement,\nPhilippe Roumbo\n+33 7 49 23 33 72\nhttps://filou337.github.io/portfolio/'
  },
  en: {
    subject: 'My application — Philippe Roumbo, Junior Analytics Engineer',
    hello: 'Hello,',
    p1: 'Thank you for taking the time to visit my portfolio. As promised, my resume and cover letter are attached to this email.',
    p2: 'I am looking for a <b>permanent Junior Analytics Engineer role</b> in the Paris area, hybrid or on-site. I build pipelines on Databricks and Azure Data Factory with a Bronze / Silver / Gold architecture, make data reliable and turn it into Power BI insights.',
    p3: 'If my profile matches one of your needs, I would be glad to talk. Simply reply to this email or give me a call.',
    bye: 'Best regards,',
    cta: 'Back to the portfolio',
    phone: 'Phone',
    plain: 'Hello,\n\nThank you for taking the time to visit my portfolio. As promised, my resume and cover letter are attached to this email.\n\n'
         + 'I am looking for a permanent Junior Analytics Engineer role in the Paris area, hybrid or on-site.\n\n'
         + 'If my profile matches one of your needs, I would be glad to talk: simply reply to this email.\n\n'
         + 'Best regards,\nPhilippe Roumbo\n+33 7 49 23 33 72\nhttps://filou337.github.io/portfolio/'
  }
};

// E-mail aux couleurs du portfolio ("sables nocturnes"), en tableaux pour Gmail/Outlook.
function html_(t) {
  const strata = ['#C99A2E', '#A8A491', '#9C6630', '#4A3F22']
    .map(c => '<td style="height:6px;background:' + c + ';"></td>').join('');
  return ''
  + '<div style="background:#F4E8C1;padding:28px 12px;font-family:Segoe UI,Helvetica,Arial,sans-serif;">'
  + '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#FCF5DF;border:1px solid #E2D4A8;border-radius:14px;overflow:hidden;">'
  + '<tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' + strata + '</tr></table></td></tr>'
  + '<tr><td style="padding:28px 30px 8px;">'
  +   '<div style="font-size:22px;font-weight:800;color:#2E2712;">Philippe Roumbo<span style="color:#C99A2E;">.</span></div>'
  +   '<div style="font-size:14px;font-weight:600;color:#574A24;margin-top:2px;">Analytics Engineer junior · Databricks · Azure · Power BI</div>'
  + '</td></tr>'
  + '<tr><td style="padding:16px 30px 6px;font-size:15px;line-height:1.6;color:#2E2712;">'
  +   '<p style="margin:0 0 14px;">' + t.hello + '</p>'
  +   '<p style="margin:0 0 14px;">' + t.p1 + '</p>'
  +   '<p style="margin:0 0 14px;">' + t.p2 + '</p>'
  +   '<p style="margin:0 0 18px;">' + t.p3 + '</p>'
  +   '<p style="margin:0 0 22px;">' + t.bye + '<br><b>Philippe Roumbo</b></p>'
  +   '<a href="' + CONFIG.PORTFOLIO_URL + '" style="display:inline-block;background:#574A24;color:#FAE8B4;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:9px;">' + t.cta + ' →</a>'
  + '</td></tr>'
  + '<tr><td style="padding:22px 30px 26px;font-size:13px;color:#6F6650;border-top:1px solid #E2D4A8;">'
  +   'Email : <a href="mailto:' + CONFIG.REPLY_TO + '" style="color:#574A24;">' + CONFIG.REPLY_TO + '</a><br>'
  +   t.phone + ' : ' + CONFIG.PHONE + '<br>'
  +   'LinkedIn : <a href="' + CONFIG.LINKEDIN_URL + '" style="color:#574A24;">in/philippe-roumbo</a>'
  + '</td></tr>'
  + '</table></div>';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** À lancer une fois depuis l'éditeur : autorise le script et t'envoie les deux e-mails de test (FR et EN). */
function testEnvoi() {
  sendCv_(CONFIG.NOTIFY_TO, 'fr');
  sendCv_(CONFIG.NOTIFY_TO, 'en');
}
