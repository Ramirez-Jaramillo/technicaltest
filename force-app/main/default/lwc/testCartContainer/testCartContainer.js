import { LightningElement, track, api } from 'lwc';
import cardCanvasLayout from "vlocity_cmt/cardCanvasLayout";
import * as _ from 'vlocity_cmt/lodash'; 
import { OmniscriptActionCommonUtil } from 'vlocity_cmt/omniscriptActionUtils';
import temp from "./testCartContainer.html";
import pubsub from 'vlocity_cmt/pubsub';

export default class testCartContainer extends cardCanvasLayout {
    @api recordId;
    @api enableButtonValue;
    
    @track cartid;
    @track showProductsIfDraft;
    
    connectedCallback() {
        this._actionUtilClass = new OmniscriptActionCommonUtil();
        this.cartid = this.recordId;
        this.triggerGetOrderStatus();
   }
    
    render() {
        return temp;
    }

    searchCard = (event) => {
       const recordName = event.target.value;
       setTimeout(this.searchName(recordName), 500);
    }

    searchName(recordName) {
        this.allRecords = this.allRecords ? this.allRecords : this.records;
        if (this.allRecords) {
            if (recordName) {
                let data = [...this.allRecords];
                let filteredRecords = [];
                data.forEach(element => {
                    let val = element['Name'];
                    if (val && typeof val == "string" && val.indexOf(recordName) !== -1) {
                        filteredRecords.push(element);
                    }
                });
                this.records = filteredRecords;
            } else {
                this.records = [...this.allRecords];
            }
            this.setCardsRecords();
        }     
    }

    triggerGetOrderStatus() {
        console.log("Get Order Status");
        let input = {
            "cartId" : this.cartid
        }
        const params = {
            input: JSON.stringify(input),
            sClassName: 'vlocity_cmt.IntegrationProcedureService',
            sMethodName: 'CPQ_getOrderStatus',
            options: '{}',
        };
        this._actionUtilClass
            .executeAction(params, null, this, null, null)
            .then(resp => {
                console.log("Reponse Order Status", resp);
                this.enableButtonValue = '';
                if (resp.result.IPResult == 'Activated') {
                    this.enableButtonValue = 'disabled';
                    this.showProductsIfDraft = false;
                } else {
                    this.enableButtonValue = '';
                    this.showProductsIfDraft = true;
                }
            })
            .catch(error => {
                window.console.log(error);
        });
    }
}