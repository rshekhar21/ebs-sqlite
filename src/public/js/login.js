import { log, doc, fd2obj, postData, quickPost, jq, Storage, advanceQuery } from './help.js';

doc.addEventListener('DOMContentLoaded', () => {
    let rm = Storage.get('remember_me');
    if (rm) {
        jq('#username').val(rm);
        jq('#password')[0].focus();
        jq('#remember').attr('checked', true);
    } else {
        jq('#username')[0].focus();
    }

    jq('#login').on('submit', async function (e) {
        e.preventDefault();
        try {
            let data = fd2obj({ form: this });
            let res = await quickPost({ url: '/login', data });
            let remember = jq('#remember').is(':checked');
            if (!res) {
                jq('div.status').removeClass('d-none').text('Invalid Username/Password !');
                return;
            }
            remember ? Storage.set('remember_me', data.username) : Storage.set('remember_me', null)
            window.location.href = '/auth/home';
        } catch (error) {
            log(error);
        }
    })

    // advanceQuery({ key: 'usersList' }).then(data=>log(data.data)).catch(err=>log(err));

})