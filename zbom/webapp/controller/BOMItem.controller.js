sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("zbom.controller.BOMItem", {
        
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            // Route match hone par _onObjectMatched call hoga
            oRouter.getRoute("RouteItem").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // Parent BOM ID ko argument se capture karna
            this._sBomId = oEvent.getParameter("arguments").BomId;
        },

onCreateItem: function () {
    const oModel = this.getView().getModel();

    const oData = {
ItemCategory: this.byId("itmCategoryInput").getSelectedKey(),
        Component: this.byId("itmComponentInput").getValue(),
        MaterialDesc: this.byId("itmMatDescInput").getValue(),
        Quantity: parseFloat(this.byId("itmQtyInput").getValue()), // IMPORTANT
        Uom: this.byId("itmUomInput").getValue(),
        SortString: this.byId("itmShortStringInput").getValue(),
        ItemText: this.byId("itmTextInput").getValue(),
        SelectedFlag: this.byId("itmFlagInput").getValue()
    };

    const sPath = "/ZC_BOM_HEADER(guid'" + this._sBomId + "')/_Item";

    oModel.create(sPath, oData, {
        success: () => {
            sap.m.MessageToast.show("Item Created");
            this.onNavBack();
        },
        error: (oError) => {
            console.error(oError);
            sap.m.MessageToast.show("Error creating item");
        }
    });
},

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // Agar history na ho toh parent detail page par bhejein
                this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                    BomId: this._sBomId
                }, true);
            }
        }
    });
});