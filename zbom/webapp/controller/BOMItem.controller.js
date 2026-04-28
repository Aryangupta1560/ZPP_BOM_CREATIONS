sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("zbom.controller.BOMItem", {

        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("RouteBOMItem").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this.sBomId = oEvent.getParameter("arguments").BomId;
        },

        onAddItem: function () {
            var oModel = this.getView().getModel();

            var oData = {
                BomId: this.sBomId,
                ItemCategory: this.byId("itemCat").getValue(),
                Component: this.byId("component").getValue(),
                Quantity: this.byId("qty").getValue(),
                Uom: this.byId("uom").getValue()
            };

            oModel.create("/ZC_BOM_ITEM", oData, {
                success: function () {
                    MessageToast.show("Item Added");
                }
            });
        }

    });
});