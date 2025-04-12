import { createStuff, doc, isRrestricted, jq, log } from './help.js';

export async function createStock(){
    try {
        if (await isRrestricted('gibIeSGN')) return;
        let res = await createStuff({
            title: 'Add New Stock',
            table: 'stock',
            url: '/auth/crud/create/stock',
            focus: '#product',
            hideFields: [],
        })
        let mb = res.mb;
        setbody(mb);
    } catch (error) {
       log(error);
       return false; 
    }
}

function setbody(mb) {
    jq(mb).find('div.pcode').after('<div class="d-flex jcb aic gap-3 odd size-group w-100"></div>');
    jq(mb).find('div.size, div.size_group').appendTo(jq(mb).find('div.size-group'));
    jq(mb).find('div.size_group, div.size').addClass('w-50');

    jq(mb).find('div.size-group').after('<div class="d-flex jcb aic gap-3 odd qty-cost"></div>');
    jq(mb).find('div.qty, div.cost').appendTo(jq(mb).find('div.qty-cost'));

    jq(mb).find('div.qty-cost').after('<div class="d-flex jcb aic gap-3 odd price-gst"></div>');
    jq(mb).find('div.price, div.gst').appendTo(jq(mb).find('div.price-gst'));

    jq(mb).find('div.price-gst').after('<div class="d-flex jcb aic gap-3 odd wsp-mrp"></div>');
    jq(mb).find('div.wsp, div.mrp').appendTo(jq(mb).find('div.wsp-mrp'));

    jq(mb).find('div.wsp-mrp').after('<div class="d-flex jcb aic gap-3 odd disc-per w-100"></div>');
    jq(mb).find('div.discount, div.disc_type').appendTo(jq(mb).find('div.disc-per'));
    jq(mb).find('div.discount, div.disc_type').addClass('w-50');

    jq(mb).find('div.brand').after('<div class="d-flex jcb aic gap-3 even sec-sea"></div>');
    jq(mb).find('div.section, div.season').appendTo(jq(mb).find('div.sec-sea'));

    jq(mb).find('div.sec-sea').after('<div class="d-flex jcb aic gap-3 even cat-col"></div>');
    jq(mb).find('div.category, div.colour').appendTo(jq(mb).find('div.cat-col'));

    jq(mb).find('div.cat-col').after('<div class="d-flex jcb aic gap-3 even upc-label"></div>');
    jq(mb).find('div.upc, div.label').appendTo(jq(mb).find('div.upc-label'));

    jq(mb).find('div.upc-label').after('<div class="d-flex jcb aic gap-3 even hsn-unit"></div>');
    jq(mb).find('div.hsn, div.unit').appendTo(jq(mb).find('div.hsn-unit'));
}