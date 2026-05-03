sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function (Controller, History, MessageToast) {
    "use strict";

    return Controller.extend("zbom.controller.BOMItem", {
        onInit: function () {
            var oModel = new sap.ui.model.json.JSONModel({ items: [] });
            this.getView().setModel(oModel);
        },

        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        },

        onAddRow: function () {
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            aItems.push({ item: (aItems.length + 1) * 10, component: "", quantity: 1 });
            oModel.refresh();
        },

        onSave: function () {
            MessageToast.show("Data Saved");
        }
    });
});