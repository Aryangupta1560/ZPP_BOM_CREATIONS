sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function (Controller, History, MessageToast) {
    "use strict";

    return Controller.extend("zbom.controller.BOMDetail", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {

    var sBomId = oEvent.getParameter("arguments").BomId;
    var oView = this.getView();

    var sPath = "/ZC_BOM_HEADER(guid'" + sBomId + "')";

    console.log("BomId:", sBomId);
    console.log("Binding Path:", sPath);

    oView.setBusy(true);

    // optional refresh
    oView.getModel().refresh(true);

    oView.bindElement({
        path: sPath,

        parameters: {
            expand: "to_Item" // ✅ correct
        },

        events: {
            dataRequested: function () {
                oView.setBusy(true);
            },
            dataReceived: function () {
                oView.setBusy(false);
            }
        }
    });
},

        // 🔙 BACK
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        },

        // ➕ CREATE ITEM (optional)
      onCreateItem: function () {
    var oContext = this.getView().getBindingContext();
    var sBomId = oContext.getProperty("BomId"); // GUID extract karein

    this.getOwnerComponent().getRouter().navTo("RouteItem", {
        BomId: sBomId
    });
}

    });
});