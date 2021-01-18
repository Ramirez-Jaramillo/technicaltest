import { LightningElement, track, api } from 'lwc';
import cardActiveState from "vlocity_cmt/cardActiveState";
import temp from "./testProductList.html";
import * as _ from 'vlocity_cmt/lodash'; 
import { OmniscriptActionCommonUtil } from 'vlocity_cmt/omniscriptActionUtils';
import pubsub from 'vlocity_cmt/pubsub';

export default class TestProductLit  extends cardActiveState {
    @api orderItemExisting = [];
    @track enableButtonValue;
    @track showButton;
    // @track enableButtonValue;
    
    showSpinner = false;
    _pubSubObj;
    
    connectedCallback() {
        this._actionUtilClass = new OmniscriptActionCommonUtil();
    }

    render() {
        return temp;
    }

    trackInteraction(event) {
        let element = event.target;
        this.triggerRemote();
    }

    triggerRemote() {
        this.showSpinner = true;
        let input = {
            "query" : this.obj.Name.value,
            "cartId" : this.obj.actions.addtocart.remote.params.cartId
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
                if (resp.result.IPResult.totalSize > 0) {
                    this.orderItemExisting = resp.result.IPResult;
                    this.orderItemExisting.records[0].Quantity.value += 1;
                    this.triggerRemotePutCartItem();
                } else if (resp.result.IPResult.totalSize == 0) {
                    this.triggerRemotePostCartItem();
                }
            })
            .catch(error => {
                window.console.log(error);
            });
    }

    triggerRemotePostCartItem() {
        let input = {
            "itemId" : this.obj.Id.value,
            "cartId" : this.obj.actions.addtocart.remote.params.cartId
        }
        const params = {
            input: JSON.stringify(input),
            sClassName: 'vlocity_cmt.IntegrationProcedureService',
            sMethodName: 'CPQ_postCartItem',
            options: '{}',
        };

        this._actionUtilClass
            .executeAction(params, null, this, null, null)
            .then(resp => {
                pubsub.fire('RefreshCart', 'refresh', true);
                this.showSpinner = false;
            })
            .catch(error => {
                window.console.log(error);
            });
    }

    triggerRemotePutCartItem() {
        let input = {
            "items" : this.orderItemExisting,
            "cartId" : this.obj.actions.addtocart.remote.params.cartId
        }
        const params = {
            input: JSON.stringify(input),
            sClassName: 'vlocity_cmt.IntegrationProcedureService',
            sMethodName: 'CPQ_putCartItems',
            options: '{}',
        };

        this._actionUtilClass
            .executeAction(params, null, this, null, null)
            .then(resp => {
                pubsub.fire('RefreshCart', 'refresh', true);
                this.showSpinner = false;
            })
            .catch(error => {
                window.console.log(error);
            });
    }
}