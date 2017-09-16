function randomString(length, kind) {
    var i,
        str = '', 
        opts = kind || 'aA#',
        possibleChars = '';

    if (kind.indexOf('*') > -1) opts = 'aA#!'; // use all possible charsets

    // Collate charset to use
    if (opts.indexOf('#') > -1) possibleChars += '0123456789';
    if (opts.indexOf('a') > -1) possibleChars += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.indexOf('A') > -1) possibleChars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.indexOf('!') > -1) possibleChars += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';

    for(i = 0; i < length; i++) {
      str += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }

    return str;

  }

  export default randomString