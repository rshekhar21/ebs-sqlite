import { createStock } from './all.js';
import help, { controlBtn, displayDatatable, doc, fetchTable, isRrestricted, jq, log, pageHead, parseData } from './help.js';

doc.addEventListener('DOMContentLoaded', () => {
    pageHead({
        title: 'STOCK',
    })

    controlBtn({
        buttons: [
            {
                title: 'Add',
                cb: async ()=>{
                    await createStock();
                    await loadData();
                }
            }
        ]
    })

    loadData();
})

//9266847931 SIDDHANTH

async function loadData() {
    try {
        let res = await fetchTable({ key: 'stock' }, true, true, null);
        res ? showData(res) : jq('#root').addClass('text-center').html('No Data/Records Found!');
        jq('div.process').addClass('d-none');
    } catch (error) {
        log(error);
    }
}

function showData(data) {
    try { 
        let { table, tbody, thead } = data
        parseData({
            tableObj: data,
            colsToShow: [`id`, `sku`, `product`, `pcode`, `mrp`, `price`, `wsp`, `gst`, `size`, `discount`, `disc_type`, `brand`, `colour`, `label`, `section`, `season`, `category`, `upc`, `hsn`, `unit`, `prchd_on`, `purch_id`, `bill_number`, `supid`, `supplier`, `ean`, `cost`, `purch_price`, `cost_gst`, `qty`, `sold`, `defect`, `returned`, `available`,],
            colsToParse: ['price', 'mrp', 'wsp', 'gst', 'qty', 'sold', 'returned', 'available', 'discount'],
            colsToHide: ['purch_id', 'supid', 'cost', 'purch_price', 'cost_gst', 'bill_number', 'prchd_on'],
            hideBlanks: ['wsp', 'mrp', 'gst', 'size', 'discount', 'disc_type', 'brand', 'colour', 'label', 'section', 'season', 'category', 'upc', 'ean', 'hsn', 'unit', 'purch_on', 'supplier', 'defect', 'returned'],
            alignRight: true,
            colsToRight: ['disc_type', 'ean'],
            colsTitle: [
                { col: 'wsp', title: 'Whole Sale Price' },
                { col: 'ean', title: 'Barcode Number' },
                { col: 'gr', title: 'Goods Return' },
                { col: 'pcode', title: 'Product Code' },
                { col: 'price', title: 'Selling Price' },
            ],
            colsToRename: [
                { old: 'available', new: 'avl' },
                { old: 'returned', new: 'gr' },
                { old: 'discount', new: 'disc' },
            ]
        })

        jq(tbody).find(`[data-key="id"]`).addClass('text-primary role-btn').each(function (i, e) {
            jq(e).click(function () {
                let { id, sku, sold } = data.data[i];
                help.popListInline({
                    el: this, li: [
                        { key: 'Edit', id: 'editStock' },
                        { key: 'Set Classic SKU', id: 'classicSKU' },
                        { key: 'Set Dynamic SKU', id: 'dynamciSKU' },
                        { key: 'Delete', id: 'delete' },
                        { key: 'Cancel' },
                    ]
                })

                if (sku.length > 6) jq('#dynamciSKU').addClass('disabled');
                if (sku.length < 6) jq('#classicSKU').addClass('disabled');

                if (sold) { jq('#classicSKU, #delete, #dynamciSKU').addClass('disabled'); }


                jq('#editStock').click(async function () {
                    try {
                        if (await isRrestricted('ChkBjNwf')) return;
                        // let db = new xdb(storeId, 'stock'); //log(id);
                        // let [arr] = await db.getColumns({ key: id, indexes: ['id'], columns: ['id', 'purch_id'], limit: 1, });
                        let table = 'stock';
                        if (arr.purch_id) { table = 'purchStockEdit' }; //log(table);

                        let res = await createStuff({
                            title: 'Edit Stock',
                            table: table,
                            applyButtonText: 'Update',
                            url: '/api/crud/update/stock',
                            focus: '#product',
                            qryObj: { key: 'editStock', values: [id] },
                            applyCallback: _loadSrchstock,
                            applyCBPrams: id,
                            hideFields: ['sizeGroup'],
                            cb: loadData,
                        });

                        let mb = res.mb;

                        setEditStockBody(mb);

                    } catch (error) {
                        log(error);
                    }
                })

                jq('#delete').click(async function () {
                    if (await isRrestricted('BcmUCgFW')) return;
                    let key = jq('#search').val();
                    _delStock(id, () => loadData(key));
                })

                jq('#classicSKU').click(async function () {
                    try {
                        if (await isRrestricted('ChkBjNwf')) return;
                        let cnf = confirm('Update to Classic SKU?');
                        if (!cnf) return;
                        let { data: res } = await postData({ url: '/api/set-classic-sku', data: { data: { id } } });
                        if (!res.affectedRows) { showErrors('Error Updating SKU!\nOnly Unsold Article/Item is allowed to Change/Update SKU!', 7000); return; }
                        let { data } = await advanceQuery({ key: 'getstock_byid', values: [id] });
                        let db = new xdb(storeId, 'stock');
                        await db.put(data);
                        loadData();
                    } catch (error) {
                        log(error);
                    }
                })

                jq('#dynamciSKU').click(async function () {
                    try {
                        if (await isRrestricted('ChkBjNwf')) return;
                        let cnf = confirm('Update to Dynamic SKU?');
                        if (!cnf) return;
                        let { data: res } = await postData({ url: '/api/set-dynamic-sku', data: { data: { id } } });
                        if (!res.affectedRows) { showErrors('Error Updating SKU!\nOnly Unsold Article/Item is allowed to Change/Update SKU!', 7000); return; }
                        let { data } = await advanceQuery({ key: 'getstock_byid', values: [id] });
                        let db = new xdb(storeId, 'stock');
                        await db.put(data);
                        loadData();
                    } catch (error) {
                        log(error);
                    }
                })
            })
        })

        displayDatatable(table, 'container-fluid');
        jq(table).find(`[data-key="sku"]`).addClass('position-sticky start-0');
    } catch (error) {
        log(error);
    }
}