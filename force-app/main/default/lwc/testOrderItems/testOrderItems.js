import { LightningElement, api, track} from 'lwc';
import * as _ from 'vlocity_cmt/lodash'; 
import { OmniscriptActionCommonUtil } from 'vlocity_cmt/omniscriptActionUtils';
import pubsub from 'vlocity_cmt/pubsub';

export default class TestOrderItems extends LightningElement {
    showError = false;
    @track _cartid;
    @track _buttonEnabled;
    @api
    get cartid() {
        return this._cartid;
    }
    set cartid(val) {
        this._cartid = val;
    }
    @api
    get buttonEnabled() {
        return this._buttonEnabled;
    }
    set buttonEnabled(val) {
        this._buttonEnabled = val;
    }
    @api orderItems = [];

    _pubSubObj;
    showSpinner = false;

    connectedCallback() {
        this._actionUtilClass = new OmniscriptActionCommonUtil();
        this.triggerRemote();

        this._pubSubObj = {
            refresh: this.triggerRemote.bind(this)
        };

        pubsub.register('RefreshCart', this._pubSubObj);
    }
    
    triggerRemote() {
        this.showSpinner = true;
        console.log("Get Cart Items");
        let input = {
            "cartId" : this._cartid
        }
        const params = {
            input: JSON.stringify(input),
            sClassName: 'vlocity_cmt.IntegrationProcedureService',
            sMethodName: 'CPQ_getCartItems',
            options: '{}',
        };
        this._actionUtilClass
            .executeAction(params, null, this, null, null)
            .then(resp => {
                this.orderItems = resp.result.IPResult.records;
                this.showSpinner = false;
            })
            .catch(error => {
                window.console.log(error);
            });
    }

    confirmOrder(event) {
        this.showSpinner = true;
        let input = {
            "cartId" : this._cartid
        }
        const params = {
            input: JSON.stringify(input),
            sClassName: 'vlocity_cmt.IntegrationProcedureService',
            sMethodName: 'CPQ_confirmOrder',
            options: '{}',
        };
        this._actionUtilClass
            .executeAction(params, null, this, null, null)
            .then(resp => {
                this.showSpinner = false;
                if (resp.result.IPResult == 200) {
                    this.showError = false;
                    window.location.reload();
                } else {
                    this.showError = true;
                }
            })
            .catch(error => {
                window.console.log(error);
            });
    }

    disconnectedCallback() {
        pubsub.unregister('RefreshCart', this._pubSubObj);
    }

}